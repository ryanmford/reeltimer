export type Resolution = { label: string; width: number; height: number };
export type ExportStatus = 'idle' | 'preparing' | 'processing' | 'completed' | 'error';
export type StopwatchFont = 'font-sans' | 'font-mono' | 'font-serif' | 'font-display';
export type TimerUnit = 'hours' | 'minutes' | 'seconds' | 'tenths' | 'hundredths' | 'thousandths';
export type TimerSettings = Record<TimerUnit, boolean>;
export type Position = { x: number; y: number };

export const FONTS: { label: string; value: StopwatchFont }[] = [
  { label: 'SANS', value: 'font-sans' },
  { label: 'MONO', value: 'font-mono' },
  { label: 'SERIF', value: 'font-serif' },
  { label: 'DISPLAY', value: 'font-display' },
];

export const RESOLUTIONS: Resolution[] = [
  { label: '4K (2160p)', width: 3840, height: 2160 },
  { label: 'QHD (1440p)', width: 2560, height: 1440 },
  { label: 'FHD (1080p)', width: 1920, height: 1080 },
];

export const FPS_OPTIONS = [24, 30, 60];
