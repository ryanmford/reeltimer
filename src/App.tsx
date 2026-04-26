import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Film, Timer } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

// Internal
import { 
  Resolution, ExportStatus, StopwatchFont, TimerSettings, TimerUnit, Position, 
  RESOLUTIONS, FPS_OPTIONS 
} from './types';
import { Hero } from './components/Hero';
import { Sidebar } from './components/Sidebar';
import { VideoPreview } from './components/VideoPreview';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const STORAGE_KEY = 'reeltime_settings';

  const getInitial = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed[key] !== undefined ? parsed[key] : defaultValue;
      }
    } catch (e) {
      console.warn("Storage error:", e);
    }
    return defaultValue;
  };

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [stopTime, setStopTime] = useState<number | null>(null);
  
  const [font, setFont] = useState<StopwatchFont>(() => getInitial('font', 'font-mono'));
  const [textColor, setTextColor] = useState(() => getInitial('textColor', '#ffffff'));
  const [showBg, setShowBg] = useState(() => getInitial('showBg', true));
  const [bgColor, setBgColor] = useState(() => getInitial('bgColor', '#000000'));
  const [bgOpacity, setBgOpacity] = useState(() => getInitial('bgOpacity', 0.5));
  const [borderRadius, setBorderRadius] = useState(() => getInitial('borderRadius', 12));
  const [fontSize, setFontSize] = useState(() => getInitial('fontSize', 48));

  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => getInitial('timerSettings', {
    hours: false,
    minutes: false,
    seconds: true,
    tenths: true,
    hundredths: true,
    thousandths: false
  }));
  const [manualFinalTime, setManualFinalTime] = useState<string>('');
  const [showOverrideHelp, setShowOverrideHelp] = useState(false);
  const [position, setPosition] = useState<Position>(() => getInitial('position', { x: 50, y: 10 }));
  const [exportRes, setExportRes] = useState<Resolution>(() => {
    const saved = getInitial('exportRes', RESOLUTIONS[0].label);
    return RESOLUTIONS.find(r => r.label === saved) || RESOLUTIONS[0];
  });
  const [exportFps, setExportFps] = useState<number>(() => getInitial('exportFps', 60));
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [videoDimensions, setVideoDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    const config = {
      font, textColor, showBg, bgColor, bgOpacity, borderRadius, fontSize, position, 
      exportRes: exportRes.label, exportFps,
      timerSettings
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [font, textColor, showBg, bgColor, bgOpacity, borderRadius, fontSize, position, exportRes, exportFps, timerSettings]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playheadRef = useRef<number | null>(null);
  const renderRef = useRef<number | null>(null);
  const isAbortedRef = useRef(false);

  // Time formatting logic
  const formatTime = useCallback((totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const ms = Math.floor((totalSeconds % 1) * 1000 + 0.0001);
    const tenths = Math.floor(ms / 100);
    const hundredths = Math.floor((ms % 100) / 10);
    const thousandths = ms % 10;

    const parts: string[] = [];
    if (timerSettings.hours) parts.push(h.toString().padStart(2, '0'));
    if (timerSettings.minutes) parts.push(m.toString().padStart(2, '0'));
    if (timerSettings.seconds) parts.push(s.toString().padStart(2, '0'));

    let timeStr = parts.join(':');
    const decimalParts: string[] = [];
    if (timerSettings.tenths) decimalParts.push(tenths.toString());
    if (timerSettings.hundredths) decimalParts.push(hundredths.toString());
    if (timerSettings.thousandths) decimalParts.push(thousandths.toString());

    if (decimalParts.length > 0) timeStr += `.${decimalParts.join('')}`;
    return timeStr || '0';
  }, [timerSettings]);

  const handleSetStartTime = () => {
    const time = videoRef.current?.currentTime || 0;
    if (stopTime !== null && time > stopTime) setStopTime(null);
    setStartTime(time);
  };

  const handleSetStopTime = () => {
    const time = videoRef.current?.currentTime || 0;
    if (startTime !== null && time < startTime) {
      setStopTime(startTime);
      setStartTime(time);
    } else {
      setStopTime(time);
    }
  };

  const drawStopwatch = useCallback((
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    time: number
  ) => {
    const endLimit = stopTime !== null ? stopTime : duration;
    let clockTime = 0;
    if (startTime !== null && time >= startTime) {
      clockTime = Math.max(0, Math.min(time - startTime, endLimit - startTime));
      if (time >= endLimit && manualFinalTime !== '') {
        const parsed = parseFloat(manualFinalTime);
        if (!isNaN(parsed)) clockTime = parsed;
      }
    }

    const clockStr = formatTime(clockTime);
    const scale = canvasHeight / 1080;
    const actualFontSize = fontSize * scale;
    const fontStack = font === 'font-mono' ? 'JetBrains Mono' : font === 'font-display' ? 'Outfit' : font === 'font-serif' ? 'serif' : 'Inter';
    ctx.font = `bold ${actualFontSize}px ${fontStack}`;
    
    const referenceParts: string[] = [];
    if (timerSettings.hours) referenceParts.push('00');
    if (timerSettings.minutes) referenceParts.push('00');
    if (timerSettings.seconds) referenceParts.push('00');
    let referenceStr = referenceParts.join(':');
    const decParts: string[] = [];
    if (timerSettings.tenths) decParts.push('0');
    if (timerSettings.hundredths) decParts.push('0');
    if (timerSettings.thousandths) decParts.push('0');
    if (decParts.length > 0) referenceStr += `.${decParts.join('')}`;

    const referenceMetrics = ctx.measureText(referenceStr || "00.00");
    const paddingX = actualFontSize * 0.5;
    const w = Math.ceil(referenceMetrics.width + paddingX * 2);
    const h = Math.ceil(actualFontSize * 1.4);
    const centerX = (canvasWidth * position.x) / 100;
    const centerY = (canvasHeight * position.y) / 100;
    const x = Math.round(centerX - w / 2);
    const y = Math.round(centerY - h / 2);

    if (showBg) {
      ctx.save();
      ctx.globalAlpha = bgOpacity;
      ctx.fillStyle = bgColor;
      const r = borderRadius * scale;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center'; 
    const textX = x + w / 2;
    const textY = y + h / 2 + (actualFontSize * 0.05);
    ctx.fillText(clockStr, Math.round(textX * 100) / 100, Math.round(textY * 100) / 100);
    ctx.restore();
  }, [startTime, stopTime, duration, fontSize, font, textColor, showBg, bgColor, bgOpacity, borderRadius, position, timerSettings, manualFinalTime, formatTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) return;
      const video = videoRef.current;
      if (!video) return;
      switch(e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) video.pause(); else video.play().catch(() => {});
          break;
        case 'KeyI': handleSetStartTime(); break;
        case 'KeyO': handleSetStopTime(); break;
        case 'ArrowLeft': e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - (1 / exportFps)); break;
        case 'ArrowRight': e.preventDefault(); video.currentTime = Math.min(duration, video.currentTime + (1 / exportFps)); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, startTime, stopTime, currentTime, duration, exportFps]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const update = () => { if (video && isPlaying) { setCurrentTime(video.currentTime); playheadRef.current = requestAnimationFrame(update); } };
    if (isPlaying) playheadRef.current = requestAnimationFrame(update);
    else { if (playheadRef.current) cancelAnimationFrame(playheadRef.current); if (videoRef.current) setCurrentTime(videoRef.current.currentTime); }
    return () => { if (playheadRef.current) cancelAnimationFrame(playheadRef.current); };
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => { if (!canvas || !video) return; ctx.clearRect(0, 0, canvas.width, canvas.height); drawStopwatch(ctx, canvas.width, canvas.height, video.currentTime); renderRef.current = requestAnimationFrame(draw); };
    renderRef.current = requestAnimationFrame(draw);
    return () => { if (renderRef.current) cancelAnimationFrame(renderRef.current); };
  }, [drawStopwatch, videoSrc]);

  const handleExport = async () => {
    if (!videoRef.current || !videoFile) return;
    setExportStatus('processing');
    setExportProgress(0);
    isAbortedRef.current = false;
    try {
      const video = videoRef.current;
      const sourceWidth = videoDimensions.width;
      const sourceHeight = videoDimensions.height;
      const isVertical = sourceHeight > sourceWidth;
      let width, height;
      if (isVertical) { height = exportRes.width; width = Math.round(height * (sourceWidth / sourceHeight)); }
      else { width = exportRes.width; height = Math.round(width * (sourceHeight / sourceWidth)); }
      if (width % 2 !== 0) width--; if (height % 2 !== 0) height--;
      let hasError = false;
      let audioBuffer: AudioBuffer | null = null;
      try { const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); const arrayBuffer = await videoFile.arrayBuffer(); audioBuffer = await audioCtx.decodeAudioData(arrayBuffer); } catch (e) { console.warn("Audio skipped:", e); }
      if (isAbortedRef.current) return;
      const offscreen = new OffscreenCanvas(width, height);
      const ctx = offscreen.getContext('2d')!;
      const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: 'avc', width, height }, audio: audioBuffer ? { codec: 'aac', numberOfChannels: audioBuffer.numberOfChannels, sampleRate: audioBuffer.sampleRate } : undefined, fastStart: 'in-memory' });
      const videoEncoder = new VideoEncoder({ output: (chunk, metadata) => muxer.addVideoChunk(chunk, metadata), error: (e) => { hasError = true; setExportStatus('error'); } });
      let audioEncoder: AudioEncoder | null = null;
      if (audioBuffer) { audioEncoder = new AudioEncoder({ output: (chunk, metadata) => muxer.addAudioChunk(chunk, metadata), error: (e) => console.error(e) }); audioEncoder.configure({ codec: 'mp4a.40.2', numberOfChannels: audioBuffer.numberOfChannels, sampleRate: audioBuffer.sampleRate, bitrate: 128000 }); }
      try { videoEncoder.configure({ codec: 'avc1.640034', width, height, bitrate: 25_000_000, framerate: exportFps }); } catch (e) { videoEncoder.configure({ codec: 'avc1.42E01E', width, height, bitrate: 10_000_000, framerate: exportFps }); }
      if (audioEncoder && audioBuffer) {
        const samplesPerChunk = 2048;
        for (let i = 0; i < audioBuffer.length; i += samplesPerChunk) {
          if (isAbortedRef.current) break;
          const n = Math.min(samplesPerChunk, audioBuffer.length - i);
          const data = new Float32Array(n * audioBuffer.numberOfChannels);
          for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) data.set(audioBuffer.getChannelData(ch).subarray(i, i + n), ch * n);
          const audioData = new AudioData({ format: 'f32-planar', sampleRate: audioBuffer.sampleRate, numberOfFrames: n, numberOfChannels: audioBuffer.numberOfChannels, timestamp: Math.round((i / audioBuffer.sampleRate) * 1_000_000), data });
          audioEncoder.encode(audioData); audioData.close();
        }
        await audioEncoder.flush(); audioEncoder.close();
      }
      if (isAbortedRef.current) return;
      const totalFrames = Math.floor(duration * exportFps);
      const frameDuration = 1000000 / exportFps;
      for (let i = 0; i < totalFrames; i++) {
        if (hasError || isAbortedRef.current) break;
        const time = i / exportFps;
        video.currentTime = time;
        await new Promise((res, rej) => { const onSeeked = () => { video.removeEventListener('seeked', onSeeked); res(null); }; video.addEventListener('seeked', onSeeked); });
        ctx.drawImage(video, 0, 0, width, height);
        drawStopwatch(ctx, width, height, time);
        const frame = new VideoFrame(offscreen, { timestamp: Math.round(i * frameDuration) });
        videoEncoder.encode(frame); frame.close();
        if (i % 10 === 0) setExportProgress(Math.round(((i + 1) / totalFrames) * 100));
      }
      if (isAbortedRef.current) { videoEncoder.close(); return; }
      await videoEncoder.flush(); videoEncoder.close(); muxer.finalize();
      const { buffer } = muxer.target as ArrayBufferTarget;
      const blob = new Blob([buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `reeltime_export_${Date.now()}.mp4`; a.click();
      setExportStatus('completed');
    } catch (err) { setExportStatus('error'); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoSrc(URL.createObjectURL(file));
      setCurrentTime(0); setStartTime(null); setStopTime(null); setManualFinalTime('');
    }
  };

  return (
    <div className="h-screen flex flex-col font-sans overflow-hidden bg-[#050505] text-zinc-100">
      <header className="h-14 border-b border-zinc-900 px-4 md:px-6 flex items-center justify-between z-50 bg-[#0a0a0a]">
        <div 
          onClick={() => { setVideoSrc(null); setVideoFile(null); setExportStatus('idle'); setStartTime(null); setStopTime(null); setManualFinalTime(''); }}
          className="flex items-center gap-2 md:gap-3 cursor-pointer group"
        >
          <div className="w-7 h-7 md:w-8 md:h-8 bg-white rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 active:scale-95">
            <Film className="w-4 h-4 md:w-5 md:h-5 text-black" />
          </div>
          <h1 className="text-sm md:text-base font-display font-black tracking-tighter text-white uppercase truncate group-hover:opacity-80 transition-opacity flex items-center">
            REEL<span className="text-zinc-500 font-medium italic">TIME</span>
          </h1>
        </div>

        {videoSrc && (
          <div className="flex items-center gap-1.5 md:gap-3">
            <button 
              onClick={() => setExportStatus('preparing')}
              disabled={exportStatus !== 'idle'}
              className="bg-white text-black px-3 md:px-5 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {exportStatus === 'idle' ? (
                <>
                  <Download className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  <span>EXPORT</span>
                </>
              ) : (
                <span className="animate-pulse">{exportStatus === 'processing' ? `RENDERING ${exportProgress}%` : exportStatus === 'preparing' ? 'CONFIRMING...' : 'ERROR'}</span>
              )}
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {!videoSrc ? (
          <Hero onFileUpload={handleFileUpload} />
        ) : (
          <>
            <VideoPreview 
              videoRef={videoRef} canvasRef={canvasRef} videoSrc={videoSrc}
              duration={duration} currentTime={currentTime} setCurrentTime={setCurrentTime}
              isPlaying={isPlaying} setIsPlaying={setIsPlaying}
              videoDimensions={videoDimensions} setVideoDimensions={setVideoDimensions}
              setDuration={setDuration} startTime={startTime} setStartTime={setStartTime}
              stopTime={stopTime} setStopTime={setStopTime}
              handleSetStartTime={handleSetStartTime} handleSetStopTime={handleSetStopTime}
              formatTime={formatTime} exportFps={exportFps}
            />
            <Sidebar 
              font={font} setFont={setFont} textColor={textColor} setTextColor={setTextColor}
              showBg={showBg} setShowBg={setShowBg} bgColor={bgColor} setBgColor={setBgColor}
              bgOpacity={bgOpacity} setBgOpacity={setBgOpacity} borderRadius={borderRadius}
              fontSize={fontSize} setFontSize={setFontSize} position={position} setPosition={setPosition}
              timerSettings={timerSettings} setTimerSettings={setTimerSettings}
              startTime={startTime} setStartTime={setStartTime} stopTime={stopTime} setStopTime={setStopTime}
              currentTime={currentTime} manualFinalTime={manualFinalTime} setManualFinalTime={setManualFinalTime}
              formatTime={formatTime} showOverrideHelp={showOverrideHelp} setShowOverrideHelp={setShowOverrideHelp}
            />
          </>
        )}
      </main>

      <AnimatePresence>
        <ExportModal 
          exportStatus={exportStatus} setExportStatus={setExportStatus}
          exportProgress={exportProgress} exportRes={exportRes} setExportRes={setExportRes}
          exportFps={exportFps} setExportFps={setExportFps} handleExport={handleExport}
          duration={duration} isAbortedRef={isAbortedRef}
        />
      </AnimatePresence>
    </div>
  );
}
