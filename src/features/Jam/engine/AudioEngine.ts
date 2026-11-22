/**
 * AudioEngine - Singleton Audio Stream Controller
 * Handles HTML5 Audio + HLS.js streaming on web, and native Android Foreground
 * Service playback with lock screen media notifications on native Capacitor builds.
 */

import { Capacitor, registerPlugin } from '@capacitor/core';
import type { Station, PlaybackState } from '../types/jam';
import { isJamStreamPlayableOnWeb } from '../utils/webPlayback';

type StateListener = (state: PlaybackState, error?: string) => void;
type TrackEndedListener = () => void;
type TimeUpdateListener = (currentTime: number, duration: number) => void;

interface NativeRadioPluginInterface {
  play(options: { url: string; title: string; artist: string }): Promise<{ status: string }>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  addListener(
    eventName: 'playbackStateChanged',
    listenerFunc: (info: { state: string }) => void
  ): Promise<any>;
}

const NativeRadio = registerPlugin<NativeRadioPluginInterface>('NativeRadio');

class AudioEngine {
  private static instance: AudioEngine;
  private audio: HTMLAudioElement | null = null;
  private hls: any = null;
  private currentStation: Station | null = null;
  private state: PlaybackState = 'idle';
  private volume: number = 0.8;
  private muted: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<StateListener> = new Set();
  private endedListeners: Set<TrackEndedListener> = new Set();
  private timeListeners: Set<TimeUpdateListener> = new Set();
  private isInitialized: boolean = false;
  private isNative: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isNative = Capacitor.isNativePlatform();
      this.init();
    }
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // 1. Native Android Background Audio initialization
    if (this.isNative) {
      try {
        NativeRadio.addListener('playbackStateChanged', (info) => {
          if (info && info.state) {
            if (info.state === 'ended') {
              this.setState('idle');
              this.emitTrackEnded();
              return;
            }
            this.setState(info.state as PlaybackState);
          }
        });
      } catch (err) {
        console.warn('[AudioEngine] NativeRadio listener attachment failed', err);
      }
      this.isInitialized = true;
      return;
    }

    // 2. Browser HTML5 Audio initialization
    this.audio = new Audio();
    this.audio.preload = 'none';
    this.audio.volume = this.volume;
    this.audio.muted = this.muted;

    this.audio.addEventListener('loadstart', () => this.setState('loading'));
    this.audio.addEventListener('waiting', () => this.setState('loading'));
    this.audio.addEventListener('canplay', () => {
      if (this.state === 'loading') {
        this.setState('playing');
        this.retryCount = 0;
      }
    });
    this.audio.addEventListener('playing', () => {
      this.setState('playing');
      this.retryCount = 0;
    });
    this.audio.addEventListener('pause', () => {
      if (this.state !== 'loading' && this.state !== 'error') {
        this.setState('paused');
      }
    });
    this.audio.addEventListener('ended', () => {
      // Finite provider tracks end naturally -> let the queue advance.
      // Live radio streams ending is abnormal -> retry the stream.
      if (this.currentStation?.provider && this.currentStation.provider !== 'radio') {
        this.setState('idle');
        this.emitTrackEnded();
      } else {
        this.handleStreamError('Stream ended unexpectedly');
      }
    });
    this.audio.addEventListener('error', () => {
      const errorMsg = this.audio?.error ? `Error code ${this.audio.error.code}` : 'Audio element error';
      this.handleStreamError(errorMsg);
    });

    const emitTime = () => {
      if (!this.audio) return;
      const duration = Number.isFinite(this.audio.duration)
        ? this.audio.duration
        : 0;
      this.timeListeners.forEach((listener) =>
        listener(this.audio?.currentTime || 0, duration)
      );
    };
    this.audio.addEventListener('timeupdate', emitTime);
    this.audio.addEventListener('loadedmetadata', emitTime);
    this.audio.addEventListener('durationchange', emitTime);

    this.setupMediaSessionHandlers();
    this.isInitialized = true;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  /**
   * Fires when a finite track finishes naturally (not on radio stream errors).
   * Used by the Jam store to advance the play queue.
   */
  public onTrackEnded(listener: TrackEndedListener): () => void {
    this.endedListeners.add(listener);
    return () => this.endedListeners.delete(listener);
  }

  private emitTrackEnded() {
    this.endedListeners.forEach((listener) => listener());
  }

  /** Emits currentTime/duration for finite tracks (web playback). */
  public onTimeUpdate(listener: TimeUpdateListener): () => void {
    this.timeListeners.add(listener);
    return () => this.timeListeners.delete(listener);
  }

  public getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  public getDuration(): number {
    const duration = this.audio?.duration;
    return duration && Number.isFinite(duration) ? duration : 0;
  }

  private setState(newState: PlaybackState, error?: string) {
    this.state = newState;
    this.listeners.forEach((listener) => listener(newState, error));
  }

  public getState(): PlaybackState {
    return this.state;
  }

  public getCurrentStation(): Station | null {
    return this.currentStation;
  }

  public getVolume(): number {
    return this.volume;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  /** Seek within the current finite track (no-op for live radio / native). */
  public seek(seconds: number) {
    if (this.audio && Number.isFinite(seconds)) {
      this.audio.currentTime = Math.max(0, seconds);
      this.timeListeners.forEach((listener) =>
        listener(this.getCurrentTime(), this.getDuration())
      );
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.audio) {
      this.audio.muted = muted;
    }
  }

  public async play(station: Station) {
    if (typeof window === 'undefined') return;
    if (!this.isInitialized) this.init();

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    const isSameStation = this.currentStation?.id === station.id;

    if (isSameStation && this.state === 'playing') {
      return;
    }

    const streamUrl = station.urlResolved || station.url;
    if (!isJamStreamPlayableOnWeb(streamUrl)) {
      this.currentStation = station;
      this.setState(
        'error',
        'This stream uses HTTP and is blocked by the browser on HTTPS pages. Choose an HTTPS station.'
      );
      return;
    }

    this.currentStation = station;
    this.retryCount = 0;
    this.setState('loading');

    // Route to native foreground service on Android
    if (this.isNative) {
      try {
        await NativeRadio.play({
          url: station.urlResolved || station.url,
          title: station.name,
          artist:
            station.artist ||
            (station.tags || []).slice(0, 3).join(' • ') ||
            'Live Radio',
        });
      } catch (err: any) {
        this.handleStreamError(err?.message || 'Native playback failed');
      }
      return;
    }

    // Web audio path
    if (isSameStation && this.state === 'paused' && this.audio?.src) {
      try {
        await this.audio.play();
        this.setState('playing');
        return;
      } catch (err) {
        console.warn('[AudioEngine] Resume failed, re-initializing stream', err);
      }
    }

    this.updateMediaSessionMetadata(station);
    await this.loadAndPlay(station.urlResolved || station.url);
  }

  private async loadAndPlay(streamUrl: string) {
    if (!this.audio) return;

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    const isHls = streamUrl.includes('.m3u8') || streamUrl.includes('m3u8');

    if (isHls && this.audio.canPlayType('application/vnd.apple.mpegurl')) {
      this.audio.src = streamUrl;
      this.attemptPlay();
      return;
    }

    if (isHls) {
      try {
        const HlsModule = await import('hls.js');
        const Hls = HlsModule.default;
        if (Hls.isSupported()) {
          this.hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          this.hls.loadSource(streamUrl);
          this.hls.attachMedia(this.audio);
          this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
            this.attemptPlay();
          });
          this.hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
            if (data.fatal) {
              this.handleStreamError(`HLS Fatal error: ${data.type}`);
            }
          });
          return;
        }
      } catch (err) {
        console.warn('[AudioEngine] Hls.js import failed, falling back to direct src', err);
      }
    }

    this.audio.src = streamUrl;
    this.attemptPlay();
  }

  private async attemptPlay() {
    if (!this.audio) return;
    try {
      await this.audio.play();
      this.setState('playing');
      this.retryCount = 0;
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        console.warn('[AudioEngine] Autoplay blocked, waiting for user gesture');
        this.setState('paused');
      } else {
        this.handleStreamError(err.message || 'Failed to play stream');
      }
    }
  }

  public pause() {
    if (this.isNative) {
      NativeRadio.pause().catch(() => {});
      this.setState('paused');
      return;
    }
    if (this.audio) {
      this.audio.pause();
      this.setState('paused');
    }
  }

  public resume() {
    if (this.isNative) {
      NativeRadio.resume().catch(() => {});
      this.setState('playing');
      return;
    }
    if (this.currentStation) {
      this.play(this.currentStation);
    }
  }

  public stop() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    if (this.isNative) {
      NativeRadio.stop().catch(() => {});
      this.currentStation = null;
      this.retryCount = 0;
      this.setState('idle');
      return;
    }

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio.removeAttribute('src');
    }

    this.currentStation = null;
    this.retryCount = 0;
    this.setState('idle');
    this.clearMediaSession();
  }

  private handleStreamError(errorMsg: string) {
    if (this.retryCount < this.maxRetries && this.currentStation) {
      this.retryCount++;
      const backoffMs = Math.min(1000 * Math.pow(2, this.retryCount), 6000);
      console.warn(`[AudioEngine] Retrying stream (${this.retryCount}/${this.maxRetries}) in ${backoffMs}ms...`);
      this.setState('loading');
      this.retryTimer = setTimeout(() => {
        if (this.currentStation) {
          if (this.isNative) {
            this.play(this.currentStation);
          } else {
            this.loadAndPlay(this.currentStation.urlResolved || this.currentStation.url);
          }
        }
      }, backoffMs);
    } else {
      console.error('[AudioEngine] Stream failed:', errorMsg);
      this.setState('error', errorMsg);
    }
  }

  private setupMediaSessionHandlers() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => {
      this.resume();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      this.pause();
    });

    navigator.mediaSession.setActionHandler('stop', () => {
      this.stop();
    });
  }

  private updateMediaSessionMetadata(station: Station) {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      const artwork = station.favicon
        ? [
            { src: station.favicon, sizes: '96x96' },
            { src: station.favicon, sizes: '256x256' },
            { src: station.favicon, sizes: '512x512' },
          ]
        : [];

      navigator.mediaSession.metadata = new MediaMetadata({
        title: station.name,
        artist:
          station.artist ||
          (station.tags || []).slice(0, 3).join(' • ') ||
          'Live Radio',
        album: 'Onechat Jam',
        artwork,
      });
    } catch (e) {
      console.debug('[AudioEngine] MediaMetadata update error', e);
    }
  }

  private clearMediaSession() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = null;
    } catch {}
  }
}

export const audioEngine = AudioEngine.getInstance();
