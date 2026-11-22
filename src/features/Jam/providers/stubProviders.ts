/**
 * Placeholder providers for Phase 2 services that need OAuth / SDKs.
 * They are registered so the UI can show them as "Soon" and so the
 * registry contract is exercised, but they never return tracks.
 */

import type { JamProviderId } from "../types/jam";
import type { MusicProvider } from "./types";

function createUnavailableProvider(
  id: JamProviderId,
  name: string,
  reason: string
): MusicProvider {
  return {
    id,
    name,
    shortLabel: name,
    requiresAuth: true,
    isAvailable: false,
    unavailableReason: reason,

    async connect() {
      throw new Error(`${name} connection is not implemented yet`);
    },

    async disconnect() {
      /* Nothing to disconnect. */
    },

    async search() {
      throw new Error(`${name} is not implemented yet`);
    },

    async getTrending() {
      throw new Error(`${name} is not implemented yet`);
    },

    getStreamUrl() {
      throw new Error(`${name} is not implemented yet`);
    },
  };
}

export const spotifyProvider = createUnavailableProvider(
  "spotify",
  "Spotify",
  "Requires Spotify Premium OAuth (Phase 2.3)"
);

export const soundcloudProvider = createUnavailableProvider(
  "soundcloud",
  "SoundCloud",
  "Requires the SoundCloud Widget API (Phase 2.4)"
);

export const youtubeProvider = createUnavailableProvider(
  "youtube",
  "YouTube Music",
  "Requires the YouTube IFrame Player API (Phase 2.5)"
);
