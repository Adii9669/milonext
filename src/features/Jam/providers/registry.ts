/**
 * Provider registry — the single place the UI asks for an audio catalog.
 */

import type { JamProviderId } from "../types/jam";
import type { MusicProvider } from "./types";
import { audiusProvider } from "./audiusProvider";
import { jamendoProvider } from "./jamendoProvider";
import {
  spotifyProvider,
  soundcloudProvider,
  youtubeProvider,
} from "./stubProviders";

class MusicProviderRegistry {
  private providers = new Map<JamProviderId, MusicProvider>();

  register(provider: MusicProvider) {
    this.providers.set(provider.id, provider);
  }

  get(id: JamProviderId): MusicProvider | undefined {
    return this.providers.get(id);
  }

  list(): MusicProvider[] {
    return Array.from(this.providers.values());
  }

  available(): MusicProvider[] {
    return this.list().filter((provider) => provider.isAvailable);
  }
}

export const musicProviderRegistry = new MusicProviderRegistry();

musicProviderRegistry.register(audiusProvider);
musicProviderRegistry.register(jamendoProvider);
musicProviderRegistry.register(spotifyProvider);
musicProviderRegistry.register(soundcloudProvider);
musicProviderRegistry.register(youtubeProvider);
