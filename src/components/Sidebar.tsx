import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, HelpCircle, X } from 'lucide-react';
import { StopwatchFont, TimerSettings, TimerUnit, Position, FONTS } from '../types';

interface SidebarProps {
  font: StopwatchFont;
  setFont: (font: StopwatchFont) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  showBg: boolean;
  setShowBg: (show: boolean) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  bgOpacity: number;
  setBgOpacity: (opacity: number) => void;
  borderRadius: number;
  fontSize: number;
  setFontSize: (size: number) => void;
  position: Position;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
  timerSettings: TimerSettings;
  setTimerSettings: React.Dispatch<React.SetStateAction<TimerSettings>>;
  startTime: number | null;
  setStartTime: (time: number | null) => void;
  stopTime: number | null;
  setStopTime: (time: number | null) => void;
  currentTime: number;
  manualFinalTime: string;
  setManualFinalTime: (time: string) => void;
  formatTime: (time: number) => string;
  showOverrideHelp: boolean;
  setShowOverrideHelp: (show: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const {
    font, setFont,
    textColor, setTextColor,
    showBg, setShowBg,
    bgColor, setBgColor,
    bgOpacity, setBgOpacity,
    fontSize, setFontSize,
    position, setPosition,
    timerSettings, setTimerSettings,
    startTime, setStartTime,
    stopTime, setStopTime,
    currentTime,
    manualFinalTime, setManualFinalTime,
    formatTime,
    showOverrideHelp, setShowOverrideHelp
  } = props;

  return (
    <div className="flex-1 md:w-80 md:flex-none border-t md:border-t-0 md:border-l border-zinc-900 bg-[#0a0a0a] flex flex-col p-4 md:p-5 space-y-4 md:space-y-6 overflow-y-auto min-h-0">
      <div className="space-y-3">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Reel Engine</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Typeface</span>
            <select
                value={font}
                onChange={(e) => setFont(e.target.value as StopwatchFont)}
                className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded px-2 text-[10px] text-white focus:outline-none focus:border-zinc-700"
            >
                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Color</span>
            <input 
              type="color" 
              value={textColor} 
              onChange={(e) => setTextColor(e.target.value)}
              className="w-full h-8 rounded bg-transparent border-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-zinc-900/50">
          <div className="flex items-center justify-between px-1">
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Backdrop</span>
            <button 
              onClick={() => setShowBg(!showBg)}
              className={`w-8 h-4 rounded-full relative transition-colors ${showBg ? 'bg-white' : 'bg-zinc-800'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${showBg ? 'right-0.5 bg-black' : 'left-0.5 bg-zinc-600'}`} />
            </button>
          </div>
          
          <AnimatePresence>
            {showBg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-2 pt-1 overflow-hidden"
              >
                <div className="space-y-1">
                  <div className="flex justify-between text-[7px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                    <span>Opacity</span>
                    <span className="text-white font-mono">{Math.round(bgOpacity * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01"
                    value={bgOpacity} 
                    onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                    className="w-full accent-white h-1 bg-zinc-900 rounded-full" 
                  />
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest block pr-1">Tint</span>
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-8 rounded bg-transparent border-0 cursor-pointer"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Geometry</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1 px-1">
            <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
              <span>Horizontal</span>
              <span className="text-white font-mono">{position.x}%</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              value={position.x} 
              onChange={(e) => setPosition(p => ({ ...p, x: parseInt(e.target.value) }))}
              className="w-full accent-white h-0.5 bg-zinc-900 rounded-full cursor-pointer" 
            />
          </div>
          <div className="space-y-1 px-1">
            <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
              <span>Vertical</span>
              <span className="text-white font-mono">{position.y}%</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              value={position.y} 
              onChange={(e) => setPosition(p => ({ ...p, y: parseInt(e.target.value) }))}
              className="w-full accent-white h-0.5 bg-zinc-900 rounded-full cursor-pointer" 
            />
          </div>
          <div className="space-y-1 px-1">
            <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
              <span>Size</span>
              <span className="text-white font-mono">{fontSize}px</span>
            </div>
            <input 
              type="range" min="20" max="120" step="1"
              value={fontSize} 
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-white h-0.5 bg-zinc-900 rounded-full" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Timer Precision</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['hours', 'minutes', 'seconds', 'tenths', 'hundredths', 'thousandths'] as TimerUnit[]).map((unit) => (
            <button
              key={unit}
              onClick={() => setTimerSettings(prev => ({ ...prev, [unit]: !prev[unit] }))}
              className={`h-8 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${
                timerSettings[unit] 
                ? 'bg-white text-black border-white' 
                : 'bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 pb-2">
        <div className="bg-zinc-950 p-5 rounded-[32px] border border-zinc-900 space-y-3 transition-all">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
            <span>Summary</span>
            {(startTime !== null || stopTime !== null) && (
              <button 
                onClick={() => { setStartTime(null); setStopTime(null); setManualFinalTime(''); }} 
                className="text-red-500 hover:text-red-400 flex items-center gap-1.5 transition-colors uppercase tracking-widest text-[8px] font-black"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 uppercase tracking-widest text-[8px] font-black">Segment Duration</span>
              <span className="font-mono text-white font-bold text-base">
                {startTime !== null ? formatTime(Math.max(0, (stopTime || currentTime) - startTime)) : '00:00.00'}
              </span>
            </div>

            <div className="pt-2 border-t border-zinc-900/50 space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-zinc-600 uppercase tracking-widest text-[7px] font-black">Manual Final Override</span>
                <button 
                  onClick={() => setShowOverrideHelp(!showOverrideHelp)}
                  className="hover:text-white transition-colors"
                >
                  <HelpCircle className={`w-3 h-3 ${showOverrideHelp ? 'text-emerald-500' : 'text-zinc-700'}`} />
                </button>
              </div>
              <AnimatePresence>
                {showOverrideHelp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-2 overflow-hidden"
                  >
                    <p className="text-[7px] text-zinc-500 pb-2 leading-relaxed font-medium">
                      Force the timer to end on this exact number (e.g. 11.91) even if the video frames don't land exactly on it.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="e.g. 11.91"
                  value={manualFinalTime}
                  onChange={(e) => setManualFinalTime(e.target.value)}
                  className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-xs font-mono text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                {manualFinalTime && (
                  <button 
                    onClick={() => setManualFinalTime('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
