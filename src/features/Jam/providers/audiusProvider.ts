/**
 * Audius provider — free, open catalog with direct MP3 streams.
 * No account or API key required.
 *
 * API: https://api.audius.co/v1
 */

import type { MusicProvider, MusicTrack, ProviderSearchOptions } from "./types";

const API_BASE = "https://api.audius.co";
const APP_NAME = "Onechat";

interface AudiusTrack {
  id: string;
  title: string;
  duration?: number;
  genre?: string;
  artwork?: Record<string, string | string[]>;
  user?: { name?: string };
  is_streamable?: boolean;
  is_delete?: boolean;
  permalink?: string;
}

function artwork(track: AudiusTrack): string | undefined {
  const art = track.artwork;
  if (!art) return undefined;
  return (
    (art["480x480"] as string) ||
    (art["150x150"] as string) ||
    (art["1000x1000"] as string)
  );
}

function mapTrack(track: AudiusTrack): MusicTrack {
  return {
    id: track.id,
    provider: "audius",
    title: track.title,
    artist: track.user?.name || "Audius Artist",
    album: track.genre || undefined,
    durationMs: track.duration ? track.duration * 1000 : undefined,
    artworkUrl: artwork(track),
    uri: track.permalink || `https://audius.co/tracks/${track.id}`,
    isStreamable: track.is_streamable !== false && !track.is_delete,
  };
}

async function fetchAudiusTracks(url: string): Promise<MusicTrack[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[Audius] API returned status ${res.status}`);
      return [];
    }
    const json = (await res.json()) as { data?: AudiusTrack[] };
    const tracks = Array.isArray(json.data) ? json.data : [];
    return tracks.map(mapTrack).filter((t) => t.isStreamable);
  } catch (err) {
    console.warn("[Audius] Network request failed:", err);
    return [];
  }
}

export const audiusProvider: MusicProvider = {
  id: "audius",
  name: "Audius",
  shortLabel: "Audius",
  requiresAuth: false,
  isAvailable: true,

  async connect() {
    /* Public catalog — nothing to connect. */
  },

  async disconnect() {
    /* Stateless. */
  },

  async search(query: string, options: ProviderSearchOptions = {}) {
    const limit = options.limit ?? 40;
    return fetchAudiusTracks(
      `${API_BASE}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${APP_NAME}&limit=${limit}`
    );
  },

  async getTrending(options: ProviderSearchOptions = {}) {
    const limit = options.limit ?? 40;
    return fetchAudiusTracks(
      `${API_BASE}/v1/tracks/trending?app_name=${APP_NAME}&limit=${limit}`
    );
  },

  getStreamUrl(track: MusicTrack) {
    return `${API_BASE}/v1/tracks/${encodeURIComponent(track.id)}/stream?app_name=${APP_NAME}`;
  },
};
