'use client';

/**
 * TanStack Query hooks for Phase 2 music providers.
 * Results are normalized to `Station` so the rest of Jam is unchanged.
 */

import { useQuery } from '@tanstack/react-query';
import { musicProviderRegistry } from '../providers/registry';
import { musicTrackToStation } from '../providers/toStation';
import type { JamProviderId, Station } from '../types/jam';
import { isJamEnabled } from '../utils/featureFlag';

export function useProviderSearch(
  providerId: JamProviderId,
  query: string,
  enabled: boolean
) {
  const provider = musicProviderRegistry.get(providerId);

  return useQuery({
    queryKey: ['jam-provider-search', providerId, query],
    queryFn: async (): Promise<Station[]> => {
      if (!provider) return [];
      const tracks = await provider.search(query, { limit: 40 });
      return tracks.map((track) =>
        musicTrackToStation(track, provider.getStreamUrl(track))
      );
    },
    enabled:
      isJamEnabled() &&
      enabled &&
      Boolean(provider?.isAvailable) &&
      query.trim().length > 0,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 15,
    placeholderData: (prev) => prev,
  });
}

export function useProviderTrending(
  providerId: JamProviderId,
  enabled: boolean
) {
  const provider = musicProviderRegistry.get(providerId);

  return useQuery({
    queryKey: ['jam-provider-trending', providerId],
    queryFn: async (): Promise<Station[]> => {
      if (!provider) return [];
      if (provider.getTrending) {
        const tracks = await provider.getTrending({ limit: 40 });
        return tracks.map((track) =>
          musicTrackToStation(track, provider.getStreamUrl(track))
        );
      }
      return [];
    },
    enabled:
      isJamEnabled() &&
      enabled &&
      Boolean(provider?.isAvailable) &&
      Boolean(provider?.getTrending),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}
