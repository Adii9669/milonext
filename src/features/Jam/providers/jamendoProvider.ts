/**
 * Jamendo provider — Creative Commons catalog with direct MP3 streams.
 * Requires a free client id: NEXT_PUBLIC_JAMENDO_CLIENT_ID
 *
 * API: https://api.jamendo.com/v3.0
 */

import type { MusicProvider, MusicTrack, ProviderSearchOptions } from "./types";

const API_BASE = "https://api.jamendo.com/v3.0";
const CLIENT_ID = process.env.NEXT_PUBLIC_JAMENDO_CLIENT_ID?.trim();

interface JamendoTrack {
  id: string;
  name: string;
  artist_name?: string;
  album_name?: string;
  duration?: number;
  image?: string;
  audio?: string;
  audiodownload?: string;
  genre?: string;
}

function mapTrack(track: JamendoTrack): MusicTrack {
  const streamUrl = track.audio || track.audiodownload || "";
  return {
    id: track.id,
    provider: "jamendo",
    title: track.name,
    artist: track.artist_name || "Jamendo Artist",
    album: track.album_name || undefined,
    durationMs: track.duration ? track.duration * 1000 : undefined,
    artworkUrl: track.image,
    uri: streamUrl,
    isStreamable: Boolean(streamUrl),
  };
}

async function fetchJamendoTracks(params: Record<string, string>): Promise<MusicTrack[]> {
  if (!CLIENT_ID) {
    throw new Error("Jamendo is not configured (missing client id)");
  }

  const query = new URLSearchParams({
    client_id: CLIENT_ID,
    format: "json",
    audioformat: "mp32",
    include: "musicinfo",
    ...params,
  });

  const res = await fetch(`${API_BASE}/tracks/?${query.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Jamendo request failed (${res.status})`);
  }

  const json = (await res.json()) as {
    headers?: { status?: string; code?: number };
    results?: JamendoTrack[];
  };

  if (json.headers?.status === "failed") {
    throw new Error("Jamendo rejected the request (check client id)");
  }

  const tracks = Array.isArray(json.results) ? json.results : [];
  return tracks.map(mapTrack).filter((t) => t.isStreamable);
}

export const jamendoProvider: MusicProvider = {
  id: "jamendo",
  name: "Jamendo Music",
  shortLabel: "Jamendo",
  requiresAuth: false,
  isAvailable: Boolean(CLIENT_ID),
  unavailableReason: CLIENT_ID
    ? undefined
    : "Set NEXT_PUBLIC_JAMENDO_CLIENT_ID to enable Jamendo",

  async connect() {
    /* Public Creative Commons catalog — no account needed. */
  },

  async disconnect() {
    /* Stateless. */
  },

  async search(query: string, options: ProviderSearchOptions = {}) {
    return fetchJamendoTracks({
      search: query,
      limit: String(options.limit ?? 40),
      order: "popularity_total",
    });
  },

  async getTrending(options: ProviderSearchOptions = {}) {
    return fetchJamendoTracks({
      limit: String(options.limit ?? 40),
      order: "popularity_month",
    });
  },

  getStreamUrl(track: MusicTrack) {
    return track.uri;
  },
};
