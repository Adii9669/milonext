/**
 * Radio Browser API Client
 * Free community API for live public radio discovery with mirror fallback and click counting.
 * https://www.radio-browser.info/
 */

import type { Station, RadioBrowserStation, RadioBrowserFilter } from '../types/jam';

const DEFAULT_MIRRORS = [
  'https://de1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://at1.api.radio-browser.info',
];

const APP_USER_AGENT = 'Onechat-Jam/1.0.0 (https://onechat.app)';

class RadioBrowserClient {
  private mirrors: string[] = [...DEFAULT_MIRRORS];
  private currentMirrorIndex = 0;
  private hasDiscoveredServers = false;

  private getCurrentBaseUrl(): string {
    return this.mirrors[this.currentMirrorIndex] || DEFAULT_MIRRORS[0];
  }

  private rotateMirror() {
    this.currentMirrorIndex = (this.currentMirrorIndex + 1) % this.mirrors.length;
    console.warn(`[RadioBrowser] Switched to mirror: ${this.getCurrentBaseUrl()}`);
  }

  /**
   * Discovers fresh pool of mirror servers from the Radio Browser network.
   */
  public async discoverServers(): Promise<void> {
    if (this.hasDiscoveredServers) return;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${this.getCurrentBaseUrl()}/json/servers`, {
        headers: { 'User-Agent': APP_USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const servers: { name: string; ip: string }[] = await res.json();
        const urls = servers.map((s) => `https://${s.name}`).filter((u) => u.startsWith('https://'));
        if (urls.length > 0) {
          this.mirrors = urls;
          this.hasDiscoveredServers = true;
        }
      }
    } catch {
      // Keep using default mirrors on failure
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let attempts = 0;
    const maxAttempts = this.mirrors.length;

    while (attempts < maxAttempts) {
      const baseUrl = this.getCurrentBaseUrl();
      const url = `${baseUrl}${endpoint}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const response = await fetch(url, {
          ...options,
          headers: {
            'User-Agent': APP_USER_AGENT,
            Accept: 'application/json',
            ...(options.headers || {}),
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return (await response.json()) as T;
      } catch (err) {
        attempts++;
        this.rotateMirror();
        if (attempts >= maxAttempts) {
          throw err;
        }
      }
    }

    throw new Error('All Radio Browser mirrors failed to respond.');
  }

  /**
   * Map raw RadioBrowserStation format to clean application Station format.
   */
  public mapToStation(raw: RadioBrowserStation): Station {
    const rawTags = raw.tags
      ? raw.tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];

    // Prefer an HTTPS stream when the directory provides one — HTTP streams
    // are blocked by browsers when the app is served over HTTPS.
    const candidates = [raw.url_resolved, raw.url].filter(Boolean) as string[];
    const streamUrl =
      candidates.find((url) => /^https:\/\//i.test(url)) || candidates[0] || '';

    return {
      id: raw.stationuuid,
      name: raw.name.trim(),
      url: streamUrl,
      urlResolved: streamUrl,
      homepage: raw.homepage || undefined,
      favicon: raw.favicon && raw.favicon.startsWith('http') ? raw.favicon : undefined,
      tags: rawTags,
      country: raw.country || undefined,
      countryCode: raw.countrycode || undefined,
      language: raw.language || undefined,
      codec: raw.codec || undefined,
      bitrate: raw.bitrate || undefined,
      votes: raw.votes || 0,
      clickCount: raw.clickcount || 0,
      isDefault: false,
    };
  }

  /**
   * Search stations with multi-parameter filtering.
   */
  public async searchStations(filter: RadioBrowserFilter = {}): Promise<Station[]> {
    const params = new URLSearchParams();

    if (filter.name?.trim()) params.append('name', filter.name.trim());
    if (filter.tag?.trim() && filter.tag !== 'all') params.append('tag', filter.tag.trim());
    if (filter.countrycode?.trim()) params.append('countrycode', filter.countrycode.trim());
    if (filter.language?.trim()) params.append('language', filter.language.trim());

    params.append('limit', String(filter.limit || 30));
    params.append('offset', String(filter.offset || 0));
    params.append('order', filter.order || 'clickcount');
    params.append('reverse', String(filter.reverse !== false));
    params.append('hidebroken', 'true');
    params.append('lastcheckok', '1');

    const data = await this.request<RadioBrowserStation[]>(
      `/json/stations/search?${params.toString()}`
    );

    return data.map((item) => this.mapToStation(item));
  }

  /**
   * Fetch top clicked / trending stations.
   */
  public async getTopClicks(limit: number = 30): Promise<Station[]> {
    const data = await this.request<RadioBrowserStation[]>(
      `/json/stations/topclick/${limit}?hidebroken=true`
    );
    return data.map((item) => this.mapToStation(item));
  }

  /**
   * Fetch top community voted stations.
   */
  public async getTopVotes(limit: number = 30): Promise<Station[]> {
    const data = await this.request<RadioBrowserStation[]>(
      `/json/stations/topvote/${limit}?hidebroken=true`
    );
    return data.map((item) => this.mapToStation(item));
  }

  /**
   * Record a station click. This is standard Radio Browser etiquette to support station analytics.
   * Also returns the resolved stream URL.
   */
  public async recordStationClick(stationUuid: string): Promise<string | null> {
    try {
      const res = await this.request<{ ok: boolean; url?: string }>(
        `/json/url/${encodeURIComponent(stationUuid)}`
      );
      return res.url || null;
    } catch {
      return null;
    }
  }
}

export const radioBrowserApi = new RadioBrowserClient();
