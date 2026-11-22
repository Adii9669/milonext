"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioLevels: number[];
  error: string | null;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(16).fill(12));
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const latestBlobRef = useRef<Blob | null>(null);
  const latestUrlRef = useRef<string | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mimeTypeRef = useRef<string>("");

  const getSupportedMimeType = (): string => {
    if (typeof MediaRecorder === "undefined") return "";
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4",
      "audio/aac",
    ];
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return "";
  };

  const cleanupAudioNodes = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startVisualizer = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.6;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevels = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Sample 16 discrete levels from the frequency data
        const sampleCount = 16;
        const step = Math.max(1, Math.floor(bufferLength / sampleCount));
        const levels: number[] = [];

        for (let i = 0; i < sampleCount; i++) {
          const value = dataArray[i * step] || 0;
          // Normalize to a percentage between 12% and 100%
          const normalized = Math.min(100, Math.max(12, Math.round((value / 255) * 100)));
          levels.push(normalized);
        }

        setAudioLevels(levels);
        animFrameRef.current = requestAnimationFrame(updateLevels);
      };

      updateLevels();
    } catch (e) {
      console.warn("Visualizer failed to initialize:", e);
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    audioChunksRef.current = [];
    latestBlobRef.current = null;
    setAudioBlob(null);
    if (latestUrlRef.current) {
      URL.revokeObjectURL(latestUrlRef.current);
      latestUrlRef.current = null;
    }
    setAudioUrl(null);
    setRecordingDuration(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone access is not supported by your browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const selectedMime = getSupportedMimeType();
      mimeTypeRef.current = selectedMime;

      const options = selectedMime ? { mimeType: selectedMime } : undefined;
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100); // 100ms slices for smooth chunk collection
      setIsRecording(true);
      setIsPaused(false);

      startVisualizer(stream);

      // Start duration timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      cleanupAudioNodes();
      setIsRecording(false);
      setIsPaused(false);
      const message = err instanceof Error ? err.message : "Failed to access microphone.";
      setError(message);
      throw err;
    }
  }, [cleanupAudioNodes, startVisualizer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.requestData();
      } catch {
        // Ignore
      }
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    }
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      if (mediaStreamRef.current) {
        startVisualizer(mediaStreamRef.current);
      }
    }
  }, [startVisualizer]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      stopTimer();
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        cleanupAudioNodes();
        setIsRecording(false);
        setIsPaused(false);
        resolve(latestBlobRef.current || audioBlob);
        return;
      }

      // Force flush any pending audio chunks before stopping
      try {
        if (recorder.state === "recording" || recorder.state === "paused") {
          recorder.requestData();
        }
      } catch (err) {
        console.warn("MediaRecorder requestData error:", err);
      }

      recorder.addEventListener(
        "stop",
        () => {
          setIsRecording(false);
          setIsPaused(false);
          const mime = mimeTypeRef.current || "audio/webm";
          const finalBlob = new Blob(audioChunksRef.current, { type: mime });
          latestBlobRef.current = finalBlob;
          setAudioBlob(finalBlob);

          if (latestUrlRef.current) {
            URL.revokeObjectURL(latestUrlRef.current);
          }
          const url = URL.createObjectURL(finalBlob);
          latestUrlRef.current = url;
          setAudioUrl(url);

          cleanupAudioNodes();
          resolve(finalBlob);
        },
        { once: true }
      );

      recorder.stop();
    });
  }, [audioBlob, cleanupAudioNodes, stopTimer]);

  const cancelRecording = useCallback(() => {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore stop error
      }
    }
    cleanupAudioNodes();
    audioChunksRef.current = [];
    latestBlobRef.current = null;
    if (latestUrlRef.current) {
      URL.revokeObjectURL(latestUrlRef.current);
      latestUrlRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    setAudioLevels(new Array(16).fill(12));
    setError(null);
  }, [cleanupAudioNodes, stopTimer]);

  const createAudioFile = useCallback(
    (blobOverride?: Blob | null): File | null => {
      const blobToUse = blobOverride || latestBlobRef.current || audioBlob;
      if (!blobToUse || blobToUse.size === 0) return null;

      // Extract clean MIME type without parameters (e.g. "audio/webm", not "audio/webm;codecs=opus")
      const rawMime = mimeTypeRef.current || blobToUse.type || "audio/webm";
      const cleanMime = rawMime.split(";")[0].trim() || "audio/webm";

      let extension = "webm";
      if (cleanMime.includes("mp4") || cleanMime.includes("aac")) extension = "mp4";
      else if (cleanMime.includes("ogg")) extension = "ogg";

      const filename = `voice-message-${Date.now()}.${extension}`;
      return new File([blobToUse], filename, { type: cleanMime });
    },
    [audioBlob]
  );

  useEffect(() => {
    return () => {
      stopTimer();
      cleanupAudioNodes();
      if (latestUrlRef.current) {
        URL.revokeObjectURL(latestUrlRef.current);
      }
    };
  }, [cleanupAudioNodes, stopTimer]);

  return {
    isRecording,
    isPaused,
    recordingDuration,
    audioBlob,
    audioUrl,
    audioLevels,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    createAudioFile,
  };
}
