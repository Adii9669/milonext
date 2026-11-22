"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Play, Pause, Mic, Check, CheckCheck, AlertCircle } from "lucide-react";

interface VoiceMessagePlayerProps {
  id: string;
  fileUrl?: string;
  content?: string;
  time: string;
  isMine?: boolean;
  status?: string;
  senderName?: string;
  isChannel?: boolean;
}

// Global event to ensure only one voice note plays at any time
const AUDIO_PLAY_EVENT = "onechat:audio-play";

// Deterministic mock waveform heights based on message ID for visual consistency
function generateWaveformHeights(seed: string, count = 26): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    const val = Math.abs(Math.sin((hash + i * 3.7) * 1.5));
    // scale to height between 6px and 22px
    heights.push(Math.round(6 + val * 16));
  }
  return heights;
}

function resolveAudioUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
}

function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || isNaN(sec) || sec < 0) return "0:00";
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VoiceMessagePlayer({
  id,
  fileUrl,
  time,
  isMine = false,
  status,
  senderName,
  isChannel = false,
}: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);

  const resolvedUrl = useMemo(() => resolveAudioUrl(fileUrl), [fileUrl]);
  const bars = useMemo(() => generateWaveformHeights(id || "default", 26), [id]);

  // Handle global one-at-a-time audio playback
  useEffect(() => {
    const handleOtherPlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      if (customEvent.detail?.id !== id && isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener(AUDIO_PLAY_EVENT, handleOtherPlay);
    return () => window.removeEventListener(AUDIO_PLAY_EVENT, handleOtherPlay);
  }, [id, isPlaying]);

  // Initialize and attach audio event listeners
  useEffect(() => {
    if (!resolvedUrl) {
      setHasError(true);
      return;
    }

    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = resolvedUrl;
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      setIsLoaded(true);
      setHasError(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (Number.isFinite(audio.duration) && audio.duration > 0 && duration === 0) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    const onError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, [resolvedUrl]);

  // Handle Play / Pause Toggle
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      window.dispatchEvent(
        new CustomEvent(AUDIO_PLAY_EVENT, { detail: { id } })
      );
      try {
        audio.playbackRate = playbackRate;
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Playback failed:", err);
        setHasError(true);
      }
    }
  }, [hasError, id, isPlaying, playbackRate]);

  // Handle Speed Rate Toggle (1x -> 1.5x -> 2x -> 1x)
  const toggleRate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
      setPlaybackRate(nextRate);
      if (audioRef.current) {
        audioRef.current.playbackRate = nextRate;
      }
    },
    [playbackRate]
  );

  // Handle Seek on Waveform Click
  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!waveformRef.current || !duration || hasError) return;
      const rect = waveformRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const targetTime = percentage * duration;

      if (audioRef.current) {
        audioRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    },
    [duration, hasError]
  );

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`flex flex-col ${
        isMine ? "items-end" : "items-start"
      } max-w-[85%] sm:max-w-sm`}
    >
      {/* Sender Name in Channels */}
      {isChannel && !isMine && senderName && (
        <span className="text-[11px] font-semibold text-[#A78BFA] mb-1 pl-1">
          {senderName}
        </span>
      )}

      <div
        className={`px-3.5 py-2.5 rounded-[14px] shadow-sm w-full select-none ${
          isMine
            ? "bg-[#6E53CC] rounded-br-[2px] text-white shadow-[0_2px_12px_rgba(110,83,204,0.3)]"
            : "bg-[#1E1E22] rounded-bl-[2px] border border-[#2E2E36] text-[#f0f2f5]"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              disabled={hasError}
              aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
              onClick={togglePlay}
              className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                isMine
                  ? "bg-white text-[#6E53CC] hover:bg-[#F3E8FF]"
                  : "bg-[#6E53CC] text-white hover:bg-[#7E64E0]"
              }`}
            >
              {hasError ? (
                <AlertCircle size={18} className="text-red-400" />
              ) : isPlaying ? (
                <Pause size={18} className="fill-current" />
              ) : (
                <Play size={18} className="fill-current ml-0.5" />
              )}
            </button>

            {/* Small Microphone Badge */}
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow-sm ${
                isMine
                  ? "bg-[#1F1F24] border border-[#333338] text-[#A78BFA]"
                  : "bg-[#141416] border border-[#2D2D34] text-[#22C55E]"
              }`}
            >
              <Mic size={9} />
            </span>
          </div>

          {/* Waveform Scrubber & Times */}
          <div className="flex-1 flex flex-col justify-center min-w-0 pr-1">
            {/* Interactive Waveform */}
            <div
              ref={waveformRef}
              onClick={handleSeek}
              className="flex items-center gap-[2.5px] h-7 px-1 mb-1 cursor-pointer group"
              title="Click to seek"
            >
              {bars.map((h, i) => {
                const barPercent = (i / bars.length) * 100;
                const isPlayed = barPercent <= progressPercent;

                return (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className={`flex-1 min-w-[2px] max-w-[4px] rounded-full transition-all duration-75 ${
                      isPlayed
                        ? isMine
                          ? "bg-white"
                          : "bg-[#A78BFA]"
                        : isMine
                        ? "bg-white/40"
                        : "bg-[#52525B]/50"
                    } ${
                      isPlaying && isPlayed ? "opacity-100" : "opacity-90"
                    } group-hover:scale-y-110`}
                  />
                );
              })}
            </div>

            {/* Bottom Row: Duration, Speed Toggle, Timestamp, Status */}
            <div
              className={`flex items-center justify-between text-[11px] ${
                isMine ? "text-white/80" : "text-[#9ba1a6]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">
                  {isPlaying || currentTime > 0
                    ? formatDuration(currentTime)
                    : duration > 0
                    ? formatDuration(duration)
                    : isLoaded
                    ? "0:00"
                    : "Audio"}
                </span>

                {/* Speed toggle pill */}
                <button
                  type="button"
                  onClick={toggleRate}
                  title="Toggle playback speed"
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    isMine
                      ? "bg-white/20 hover:bg-white/30 text-white"
                      : "bg-[#2A2A30] hover:bg-[#34343C] text-[#c4c4cc]"
                  }`}
                >
                  {playbackRate}x
                </button>
              </div>

              {/* Timestamp & Status */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] opacity-80">{time}</span>
                {isMine && (
                  <span className="ml-0.5">
                    {status === "read" ? (
                      <CheckCheck size={13} className="text-[#E9D5FF]" />
                    ) : status === "delivered" ? (
                      <CheckCheck size={13} className="opacity-90" />
                    ) : (
                      <Check size={13} className="opacity-75" />
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
