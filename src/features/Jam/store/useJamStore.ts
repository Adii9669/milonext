/**
 * useJamStore - Zustand store for Onechat Jam
 * Manages playback status, volume, drawer visibility, favorites, recents,
 * and the play queue (auto-advance for finite provider tracks).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Station, PlaybackState, JamSession } from '../types/jam';
import { audioEngine } from '../engine/AudioEngine';
import { radioBrowserApi } from '../api/radioBrowserApi';

interface JamState {
  currentStation: Station | null;
  playbackState: PlaybackState;
  volume: number;
  isMuted: boolean;
  isPanelOpen: boolean;
  errorMessage: string | null;
  favorites: Station[];
  recentStations: Station[];
  activeJamSession: JamSession | null;
  /** Tracks queued for sequential playback. Live radio is a queue of one. */
  queue: Station[];
  /** Index of currentStation inside queue, or -1 when no queue is active. */
  queueIndex: number;
  /** Playback position of the current finite track, in seconds. */
  progress: { currentTime: number; duration: number };
  repeatMode: 'off' | 'all' | 'one';
  isShuffled: boolean;

  // Actions
  playStation: (station: Station) => void;
  playQueue: (stations: Station[], startIndex?: number) => void;
  playQueueIndex: (index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (station: Station) => void;
  removeFromQueue: (stationId: string) => void;
  clearQueue: () => void;
  seek: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  toggleFavorite: (station: Station) => void;
  isFavorite: (stationId: string) => boolean;
  setActiveJamSession: (session: JamSession | null) => void;
  clearError: () => void;
}

