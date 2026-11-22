'use client';

import React from 'react';
import { Radio, Play, Pause, Heart, Headphones, Sparkles } from 'lucide-react';
import { Station } from '../types/jam';
import { useJamStore } from '../store/useJamStore';
import { EqualizerBars } from './EqualizerBars';

interface OnechatJamCardProps {
  station: Station;
  sender?: {
    id: string;
    name: string;
  };
  isMine?: boolean;
  time?: string;
}

export const OnechatJamCard: React.FC<OnechatJamCardProps> = ({
  station,
  sender,
  isMine,
  time,
}) => {
  const {
    currentStation,
    playbackState,
    playStation,
    togglePlayPause,
    isFavorite,
    toggleFavorite,
  } = useJamStore();

  const isCurrent = currentStation?.id === station.id;
  const isPlaying = isCurrent && playbackState === 'playing';
  const isLoading = isCurrent && playbackState === 'loading';
  const favorited = isFavorite(station.id);
  const isLiveRadio =
    !station.provider || station.provider === 'radio';

  const handleTuneIn = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playStation(station);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-xl bg-[#17171B] border border-[#25252B] hover:border-[#6E53CC]/40 p-3.5 transition-all shadow-lg select-none">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#25252B]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#242036] text-[#A78BFA] flex items-center justify-center border border-[#6E53CC]/30">
            <Radio size={13} />
          </div>
          <span className="text-[11px] font-bold text-[#F4F4F5] uppercase tracking-wider">
            {isLiveRadio ? 'Live Jam' : 'Shared Track'}
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span
              className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${
                isLiveRadio ? 'animate-pulse' : ''
              }`}
            />
            {isLiveRadio ? 'ON AIR' : 'TRACK'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(station)}
          className={`p-1.5 rounded-lg transition-colors ${
            favorited
              ? 'text-rose-500 hover:text-rose-400'
              : 'text-[#71717A] hover:text-[#F4F4F5] hover:bg-[#25252B]'
          }`}
          title={favorited ? 'Favorited' : 'Add to favorites'}
        >
          <Heart size={14} fill={favorited ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ── Main Station Info ──────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Artwork */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#18181C] border border-[#25252B] flex-shrink-0 flex items-center justify-center">
          {station.favicon ? (
            <img
              src={station.favicon}
              alt={station.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#242036] text-[#A78BFA] font-bold text-sm">
              {station.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          {isPlaying && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <EqualizerBars isPlaying={true} />
            </div>
          )}
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-[#F4F4F5] truncate leading-tight">
            {station.name}
          </h4>
          <p className="text-[11px] text-[#A1A1AA] truncate mt-0.5">
            {isLiveRadio
              ? (station.tags || []).slice(0, 3).join(' • ') || station.country || 'Live Station'
              : station.artist || (station.tags || [])[0] || 'Music'}
          </p>
          <p className="text-[10px] text-[#71717A] mt-0.5">
            {isMine ? 'Shared by you' : `Started by ${sender?.name || 'a member'}`}
          </p>
        </div>
      </div>

      {/* ── Tune In / Action Bar ───────────────────────────────── */}
      <div className="mt-3 pt-2.5 border-t border-[#25252B] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-[#71717A]">
          <Headphones size={13} className="text-[#A78BFA]" />
          <span>{isPlaying ? 'Listening now' : 'Tap to listen together'}</span>
        </div>

        <button
          type="button"
          onClick={handleTuneIn}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isPlaying
              ? 'bg-[#242036] text-[#A78BFA] border border-[#6E53CC]/40 hover:bg-[#242036]/80'
              : 'bg-[#6E53CC] text-white hover:bg-[#7E64E0] shadow-sm shadow-purple-500/20'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause size={13} />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={13} className="ml-0.5" />
              <span>Tune In</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
