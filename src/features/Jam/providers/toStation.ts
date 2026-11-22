/**
 * Normalizes provider tracks into the existing `Station` shape so the
 * store, AudioEngine, MiniPlayer, favorites and chat sharing keep working
 * without provider-specific branches.
 */

import type { Station } from "../types/jam";
import type { MusicTrack } from "./types";

const PROVIDER_LABELS: Record<string, string> = {
  audius: "Audius",
  jamendo: "Jamendo",
  spotify: "Spotify",
  soundcloud: "SoundCloud",
  youtube: "YouTube Music",
};

export function musicTrackToStation(
  track: MusicTrack,
  streamUrl: string
): Station {
  return {
    id: `${track.provider}:${track.id}`,
    name: track.title,
    url: streamUrl,
    urlResolved: streamUrl,
    favicon: track.artworkUrl,
    tags: [PROVIDER_LABELS[track.provider] || track.provider],
    country: track.artist,
    codec: "MP3",
    provider: track.provider,
    artist: track.artist,
    durationMs: track.durationMs,
    isDefault: false,
  };
}
