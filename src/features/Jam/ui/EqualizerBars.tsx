'use client';

import React from 'react';

interface EqualizerBarsProps {
  isPlaying: boolean;
  className?: string;
  barColor?: string;
}

export const EqualizerBars: React.FC<EqualizerBarsProps> = ({
  isPlaying,
  className = '',
  barColor = 'bg-[#6E53CC]',
}) => {
  return (
    <div className={`flex items-end gap-[2px] h-3.5 w-3.5 ${className}`} aria-hidden="true">
      <span
        className={`w-[2.5px] rounded-full transition-all duration-300 ${barColor} ${
          isPlaying ? 'animate-[pulse_0.6s_ease-in-out_infinite] h-full' : 'h-1 opacity-50'
        }`}
      />
      <span
        className={`w-[2.5px] rounded-full transition-all duration-300 ${barColor} ${
          isPlaying ? 'animate-[pulse_0.9s_ease-in-out_infinite_0.2s] h-3/4' : 'h-2 opacity-50'
        }`}
      />
      <span
        className={`w-[2.5px] rounded-full transition-all duration-300 ${barColor} ${
          isPlaying ? 'animate-[pulse_0.75s_ease-in-out_infinite_0.4s] h-full' : 'h-1.5 opacity-50'
        }`}
      />
      <span
        className={`w-[2.5px] rounded-full transition-all duration-300 ${barColor} ${
          isPlaying ? 'animate-[pulse_0.85s_ease-in-out_infinite_0.1s] h-1/2' : 'h-1 opacity-50'
        }`}
      />
    </div>
  );
};
