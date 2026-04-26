import React from 'react';
import { motion } from 'motion/react';
import { Upload, Film, Timer, Video } from 'lucide-react';

interface HeroProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Hero: React.FC<HeroProps> = ({ onFileUpload }) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-12 md:py-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full text-center space-y-8 md:space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-display font-black text-white leading-[1.05] tracking-tighter py-2 uppercase">
              REEL WORLD.<br />
              <span className="text-zinc-600">REAL TIME.</span>
            </h2>
            <p className="text-zinc-400 text-sm md:text-lg max-w-lg mx-auto font-medium">
              The high-velocity overlay tool for athletes, creators, and analysts. 
            </p>
          </div>

          <label className="group relative block cursor-pointer">
            <input type="file" accept="video/*" className="hidden" onChange={onFileUpload} />
            <div className="border-2 border-dashed border-zinc-800 rounded-[32px] md:rounded-[40px] p-12 md:p-24 transition-all group-hover:border-zinc-500 group-hover:bg-zinc-900/20">
              <div className="flex flex-col items-center gap-4 md:gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl border border-zinc-800">
                  <Upload className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="space-y-1 md:space-y-2">
                  <p className="text-xl md:text-2xl font-bold text-white">Import Video Source</p>
                  <p className="text-zinc-500 text-[10px] md:text-sm">Tap to browse your local filesystem</p>
                </div>
              </div>
            </div>
          </label>

          <div className="flex items-center justify-center gap-6 md:gap-12 pt-4 md:pt-8">
            {[
              { icon: Film, label: 'Reel Ready' },
              { icon: Timer, label: 'Real Time' },
              { icon: Video, label: '60 FPS' },
            ].map((feat, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="p-3 bg-zinc-900/50 rounded-xl">
                  <feat.icon className="w-5 h-5 text-zinc-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{feat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
