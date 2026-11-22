# Onechat Jam — Phase 2 Connected Music Providers Architecture

> **Implementation status (2026-11-22):** the provider abstraction, registry, `MusicTrack` → `Station` normalization, **Audius (live)** and **Jamendo (env-gated)** are implemented, along with a transient **play queue with auto-advance** for finite provider tracks. Spotify, SoundCloud and YouTube Music remain stubs shown as "Soon". See `ONECHAT_CONTEXT.md` §8.4, §8.5 and §10 for file-level detail and next steps.

This architectural document defines how Onechat will expand beyond public internet radio to support authenticated external music providers (Spotify, SoundCloud, Audius, Jamendo, and YouTube Music).

---

## 1. Provider Abstraction Interface

To prevent vendor lock-in and keep UI components decoupled from third-party SDK quirks, all music services implement the `MusicProvider` interface:

```typescript
export interface MusicTrack {
  id: string;
  provider: 'radio' | 'spotify' | 'soundcloud' | 'audius' | 'jamendo';
  title: string;
  artist: string;
  album?: string;
  durationMs?: number;
  artworkUrl?: string;
  uri: string;
  isStreamable: boolean;
}

export interface MusicProvider {
  readonly id: string;
  readonly name: string;
  readonly isConnected: boolean;

  // Account & OAuth
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  // Catalog & Search
  search(query: string, options?: { limit?: number; offset?: number }): Promise<MusicTrack[]>;
  getRecommendations?(): Promise<MusicTrack[]>;

  // Playback Control
  play(track: MusicTrack): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  seek?(positionMs: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
}
```

---

## 2. Evaluation of External Music Providers

### 2.1 Audius (Recommended Free Catalog)
- **Status**: Free & Open-Source.
- **Protocol**: Decentralized community API with free public discovery nodes (`https://discoveryprovider.audius.co`).
- **Legal/ToS**: Public catalog is free to stream with no licensing fees or API paywalls.
- **Audio Delivery**: Direct MP3 streaming over standard HTTP with no DRM restrictions.
- **Best For**: Independent electronic, lofi, hip-hop, and ambient playlists.

### 2.2 Jamendo (Creative Commons Music)
- **Status**: Free for non-commercial streaming.
- **Protocol**: RESTful API (`https://api.jamendo.com/v3.0`).
- **Legal/ToS**: All music is licensed under Creative Commons. Free developer access keys available.
- **Audio Delivery**: Direct MP3 audio streams.
- **Best For**: Background instrumental, lounge, acoustic, and focus music.

### 2.3 Spotify (Personal Account Connection)
- **Status**: Premium account required by Spotify ToS.
- **Protocol**: Spotify Web Playback SDK (`https://sdk.scdn.co/spotify-player.js`) + OAuth 2.0 PKCE flow.
- **Required Scopes**: `streaming`, `user-read-email`, `user-read-private`, `user-read-playback-state`, `user-modify-playback-state`.
- **Considerations**: Cannot rip or link raw audio bytes; must play via their authorized browser SDK or Spotify Connect player transfer.

### 2.4 SoundCloud
- **Status**: Official SoundCloud Widget API.
- **Protocol**: Embedded HTML5 Widget API (`https://w.soundcloud.com/player/api.js`).
- **Considerations**: Embed player must remain mounted (hidden or mini) according to SoundCloud developer policies.

### 2.5 YouTube Music
- **Status**: YouTube IFrame Player API.
- **Considerations**: Per YouTube Developer Terms of Service, audio cannot be stripped or played without showing the video viewport. To remain compliant, a miniature video surface must be rendered alongside playback controls.

---

## 3. Implementation Roadmap for Phase 2

1. **Provider Registry**: A singleton `MusicProviderRegistry` allowing dynamic registration of available audio drivers.
2. **Settings Panel**: User Settings page tab ("Connected Accounts") showing OAuth status badges for Spotify / Audius.
3. **Queue & Playlist Management**: Extending `useJamStore` to support sequential playlist queues (`queue: MusicTrack[]`, `currentIndex`).
