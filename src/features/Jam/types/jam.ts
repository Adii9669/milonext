/**
 * Onechat Jam - Core Type Definitions
 * Feature: Background Audio & Radio Player
 */

export type JamProviderId =
  | 'radio'
  | 'audius'
  | 'jamendo'
  | 'spotify'
  | 'soundcloud'
  | 'youtube';

export interface Station {
  id: string; // stationuuid or unique ID
  name: string;
  url: string; // Direct audio stream URL
  urlResolved?: string;
  favicon?: string;
  homepage?: string;
  tags: string[];
  country?: string;
  countryCode?: string;
  language?: string;
  codec?: string; // MP3, AAC, HLS, etc.
  bitrate?: number; // kbps
  votes?: number;
  clickCount?: number;
  isDefault?: boolean;
  /** Catalog that produced this station. Missing means internet radio. */
  provider?: JamProviderId;
  artist?: string;
  durationMs?: number;
}

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface RadioBrowserStation {
  changeuuid: string;
  stationuuid: string;
  serveruuid?: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  iso_3166_2?: string;
  state?: string;
  language: string;
  languagecodes?: string;
  votes: number;
  lastchangetime: string;
  codec: string;
  bitrate: number;
  hls: number;
  lastcheckok: number;
  lastchecktime: string;
  lastcheckoktime: string;
  lastlocalchecktime: string;
  clicktimestamp: string;
  clickcount: number;
  clicktrend: number;
  ssl_error: number;
  geo_lat?: number;
  geo_long?: number;
  has_extended_info?: boolean;
}

export interface RadioBrowserFilter {
  name?: string;
  tag?: string;
  countrycode?: string;
  language?: string;
  limit?: number;
  offset?: number;
  order?: 'votes' | 'clickcount' | 'clicktrend' | 'random' | 'name';
  reverse?: boolean;
  hidebroken?: boolean;
}

export interface JamSession {
  id: string;
  conversationId: string; // channel or DM identifier
  conversationType: 'channel' | 'dm';
  hostUserId: string;
  hostName: string;
  station: Station;
  startedAt: string;
  listenersCount: number;
}
