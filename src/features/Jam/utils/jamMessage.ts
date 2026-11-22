/**
 * Onechat Jam - Message Serializer & Parser
 * Enables sharing Jam radio stations directly inside conversation channels and DMs.
 */

import type { Station } from '../types/jam';

export const JAM_MESSAGE_PREFIX = '[onechat:jam]';

/**
 * Creates structured content string representing a shared radio jam.
 */
export function createJamMessageContent(station: Station): string {
  const payload = {
    id: station.id,
    name: station.name,
    url: station.url,
    urlResolved: station.urlResolved,
    favicon: station.favicon,
    tags: station.tags.slice(0, 4),
    country: station.country,
    bitrate: station.bitrate,
    codec: station.codec,
    provider: station.provider,
    artist: station.artist,
    durationMs: station.durationMs,
  };
  return `${JAM_MESSAGE_PREFIX}${JSON.stringify(payload)}`;
}

/**
 * Parses message content to check if it contains a shared Jam station.
 */
export function parseJamMessage(content?: string): Station | null {
  if (!content || !content.startsWith(JAM_MESSAGE_PREFIX)) {
    return null;
  }

  try {
    const jsonStr = content.slice(JAM_MESSAGE_PREFIX.length);
    const parsed = JSON.parse(jsonStr);

    if (parsed && parsed.id && parsed.name && (parsed.url || parsed.urlResolved)) {
      return {
        id: parsed.id,
        name: parsed.name,
        url: parsed.url || parsed.urlResolved,
        urlResolved: parsed.urlResolved || parsed.url,
        favicon: parsed.favicon,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        country: parsed.country,
        bitrate: parsed.bitrate,
        codec: parsed.codec,
        provider: parsed.provider,
        artist: parsed.artist,
        durationMs: parsed.durationMs,
        isDefault: false,
      };
    }
  } catch (err) {
    console.debug('[JamMessage] Failed to parse jam message content', err);
  }

  return null;
}

export function isJamMessage(content?: string): boolean {
  return Boolean(content && content.startsWith(JAM_MESSAGE_PREFIX));
}
