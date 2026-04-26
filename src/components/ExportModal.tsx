import React from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import { ExportStatus, Resolution, RESOLUTIONS, FPS_OPTIONS } from '../types';

interface ExportModalProps {
  exportStatus: ExportStatus;
  setExportStatus: (status: ExportStatus) => void;
  exportProgress: number;
  exportRes: Resolution;
  setExportRes: (res: Resolution) => void;
  exportFps: number;
  setExportFps: (fps: number) => void;
  handleExport: () => void;
  duration: number;
  isAbortedRef: React.MutableRefObject<boolean>;
}

export const ExportModal: React.FC<ExportModalProps> = (props) => {
  const {
    exportStatus,
    setExportStatus,
    exportProgress,
    exportRes,
    setExportRes,
    exportFps,
    setExportFps,
    handleExport,
    duration,
    isAbortedRef
  } = props;

  if (exportStatus === 'idle') return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-start md:items-center justify-center p-4 md:p-6 overflow-y-auto"
      onClick={() => exportStatus === 'preparing' && setExportStatus('idle')}
    >
      {exportStatus === 'preparing' && (
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          className="max-w-xl w-full p-5 md:p-12 bg-zinc-900 rounded-[32px] md:rounded-[48px] border border-zinc-800 shadow-2xl space-y-4 md:space-y-8 relative my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center space-y-1">
            <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight">Final Settings</h3>
            <p className="text-zinc-500 text-xs md:text-sm">Review your export configuration before rendering.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 block pl-1">Resolution</label>
              <div className="grid grid-cols-1 gap-1.5">
                {RESOLUTIONS.map(r => (
                  <button
                    key={r.label}
                    onClick={() => setExportRes(r)}
                    className={`h-11 md:h-12 px-4 rounded-xl border text-[10px] md:text-xs font-bold transition-all flex items-center justify-between ${exportRes.label === r.label ? 'bg-white text-black border-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    <div className="flex flex-col items-start leading-tight">
                      <span>{r.label}</span>
                      <span className="text-[7px] md:text-[8px] opacity-60 font-mono">{r.width}x{r.height}</span>
                    </div>
                    <CheckCircle2 className={`w-3.5 h-3.5 md:w-4 md:h-4 ${exportRes.label === r.label ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 block pl-1">Frame Rate</label>
              <div className="grid grid-cols-1 gap-1.5">
                {FPS_OPTIONS.map(f => (
                  <button
                    key={f}
                    onClick={() => setExportFps(f)}
                    className={`h-11 md:h-12 px-4 rounded-xl border text-[10px] md:text-xs font-bold transition-all flex items-center justify-between ${exportFps === f ? 'bg-white text-black border-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    <span>{f} FPS</span>
                    <CheckCircle2 className={`w-3.5 h-3.5 md:w-4 md:h-4 ${exportFps === f ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 md:pt-8 space-y-2">
            <button 
              onClick={handleExport}
              className="w-full bg-white text-black py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase tracking-[0.2em] text-xs md:text-sm shadow-xl hover:bg-zinc-200 transition-all active:scale-95"
            >
              EXPORT
            </button>
            <button 
              onClick={() => setExportStatus('idle')}
              className="w-full bg-transparent text-zinc-500 py-2 rounded-3xl font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] hover:text-white transition-colors"
            >
              back
            </button>
          </div>
        </motion.div>
      )}

      <div className={exportStatus === 'preparing' ? 'hidden' : 'max-w-md w-full p-8 md:p-12 bg-zinc-900 rounded-[32px] md:rounded-[48px] border border-zinc-800 shadow-2xl text-center space-y-8 md:space-y-10 my-auto'}>
        {exportStatus === 'processing' && (
          <>
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" className="stroke-zinc-800 fill-none" strokeWidth="12"/>
                <motion.circle 
                  cx="64" cy="64" r="58" className="stroke-white fill-none" strokeWidth="12"
                  strokeDasharray={364.4}
                  animate={{ strokeDashoffset: 364.4 - (364.4 * exportProgress) / 100 }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-mono font-black text-white">{exportProgress}%</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                 <h3 className="text-3xl font-display font-black text-white tracking-tight uppercase">Rendering</h3>
                 <p className="text-zinc-500 text-sm">Frame {Math.floor((exportProgress/100) * duration * exportFps)} / {Math.floor(duration * exportFps)}</p>
                 <p className="text-zinc-600 text-[10px] uppercase font-black tracking-widest mt-4">Do not close this tab</p>
              </div>
              <button 
                onClick={() => {
                  isAbortedRef.current = true;
                  setExportStatus('idle');
                }}
                className="text-zinc-500 hover:text-white text-[10px] uppercase font-black tracking-widest mt-4"
              >
                Cancel Render
              </button>
            </div>
          </>
        )}

        {exportStatus === 'completed' && (
          <>
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-black text-white uppercase tracking-tight">Reel Ready</h3>
                <p className="text-zinc-500 text-sm">Your render has been downloaded successfully.</p>
              </div>
              <button 
                onClick={() => {
                  setExportStatus('idle');
                }}
                className="w-full bg-white text-black py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-transform active:scale-95"
              >
                BACK
              </button>
            </div>
          </>
        )}

        {exportStatus === 'error' && (
          <>
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <X className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-black text-white uppercase tracking-tight">Render Failed</h3>
                <p className="text-zinc-500 text-sm">Resource limit reached. Try a lower resolution.</p>
              </div>
              <button 
                onClick={() => setExportStatus('idle')}
                className="w-full bg-zinc-800 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs"
              >
                Back to Editor
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
