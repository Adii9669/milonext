/**
 * Onechat Jam — Music Provider Abstraction (Phase 2)
 *
 * Playback is still handled by the single AudioEngine. Providers only
 * describe their catalog and resolve a direct stream URL, which keeps
 * the player, store, mini player and chat sharing provider-agnostic.
 */

import type { JamProviderId } from "../types/jam";

export interface MusicTrack {
  id: string;
  provider: JamProviderId;
  title: string;
  artist: string;
  album?: string;
  durationMs?: number;
  artworkUrl?: string;
  /** Provider-native identifier/permalink (not necessarily playable). */
  uri: string;
  isStreamable: boolean;
}

export interface ProviderSearchOptions {
  limit?: number;
  offset?: number;
}

export interface MusicProvider {
  readonly id: JamProviderId;
  readonly name: string;
  readonly shortLabel: string;
  /** True when the provider needs an OAuth account before it can stream. */
  readonly requiresAuth: boolean;
  /** False when required configuration (API key, OAuth) is missing. */
  readonly isAvailable: boolean;
  readonly unavailableReason?: string;

  connect(): Promise<void>;
  disconnect(): Promise<void>;

  search(query: string, options?: ProviderSearchOptions): Promise<MusicTrack[]>;
  getTrending?(options?: ProviderSearchOptions): Promise<MusicTrack[]>;

  /** Resolve a direct audio URL playable by AudioEngine. */
  getStreamUrl(track: MusicTrack): string;
}
