"use client";

import React, { useState, useRef, useEffect } from "react";
import { Trash2, Pause, Play, Send, Square } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceRecorderBarProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  audioLevels: number[];
  audioUrl: string | null;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onSend: () => void;
  onStopToPreview: () => void;
  isUploading?: boolean;
}

export function VoiceRecorderBar({
  isRecording,
  isPaused,
  recordingDuration,
  audioLevels,
  audioUrl,
  onPause,
  onResume,
  onCancel,
  onSend,
  onStopToPreview,
  isUploading = false,
}: VoiceRecorderBarProps) {
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Format seconds to m:ss (e.g. 0:08, 0:13, 1:04) matching reference images
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Preview audio handlers
  useEffect(() => {
    if (!audioUrl) {
      setIsPreviewPlaying(false);
      setPreviewProgress(0);
      setPreviewCurrentTime(0);
      return;
    }

    const audio = new Audio(audioUrl);
    previewAudioRef.current = audio;

    const handleTimeUpdate = () => {
      setPreviewCurrentTime(audio.currentTime);
      if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
        setPreviewProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPreviewPlaying(false);
      setPreviewProgress(0);
      setPreviewCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      previewAudioRef.current = null;
    };
  }, [audioUrl]);

  const togglePreviewPlay = () => {
    const audio = previewAudioRef.current;
    if (!audio) return;

    if (isPreviewPlaying) {
      audio.pause();
      setIsPreviewPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPreviewPlaying(true);
    }
  };

  const isPreviewMode = !isRecording && !!audioUrl;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="flex items-center gap-2.5 bg-[#1D1D23] border border-[#2D2D37] rounded-full pl-3.5 pr-1.5 py-1 min-h-[42px] shadow-lg shrink-0 w-full sm:w-auto"
    >
      {/* 1. Trash / Discard Button */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isUploading}
        aria-label="Discard recording"
        title="Discard voice message"
        className="w-7 h-7 rounded-full flex items-center justify-center text-[#9ba1a6] hover:text-[#ef4444] transition-colors active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
      >
        <Trash2 size={17} />
      </button>

      {/* 2. Recording Mode */}
      {!isPreviewMode ? (
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Pulsing Coral/Red Dot */}
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isPaused ? "bg-amber-500" : "bg-[#f87171] animate-pulse"
            }`}
          />

          {/* Time: m:ss format e.g. 0:08, 0:13 */}
          <span className="text-sm font-mono font-medium text-[#f0f2f5] min-w-[30px] shrink-0 select-none">
            {formatTime(recordingDuration)}
          </span>

          {/* Compact Waveform Bars */}
          <div className="flex items-center gap-[2.5px] h-5 px-1 overflow-hidden w-20 sm:w-24 justify-center shrink-0">
            {audioLevels.slice(0, 12).map((lvl, idx) => (
              <span
                key={idx}
                style={{
                  height: `${Math.max(4, (lvl / 100) * 18)}px`,
                  transition: "height 75ms ease-out",
                }}
                className={`w-[2.5px] rounded-full shrink-0 ${
                  isPaused ? "bg-[#52525B]" : "bg-[#A78BFA]"
                }`}
              />
            ))}
          </div>

          {/* Pause / Resume Button (Coral/Pink accent like WhatsApp reference) */}
          <button
            type="button"
            onClick={isPaused ? onResume : onPause}
            disabled={isUploading}
            aria-label={isPaused ? "Resume recording" : "Pause recording"}
            title={isPaused ? "Resume" : "Pause"}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#f87171] hover:brightness-125 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            {isPaused ? <Play size={15} className="fill-current ml-0.5" /> : <Pause size={16} className="fill-current" />}
          </button>

          {/* Review Button */}
          <button
            type="button"
            onClick={onStopToPreview}
            disabled={isUploading || recordingDuration < 1}
            aria-label="Review voice note"
            title="Review recording before sending"
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-[#d4d4dc] hover:text-white bg-[#282832] hover:bg-[#343442] border border-[#3E3E4E] transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-40"
          >
            <Square size={9} className="fill-current" />
            <span>Review</span>
          </button>
        </div>
      ) : (
        /* Review / Preview Player Mode */
        <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:min-w-[220px]">
          {/* Play / Pause Preview Button */}
          <button
            type="button"
            onClick={togglePreviewPlay}
            aria-label={isPreviewPlaying ? "Pause preview" : "Play preview"}
            title={isPreviewPlaying ? "Pause preview" : "Play preview"}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-[#6E53CC] text-white hover:bg-[#7E64E0] transition-colors shrink-0 active:scale-95 cursor-pointer shadow-sm"
          >
            {isPreviewPlaying ? (
              <Pause size={13} className="fill-current" />
            ) : (
              <Play size={13} className="fill-current ml-0.5" />
            )}
          </button>

          {/* Preview Scrubber & Time */}
          <div className="flex flex-col justify-center gap-1 min-w-[100px] flex-1">
            <div className="w-full bg-[#2A2A34] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#A78BFA] h-full transition-all duration-100 ease-linear"
                style={{ width: `${previewProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#9ba1a6] font-mono leading-none">
              <span>{formatTime(Math.round(previewCurrentTime))}</span>
              <span>{formatTime(recordingDuration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Circular Send Button (Reference Image WhatsApp Style in Onechat Purple) */}
      <button
        type="button"
        onClick={onSend}
        disabled={isUploading || (isRecording && recordingDuration < 1)}
        aria-label="Send voice message"
        title="Send voice message"
        className="w-9 h-9 rounded-full bg-[#6E53CC] text-white hover:bg-[#7E64E0] active:scale-95 transition-all shadow-[0_2px_10px_rgba(110,83,204,0.4)] disabled:opacity-40 flex items-center justify-center shrink-0 cursor-pointer"
      >
        {isUploading ? (
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Send size={15} className="ml-0.5" />
        )}
      </button>
    </motion.div>
  );
}
