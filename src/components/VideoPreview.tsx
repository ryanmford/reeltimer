import React from 'react';
import { Play, Pause, X } from 'lucide-react';
import { Position } from '../types';

interface VideoPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoSrc: string;
  duration: number;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  videoDimensions: { width: number; height: number };
  setVideoDimensions: (dims: { width: number; height: number }) => void;
  setDuration: (duration: number) => void;
  startTime: number | null;
  setStartTime: (time: number | null) => void;
  stopTime: number | null;
  setStopTime: (time: number | null) => void;
  handleSetStartTime: () => void;
  handleSetStopTime: () => void;
  formatTime: (time: number) => string;
  exportFps: number;
}

export const VideoPreview: React.FC<VideoPreviewProps> = (props) => {
  const {
    videoRef,
    canvasRef,
    videoSrc,
    duration,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    videoDimensions,
    setVideoDimensions,
    setDuration,
    startTime,
    setStartTime,
    stopTime,
    setStopTime,
    handleSetStartTime,
    handleSetStopTime,
    formatTime,
    exportFps
  } = props;

  return (
    <div className="h-[75vh] md:h-auto md:flex-1 flex flex-col bg-[#050505] relative min-h-0 overflow-hidden border-b md:border-b-0 border-zinc-900 shrink-0">
      <div className="flex-1 min-h-0 w-full flex items-center justify-center p-4 relative overflow-hidden">
        <div 
          className="relative shadow-[0_0_100px_rgba(0,0,0,1)] rounded-2xl overflow-hidden group"
          style={{ 
            aspectRatio: `${videoDimensions.width} / ${videoDimensions.height}`,
            maxHeight: '100%',
            maxWidth: '100%',
          }}
        >
          <video 
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full block pointer-events-none object-contain bg-black"
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              setDuration(video.duration);
              setVideoDimensions({
                width: video.videoWidth,
                height: video.videoHeight
              });
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onSeeked={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onEnded={() => setIsPlaying(false)}
            controls={false}
            playsInline
          />
          <canvas 
            ref={canvasRef}
            width={videoDimensions.width}
            height={videoDimensions.height}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          />
          
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setIsPlaying(true);
                  videoRef.current?.play();
                }}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-2xl hover:scale-110 transition-transform"
              >
                <Play className="w-8 h-8 fill-current" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-900 bg-[#000000] px-3 md:px-4 py-1.5 flex flex-col gap-1.5 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                if (isPlaying) {
                  video.pause();
                  setIsPlaying(false);
                } else {
                  video.play();
                  setIsPlaying(true);
                }
              }}
              className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <div className="flex items-baseline gap-1.5 ml-1">
              <span className="text-xl font-mono text-white font-black tabular-nums">{formatTime(currentTime)}</span>
              <span className="text-[10px] font-mono text-zinc-600 font-bold">/ {formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center group relative">
              <button 
                onClick={handleSetStartTime}
                className={`flex-1 sm:flex-none h-8 px-4 rounded-l-lg text-[9px] font-black uppercase tracking-widest transition-all ${startTime !== null ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
              >
                Set Start
              </button>
              {startTime !== null && (
                <button 
                  onClick={() => setStartTime(null)}
                  className="h-8 px-2 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-500 rounded-r-lg transition-colors border-l-0"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center group relative">
              <button 
                onClick={handleSetStopTime}
                className={`flex-1 sm:flex-none h-8 px-4 rounded-l-lg text-[9px] font-black uppercase tracking-widest transition-all ${stopTime !== null ? 'bg-red-500 text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
              >
                Set Stop
              </button>
              {stopTime !== null && (
                <button 
                  onClick={() => setStopTime(null)}
                  className="h-8 px-2 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-500 rounded-r-lg transition-colors border-l-0"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="relative h-2 flex items-center group">
          <div className="absolute inset-0 timeline-track rounded-full opacity-10 pointer-events-none" />
          <input 
            type="range"
            min={0}
            max={duration}
            step={0.001}
            value={currentTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setCurrentTime(val);
              if (videoRef.current) {
                videoRef.current.currentTime = val;
                if (isPlaying) {
                  videoRef.current.play().catch(() => {});
                }
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          <div className="absolute left-0 right-0 h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white relative"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          {startTime !== null && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-500 z-10 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ left: `${(startTime / duration) * 100}%` }}
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          )}
          {stopTime !== null && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-red-500 z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              style={{ left: `${(stopTime / duration) * 100}%` }}
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
          )}

          <div 
            className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-white z-20 shadow-xl pointer-events-none transform -translate-x-1/2"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
