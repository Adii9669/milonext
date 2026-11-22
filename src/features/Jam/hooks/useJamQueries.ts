/**
 * TanStack Query hooks for Onechat Jam
 * Provides cached, debounced search and trending station discovery with offline fallback.
 */

import { useQuery } from '@tanstack/react-query';
import { radioBrowserApi } from '../api/radioBrowserApi';
import { DEFAULT_STATIONS } from '../data/defaultStations';
import { Station, RadioBrowserFilter } from '../types/jam';
import { isJamEnabled } from '../utils/featureFlag';

export const JAM_QUERY_KEYS = {
  all: ['jam'] as const,
  search: (filter: RadioBrowserFilter) => ['jam', 'search', filter] as const,
  trending: (limit: number) => ['jam', 'trending', limit] as const,
  topVotes: (limit: number) => ['jam', 'topVotes', limit] as const,
};

/**
 * Live station search with tag filtering, ordering, and default fallback.
 */
export function useJamStationSearch(filter: RadioBrowserFilter, enabled: boolean = true) {
  const isFeatureEnabled = isJamEnabled();

  return useQuery({
    queryKey: JAM_QUERY_KEYS.search(filter),
    queryFn: async (): Promise<Station[]> => {
      try {
        const results = await radioBrowserApi.searchStations(filter);
        if (results.length > 0) {
          return results;
        }
        // If API returned 0 results and filtering by tag, filter default stations
        if (filter.tag && filter.tag !== 'all') {
          return DEFAULT_STATIONS.filter((st) =>
            st.tags.some((t) => t.toLowerCase().includes(filter.tag!.toLowerCase()))
          );
        }
        return DEFAULT_STATIONS;
      } catch (err) {
        console.warn('[JamQuery] Live search failed, using default stations', err);
        return DEFAULT_STATIONS;
      }
    },
    enabled: isFeatureEnabled && enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    placeholderData: (prev) => prev,
  });
}

/**
 * Top clicked / trending radio stations.
 */
export function useJamTrending(limit: number = 25, enabled: boolean = true) {
  const isFeatureEnabled = isJamEnabled();

  return useQuery({
    queryKey: JAM_QUERY_KEYS.trending(limit),
    queryFn: async (): Promise<Station[]> => {
      try {
        const results = await radioBrowserApi.getTopClicks(limit);
        return results.length > 0 ? results : DEFAULT_STATIONS;
      } catch (err) {
        console.warn('[JamQuery] Trending fetch failed, using default stations', err);
        return DEFAULT_STATIONS;
      }
    },
    enabled: isFeatureEnabled && enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Top community voted radio stations.
 */
export function useJamTopVoted(limit: number = 25, enabled: boolean = true) {
  const isFeatureEnabled = isJamEnabled();

  return useQuery({
    queryKey: JAM_QUERY_KEYS.topVotes(limit),
    queryFn: async (): Promise<Station[]> => {
      try {
        const results = await radioBrowserApi.getTopVotes(limit);
        return results.length > 0 ? results : DEFAULT_STATIONS;
      } catch (err) {
        console.warn('[JamQuery] Top voted fetch failed, using default stations', err);
        return DEFAULT_STATIONS;
      }
    },
    enabled: isFeatureEnabled && enabled,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}