export const useJamStore = create<JamState>()(
  persist(
    (set, get) => {
      /**
       * Single internal entry point for starting playback. Keeps the queue
       * in sync and applies the existing recents / Radio Browser etiquette.
       */
      const playStationInternal = (
        station: Station,
        queue: Station[],
        queueIndex: number
      ) => {
        const { recentStations, volume, isMuted } = get();

        // Ensure audio engine volume matches store
        audioEngine.setVolume(volume);
        audioEngine.setMuted(isMuted);

        // Update recent stations (max 20, unique by id)
        const filteredRecents = recentStations.filter((s) => s.id !== station.id);
        const updatedRecents = [station, ...filteredRecents].slice(0, 20);

        set({
          currentStation: station,
          recentStations: updatedRecents,
          queue,
          queueIndex,
          errorMessage: null,
          progress: {
            currentTime: 0,
            // Native playback has no timeupdate events, so seed the known
            // duration from the catalog when available.
            duration: station.durationMs
              ? station.durationMs / 1000
              : audioEngine.getDuration(),
          },
        });

        // Radio Browser etiquette: record click for directory rankings.
        // Provider tracks (Audius/Jamendo/etc.) are not Radio Browser stations.
        const isRadioStation =
          !station.provider || station.provider === 'radio';
        if (
          isRadioStation &&
          !station.isDefault &&
          !station.id.startsWith('default-')
        ) {
          radioBrowserApi.recordStationClick(station.id).catch(() => {});
        }

        audioEngine.play(station);
      };

      // Connect to AudioEngine state updates in browser asynchronously after store creation
      if (typeof window !== 'undefined') {
        queueMicrotask(() => {
          audioEngine.subscribe((state, error) => {
            set({
              playbackState: state,
              errorMessage: error || null,
            });
          });

          // Finite tracks (Audius/Jamendo) end naturally -> advance the queue.
          audioEngine.onTrackEnded(() => {
            const { repeatMode, currentStation, playNext } = get();
            if (repeatMode === 'one' && currentStation) {
              audioEngine.seek(0);
              audioEngine.resume();
              return;
            }
            playNext();
          });

          audioEngine.onTimeUpdate((currentTime, duration) => {
            set({ progress: { currentTime, duration } });
          });
        });
      }

      return {
        currentStation: null,
        playbackState: 'idle',
        volume: 0.8,
        isMuted: false,
        isPanelOpen: false,
        errorMessage: null,
        favorites: [],
        recentStations: [],
        activeJamSession: null,
        queue: [],
        queueIndex: -1,
        progress: { currentTime: 0, duration: 0 },
        repeatMode: 'off',
        isShuffled: false,

        /** Play a single station (replaces any active queue). */
        playStation: (station: Station) => {
          playStationInternal(station, [station], 0);
        },

        /** Play a list, starting at startIndex. Used by the Jam panel rows. */
        playQueue: (stations: Station[], startIndex = 0) => {
          const playable = stations.filter(Boolean);
          if (playable.length === 0) return;
          const index = Math.max(0, Math.min(startIndex, playable.length - 1));
          playStationInternal(playable[index], playable, index);
        },

        /** Jump directly to a track in the active queue. */
        playQueueIndex: (index: number) => {
          const { queue } = get();
          if (index < 0 || index >= queue.length) return;
          playStationInternal(queue[index], queue, index);
        },

        playNext: () => {
          const { queue, queueIndex, isShuffled, repeatMode, playQueueIndex } = get();
          if (queue.length === 0) return;

          if (isShuffled && queue.length > 1) {
            let nextIndex = Math.floor(Math.random() * queue.length);
            if (nextIndex === queueIndex) {
              nextIndex = (nextIndex + 1) % queue.length;
            }
            playQueueIndex(nextIndex);
            return;
          }

          if (queueIndex >= 0 && queueIndex + 1 < queue.length) {
            playQueueIndex(queueIndex + 1);
          } else if (repeatMode === 'all' && queue.length > 0) {
            playQueueIndex(0);
          }
        },

        toggleRepeat: () => {
          const { repeatMode } = get();
          const nextMode: 'off' | 'all' | 'one' =
            repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
          set({ repeatMode: nextMode });
        },

        toggleShuffle: () => {
          set((state) => ({ isShuffled: !state.isShuffled }));
        },

        playPrevious: () => {
          const { queueIndex, currentStation, playbackState, playQueueIndex } = get();
          if (queueIndex > 0) {
            playQueueIndex(queueIndex - 1);
            return;
          }
          // At the start of the queue: restart the current finite track.
          if (currentStation?.provider && currentStation.provider !== 'radio') {
            audioEngine.seek(0);
            if (playbackState !== 'playing') {
              audioEngine.resume();
            }
          }
        },

        addToQueue: (station: Station) => {
          const { queue, currentStation } = get();
          if (!currentStation) {
            playStationInternal(station, [station], 0);
            return;
          }
          if (queue.some((item) => item.id === station.id)) {
            return;
          }
          // A persisted session may have a current station but no queue.
          if (queue.length === 0) {
            set({ queue: [currentStation, station], queueIndex: 0 });
            return;
          }
          set({ queue: [...queue, station] });
        },

        removeFromQueue: (stationId: string) => {
          const { queue, queueIndex } = get();
          const index = queue.findIndex((station) => station.id === stationId);
          if (index < 0) return;

          const nextQueue = queue.filter((_, i) => i !== index);

          if (nextQueue.length === 0) {
            // Removed the last queued item: keep the current audio, drop the queue.
            set({ queue: [], queueIndex: -1 });
            return;
          }

          if (index === queueIndex) {
            // Removing the playing track: start whatever took its place.
            const nextIndex = Math.min(index, nextQueue.length - 1);
            playStationInternal(nextQueue[nextIndex], nextQueue, nextIndex);
            return;
          }

          set({
            queue: nextQueue,
            queueIndex: index < queueIndex ? queueIndex - 1 : queueIndex,
          });
        },

        clearQueue: () => set({ queue: [], queueIndex: -1 }),

        seek: (seconds: number) => {
          audioEngine.seek(seconds);
          set((state) => ({
            progress: { ...state.progress, currentTime: Math.max(0, seconds) },
          }));
        },

        pause: () => {
          audioEngine.pause();
        },

        resume: () => {
          const { currentStation, playbackState } = get();
          if (currentStation) {
            if (playbackState === 'idle') {
              audioEngine.play(currentStation);
            } else {
              audioEngine.resume();
            }
          }
        },

        togglePlayPause: () => {
          const { playbackState, currentStation } = get();
          if (playbackState === 'playing') {
            audioEngine.pause();
          } else if (currentStation) {
            if (playbackState === 'idle' || playbackState === 'error') {
              audioEngine.play(currentStation);
            } else {
              audioEngine.resume();
            }
          }
        },

        stop: () => {
          audioEngine.stop();
          set({
            playbackState: 'idle',
            currentStation: null,
            queue: [],
            queueIndex: -1,
            progress: { currentTime: 0, duration: 0 },
            errorMessage: null,
          });
        },

        setVolume: (volume: number) => {
          const clamped = Math.max(0, Math.min(1, volume));
          audioEngine.setVolume(clamped);
          set({ volume: clamped, isMuted: clamped === 0 ? true : get().isMuted });
        },

        toggleMute: () => {
          const nextMuted = !get().isMuted;
          audioEngine.setMuted(nextMuted);
          set({ isMuted: nextMuted });
        },

        openPanel: () => set({ isPanelOpen: true }),
        closePanel: () => set({ isPanelOpen: false }),
        togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

        toggleFavorite: (station: Station) => {
          const { favorites } = get();
          const exists = favorites.some((s) => s.id === station.id);
          const updated = exists
            ? favorites.filter((s) => s.id !== station.id)
            : [station, ...favorites];

          set({ favorites: updated });
        },

        isFavorite: (stationId: string) => {
          return get().favorites.some((s) => s.id === stationId);
        },

        setActiveJamSession: (session: JamSession | null) => {
          set({ activeJamSession: session });
        },

        clearError: () => set({ errorMessage: null }),
      };
    },
    {
      name: 'onechat-jam-storage',
      // Persist only client preferences and offline lists, not transient playback states.
      // The queue is intentionally transient: provider stream URLs can expire.
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        currentStation: state.currentStation,
        favorites: state.favorites,
        recentStations: state.recentStations,
        repeatMode: state.repeatMode,
        isShuffled: state.isShuffled,
      }),
      merge: (persistedState: any, currentState: JamState) => ({
        ...currentState,
        ...(persistedState && typeof persistedState === 'object' ? persistedState : {}),
        // Explicitly guarantee actions are never overwritten by stale/corrupted storage
        openPanel: currentState.openPanel,
        closePanel: currentState.closePanel,
        togglePanel: currentState.togglePanel,
        playStation: currentState.playStation,
        togglePlayPause: currentState.togglePlayPause,
        pause: currentState.pause,
        resume: currentState.resume,
        stop: currentState.stop,
        seek: currentState.seek,
        setVolume: currentState.setVolume,
        toggleMute: currentState.toggleMute,
        toggleFavorite: currentState.toggleFavorite,
        playNext: currentState.playNext,
        playPrevious: currentState.playPrevious,
        toggleRepeat: currentState.toggleRepeat,
        toggleShuffle: currentState.toggleShuffle,
        playQueue: currentState.playQueue,
        playQueueIndex: currentState.playQueueIndex,
        addToQueue: currentState.addToQueue,
        removeFromQueue: currentState.removeFromQueue,
        clearQueue: currentState.clearQueue,
      }),
    }
  )
);

/** Direct, bulletproof action triggers usable from any component */
export function toggleJamPanel() {
  const store = useJamStore.getState();
  if (typeof store.togglePanel === 'function') {
    store.togglePanel();
  } else {
    useJamStore.setState((s) => ({ isPanelOpen: !s.isPanelOpen }));
  }
}

export function openJamPanel() {
  const store = useJamStore.getState();
  if (typeof store.openPanel === 'function') {
    store.openPanel();
  } else {
    useJamStore.setState({ isPanelOpen: true });
  }
}

export function closeJamPanel() {
  const store = useJamStore.getState();
  if (typeof store.closePanel === 'function') {
    store.closePanel();
  } else {
    useJamStore.setState({ isPanelOpen: false });
  }
}
