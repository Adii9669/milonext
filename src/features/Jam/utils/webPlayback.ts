/**
 * Web playback helpers.
 *
 * Browsers block insecure (HTTP) audio streams when the app itself is served
 * over HTTPS. Radio Browser still lists many HTTP-only stations, so we hide
 * them on HTTPS and fail with a clear message if one is opened directly
 * (e.g. from an older chat share).
 */

import type { Station } from '../types/jam';

export function isHttpsPage(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'https:';
}

export function isJamStreamPlayableOnWeb(url?: string | null): boolean {
  if (!url) return false;
  if (!isHttpsPage()) return true;
  return /^https:\/\//i.test(url.trim());
}

export function filterPlayableStations(stations: Station[]): Station[] {
  return stations.filter((station) =>
    isJamStreamPlayableOnWeb(station.urlResolved || station.url)
  );
}
