'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  X,
  Radio,
  Loader2,
  Maximize2,
  Heart,
  AlertCircle,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useJamStore } from '../store/useJamStore';
import { EqualizerBars } from './EqualizerBars';
import { isJamEnabled } from '../utils/featureFlag';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export const MiniPlayer: React.FC = () => {
  const isFeatureEnabled = isJamEnabled();

  const {
    isPanelOpen,
    currentStation,
    playbackState,
    volume,
    isMuted,
    errorMessage,
    queue,
    queueIndex,
    repeatMode,
    isShuffled,
    toggleRepeat,
    toggleShuffle,
    playNext,
    playPrevious,
    progress,
    seek,
    togglePlayPause,
    stop,
    setVolume,
    toggleMute,
    openPanel,
    toggleFavorite,
    isFavorite,
    resume,
  } = useJamStore();

  const [mounted, setMounted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isFeatureEnabled || !mounted || !currentStation || isPanelOpen) {
    return null;
  }

  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';
  const isError = playbackState === 'error';
  const stationFavorited = isFavorite(currentStation.id);
  const isLiveRadio =
    !currentStation.provider || currentStation.provider === 'radio';
  const hasQueue = queue.length > 1;

  // Volume icon logic
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      role="region"
      aria-label="Audio player"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#17171B] border border-[#25252B] shadow-2xl shadow-black/60 backdrop-blur-md max-w-sm sm:max-w-md w-full transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
    >
      {/* Station Avatar / Thumbnail */}
      <div className="relative flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-[#18181C] border border-[#25252B] flex items-center justify-center">
        {currentStation.favicon ? (
          <img
            src={currentStation.favicon}
            alt={currentStation.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#242036] text-[#A78BFA] font-semibold text-xs">
            {currentStation.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        {isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <EqualizerBars isPlaying={true} />
          </div>
        )}
      </div>

      {/* Station Details */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span
              className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isLiveRadio ? 'animate-pulse' : ''}`}
            />
            {isLiveRadio ? 'Live' : 'Track'}
          </span>
          <p className="text-xs font-semibold text-[#F4F4F5] truncate select-none">
            {currentStation.name}
          </p>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          {isError ? (
            <span className="text-[11px] text-rose-400 flex items-center gap-1">
              <AlertCircle size={11} /> {errorMessage || 'Stream unavailable'}
            </span>
          ) : (
            <p className="text-[11px] text-[#A1A1AA] truncate select-none">
              {isLiveRadio
                ? (currentStation.tags || []).slice(0, 3).join(' • ') ||
                  currentStation.country ||
                  'Radio'
                : currentStation.artist || (currentStation.tags || [])[0] || 'Music'}
              {hasQueue && (
                <span className="ml-1.5 text-[#71717A] font-mono">
                  {queueIndex + 1}/{queue.length}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Seek bar — finite tracks on web only (native has no time events yet) */}
        {!isLiveRadio && progress.duration > 0 && !Capacitor.isNativePlatform() && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="w-7 font-mono text-[9px] text-[#71717A]">
              {formatTime(progress.currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={progress.duration}
              step={0.1}
              value={Math.min(progress.currentTime, progress.duration)}
              onChange={(event) => seek(Number.parseFloat(event.target.value))}
              className="h-1 flex-1 cursor-pointer accent-[#6E53CC] bg-[#25252B] rounded-lg appearance-none"
              aria-label="Seek"
            />
            <span className="w-7 text-right font-mono text-[9px] text-[#71717A]">
              {formatTime(progress.duration)}
            </span>
          </div>
        )}
      </div>

      {/* Controls Container */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
        {/* Favorite Button */}
        <button
          type="button"
          onClick={() => toggleFavorite(currentStation)}
          className={`p-1.5 rounded-lg transition-colors ${
            stationFavorited
              ? 'text-rose-500 hover:text-rose-400'
              : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#25252B]'
          }`}
          title={stationFavorited ? 'Remove from favorites' : 'Add to favorites'}
          aria-label="Favorite"
        >
          <Heart size={15} fill={stationFavorited ? 'currentColor' : 'none'} />
        </button>

        {/* Previous track (queue only) */}
        {hasQueue && (
          <button
            type="button"
            onClick={playPrevious}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#25252B] transition-colors"
            title="Previous track"
            aria-label="Previous track"
          >
            <SkipBack size={15} />
          </button>
        )}

        {/* Play / Pause / Retry Button */}
        <button
          type="button"
          onClick={isError ? resume : togglePlayPause}
          disabled={isLoading}
          className="p-2 rounded-lg bg-[#6E53CC] hover:bg-[#7E64E0] text-white transition-all transform active:scale-95 disabled:opacity-60 shadow-md shadow-purple-500/20"
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} className="ml-0.5" />
          )}
        </button>

        {/* Next track (queue only) */}
        {hasQueue && (
          <button
            type="button"
            onClick={playNext}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#25252B] transition-colors"
            title="Next track"
            aria-label="Next track"
          >
            <SkipForward size={15} />
          </button>
        )}

        {/* Shuffle Button (queue only) */}
        {hasQueue && (
          <button
            type="button"
            onClick={toggleShuffle}
            className={`p-1.5 rounded-lg transition-colors ${
              isShuffled
                ? 'text-[#A78BFA] bg-[#242036]'
                : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#25252B]'
            }`}
            title={isShuffled ? 'Shuffle on' : 'Shuffle off'}
            aria-label="Shuffle"
          >
            <Shuffle size={14} />
          </button>
        )}

        {/* Repeat Button (queue only) */}
        {hasQueue && (
          <button
            type="button"
            onClick={toggleRepeat}
            className={`p-1.5 rounded-lg transition-colors ${
              repeatMode !== 'off'
                ? 'text-[#A78BFA] bg-[#242036]'
                : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#25252B]'
            }`}
            title={
              repeatMode === 'one'
                ? 'Repeat one track'
                : repeatMode === 'all'
                ? 'Repeat all tracks'
                : 'Repeat off'
            }
            aria-label="Repeat"
          >
            {repeatMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
          </button>
        )}

        {/* Volume popover / control */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#25252B] transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label="Volume"
          >
            <VolumeIcon size={16} />
          </button>

          {/* Volume Slider dropdown/hover slider */}
          {showVolumeSlider && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-2 rounded-lg bg-[#17171B] border border-[#25252B] shadow-lg flex flex-col items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-[#25252B] rounded-lg appearance-none cursor-pointer accent-[#6E53CC]"
                aria-label="Volume slider"
              />
              <span className="text-[10px] text-[#A1A1AA] mt-1 font-mono">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Open Full Jam Panel */}
        <button
          type="button"
          onClick={openPanel}
          className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#25252B] transition-colors"
          title="Open Jam Station Panel"
          aria-label="Open Jam Panel"
        >
          <Maximize2 size={15} />
        </button>

        {/* Stop and Dismiss */}
        <button
          type="button"
          onClick={stop}
          className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-rose-400 hover:bg-[#25252B] transition-colors"
          title="Stop & Close Player"
          aria-label="Stop Player"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
