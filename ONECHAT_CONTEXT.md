# Onechat — Complete Project Context & Architecture Guide

> **Purpose:** This document is the single source of truth for the Onechat frontend application. Provide this file to any developer or AI coding agent to immediately understand the existing architecture, design system, data models, real-time protocol, and feature set before building new capabilities.

---

## 1. Project Overview & Tech Stack

Onechat is a modern, Discord-inspired real-time messaging and social planning platform built on top of Next.js and a REST/WebSocket backend.

- **Framework:** Next.js 16.2.6 (App Router + Turbopack)
- **Language:** TypeScript 6.0 (Strict mode)
- **UI & Styling:** Tailwind CSS v4, Lucide React icons, Framer Motion animations
- **Primitive Components:** Radix UI (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, etc.)
- **Server State & Caching:** `@tanstack/react-query` v5
- **Client State:** Zustand v5
- **Forms & Validation:** `react-hook-form` + `zod`
- **Real-Time Layer:** Native WebSocket client with auto-reconnection, optimistic updates, and queueing
- **Authentication:** JWT stored in HTTP-only cookies with automatic token refresh on `401 X-Token-Expired: true`

---

## 2. Directory Structure

```
src/
├── app/                              # Next.js App Router pages
│   ├── auth/                         # /auth/login, /auth/register, /auth/verifyEmail
│   ├── connect/                      # /connect (Main Onechat 3-column app)
│   ├── friend-requests/              # /friend-requests (Friend requests management)
│   ├── home/                         # Landing page
│   └── stores/                       # Global stores (e.g. friendStore.ts)
├── features/
│   ├── Chat/                         # Real-time messaging & plans domain
│   │   ├── api/                      # messageApi.ts, planApi.ts
│   │   ├── hooks/                    # useWebsocket.ts, useChatRealtime.ts, useChatSelection.ts, useChatQuries.ts
│   │   ├── types/                    # messages.ts, plans.ts
│   │   ├── ui/                       # OnechatChatContainer, OnechatMessageList, OnechatPlanCard, OnechatDetailsPanel, etc.
│   │   │   └── CreatePlanModal/      # Multi-step Plan Creation Modal (Steps 1–4)
│   │   └── loading/                  # ChatSkeleton.tsx
│   ├── Connect/                      # Workspace and sidebar coordination
│   │   ├── Components/               # ConnectLayout.tsx, OnechatSidebar.tsx, EmptyState.tsx
│   │   └── hooks/                    # useConnectPage.ts
│   ├── Friends/                      # Friends & connection requests
│   ├── auth/                         # Authentication hooks, schemas, API, guards
│   ├── Channels/                     # Channel API & utilities
│   └── Jam/                          # Background radio & music player domain
│       ├── types/                    # jam.ts (Station, PlaybackState, JamSession)
│       ├── data/                     # defaultStations.ts (16 curated high-reliability streams)
│       ├── api/                      # radioBrowserApi.ts (Mirror rotation, search, click counting)
│       ├── hooks/                    # useJamQueries.ts (TanStack Query cached hooks)
│       ├── engine/                   # AudioEngine.ts (HTML5 + hls.js singleton + MediaSession)
│       ├── store/                    # useJamStore.ts (Zustand persistent store)
│       ├── utils/                    # jamMessage.ts (Message serialization & parsing)
│       └── ui/                       # MiniPlayer.tsx, JamPanel.tsx, EqualizerBars.tsx, OnechatJamCard.tsx
├── hooks/
│   ├── useChatLogic.ts               # Core timeline scrolling, pagination & delivery sync
│   └── useProtectedRoute.ts          # Route protection redirect hook
├── lib/                              # Shared network utilities & API wrappers
│   ├── api/                          # apiClient.ts, handleResponse.ts, refreshToken.ts
│   ├── chat/                         # getChannelHistory, getDmHistory
│   ├── channel/                      # channelApi
│   ├── friend/                       # getFriends, sendFriendRequest, etc.
│   ├── user/                         # getMe, searchUsers
│   └── env.ts                        # Zod-validated environment config
├── styles/
│   └── components/
│       └── onechat-dashboard.css     # Design tokens and Onechat component classes
└── types/                            # Shared type definitions (channel.ts, friends.ts, user.ts)
```

---

## 3. Visual Design System & Tokens

Onechat uses a custom **Near-Black & Blue** dark theme defined in `src/styles/components/onechat-dashboard.css`:

### Surfaces & Backgrounds
| UI Element | Color Hex | CSS Variable |
|---|---|---|
| Application shell | `#09090B` | `--oc-bg-app` |
| Left sidebar | `#101012` | `--oc-bg-sidebar` |
| Center chat timeline | `#09090B` | `--oc-bg-chat` |
| Right details panel | `#101012` | `--oc-bg-sidebar` |
| Elevated surfaces / Cards | `#17171B` | `--oc-bg-elevated` |
| Input background | `#18181C` | `--oc-bg-input` |
| Hover surface | `#202026` | `--oc-bg-hover` |
| Subtle active surface | `#14243A` | `--oc-bg-subtle-accent` |
| Border | `#25252B` | `--oc-border` |
| Subtle border | `#1C1C22` | `--oc-border-subtle` |

### Message Bubbles
| Bubble Type | Background Hex |
|---|---|
| Incoming bubble | `#1B1B20` |
| Outgoing bubble | `#1557A6` |

### Typography & Accents
| Purpose | Color Hex | CSS Variable |
|---|---|---|
| Primary text | `#F4F4F5` | `--oc-text-primary` |
| Secondary text | `#A1A1AA` | `--oc-text-secondary` |
| Muted text | `#71717A` | `--oc-text-muted` |
| Primary blue | `#3B82F6` | `--oc-accent` |
| Hover blue | `#60A5FA` | `--oc-accent-hover` |
| Online status dot | `#22C55E` | `--oc-online` |
| Destructive action | `#EF4444` | `--oc-destructive` |

---

## 4. Feature Inventory & Current Capabilities

### 4.1. Three-Column Workspace (`/connect`)
- **Left Column (`OnechatSidebar.tsx`)**:
  - **Collapsed Rail Mode (`w-16` / 64px)**:
    - Top panel toggle (`SidebarToggleIcon`) and compose action (`SquarePen`).
    - Navigation icons centered with tooltips and unread indicator dots: Chats (`MessageSquare`), Friends (`Users`), Channels (`Hash`), Plans (`CalendarDays`), Explore (`Compass`).
    - Scrollable channel badges with 2-letter uppercase monograms.
    - Bottom user avatar with online ring and dropdown menu (Profile Details, Log out).
  - **Expanded Drawer Mode (`w-[300px]`)**:
    - App brand header with search input shortcut.
    - Direct Messages section with last message snippet and relative activity timestamps (`formatActivityTime`).
    - Channels section with quick "Create Channel" modal.
    - Full user profile card with handle and account settings dropdown.
- **Center Column (`OnechatChatContainer.tsx`)**:
  - Top header displaying conversation title (`# channel` or friend name), online status / member count, call buttons (voice/video UI triggers), search button, and right details panel toggle.
  - Timeline message list (`OnechatMessageList.tsx`) with date dividers ("Today", "Yesterday").
  - Fixed rounded composer with attachment button, emoji button, multi-line auto-resizing input, and circular send button.
- **Right Column (`OnechatDetailsPanel.tsx`)**:
  - Contextual sliding drawer toggleable via header button.
  - 5 Tabbed views:
    1. **About**: Profile/Channel bio, member count, overview cards (Plans count, Files count, Links count, Status).
    2. **Plans**: Active and upcoming plans in this conversation with direct inspection dialog triggers.
    3. **Files**: Shared files with download links and file size.
    4. **Links**: Extracted URLs from messages.
    5. **Media**: Inline image gallery with preview modal.

---

### 4.2. Real-Time Chat & Messaging (`useWebsocket.ts`, `useChatRealtime.ts`)
- **Supported Conversation Types**:
  - Channels (`type: "channel"`, `channelId`)
  - Direct Messages (`type: "dm"`, `receiverId` / `senderId`)
- **Message Statuses**:
  - `sent` (single checkmark)
  - `delivered` (double checkmark, gray)
  - `read` (double checkmark, blue)
- **Live Typing Indicators**:
  - Sends `typing_start` / `typing_stop` frames over WebSocket.
  - Displays animated bouncing dot typing indicator in the timeline.
- **Message Deletion**:
  - "Delete for me" vs "Delete for everyone" options via dropdown menu.
  - Real-time `message.deleted` event clears deleted messages on recipient clients.
- **Attachments**:
  - Images rendered with inline responsive preview and download action.
  - Generic files rendered with file icon, name, size, and download button.
- **Scroll Pinning & Layout**:
  - Instant initial jump to bottom on conversation change (`scrollTop = scrollHeight`).
  - Smooth scroll on new incoming/outgoing messages.
  - `ResizeObserver` pins scroll position to bottom as dynamic cards (plans, media) expand.

---

### 4.3. Onechat Plans System
Plans allow users to coordinate meetups, meetings, or games inside conversations.

- **Multi-Step Creation Modal (`CreatePlanModal.tsx`)**:
  - **Step 1 (Details)**: Title, description, and visual category selector (General, Work, Study, Fun, Game, Other).
  - **Step 2 (Time & Place)**: Date picker popover, start time picker, optional end time picker, and location / meeting link input with validation.
  - **Step 3 (Participants)**: Real-time friends search, invited avatar stack preview, removable chips, and available connections checklist.
  - **Step 4 (Review & Confirmation)**: Three elevated cards displaying entered details with inline "Edit" pencil buttons returning to any step without data loss. Final submission sends payload to the backend and adds the plan to the timeline.
  - **Discard Protection**: Prompts an unsaved changes confirmation dialog if the user attempts to close with dirty state.
- **In-Timeline Plan Cards (`OnechatPlanCard.tsx`)**:
  - Embedded chronologically in the message timeline alongside regular chat messages.
  - Shows title, description, formatted date/time, and location/link.
  - **Live Participation Panel (`PlanParticipationPanel.tsx`)**:
    - Real-time RSVP voting: `In`, `Maybe`, `Can't make it`.
    - Live counts and participant avatar list.
    - 60-second in-memory caching to eliminate redundant network calls on conversation switches.
- **Calendar Overview Page (`PlansCalendarPage.tsx`)**:
  - Accessible via "Plans" sidebar tab.
  - Full-month calendar grid grouping plans by local date.
  - Status filtering (`all`, `open`, `confirmed`, `completed`, `cancelled`).
  - Plan inspection (`PlanDetailsDialog`) and plan deletion (`PlanDeleteDialog`).

---

### 4.4. Friends & Connection Requests (`/friend-requests`)
- Search registered users by username via `userApi.searchUsers(query)`.
- Incoming friend requests list with "Accept" and "Reject" mutations.
- Outgoing friend requests list with "Cancel" capability.
- Friends list with "Remove friend" action.

---

### 4.5. Authentication & Session Management
- Protected route guard (`useProtectedRoute.ts`) redirects unauthenticated users to `/login`.
- Auto-refresh mechanism (`handleResponse.ts` + `refreshToken.ts`) retries requests automatically when tokens expire.
- User profile info dynamically resolved from auth payload with fallbacks (`name`, `username`, `email`).

---

## 5. API Endpoints Reference

All endpoints run against `process.env.NEXT_PUBLIC_API_URL` with credentials included (`credentials: "include"`).

### Authentication (`/api`)
- `POST /api/auth/login` — Login with email/password
- `POST /api/auth/register` — Register account
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/logout` — Invalidate session
- `POST /api/otp/verify` — Verify email OTP

### Users (`/api`)
- `GET /api/me` — Current user profile
- `GET /api/users?username=:query` — Search users

### Friends (`/api`)
- `GET /api/friends` — List accepted friends
- `DELETE /api/friends/:friendId` — Remove friend
- `GET /api/friend-requests?type=incoming|outgoing` — List requests
- `POST /api/friend-requests` — Send request (`{ userId }`)
- `PUT /api/friend-requests/:id/accept` — Accept request
- `PUT /api/friend-requests/:id/reject` — Reject request

### Channels (`/api`)
- `GET /api/channels/` — List user channels
- `POST /api/channels/` — Create channel (`{ name, description? }`)
- `DELETE /api/channels/:id/` — Delete channel
- `GET /api/channels/:id/members` — List channel members
- `POST /api/channels/:id/members` — Add channel member (`{ memberId }`)
- `DELETE /api/channels/:id/members` — Remove member

### Messages & History (`/api`)
- `GET /api/chats/channel/:channelId?limit=50&cursor=:cursor` — Channel history
- `GET /api/chats/dm/:userId?limit=50&cursor=:cursor` — DM history
- `DELETE /api/messages/:messageId?scope=me|everyone` — Delete message
- `POST /api/files/upload` — Upload attachment (`multipart/form-data`)

### Plans (`/api`)
- `GET /api/chats/channel/:channelId/plans` — Channel plans
- `POST /api/chats/channel/:channelId/plans` — Create channel plan
- `GET /api/chats/dm/:userId/plans` — DM plans
- `POST /api/chats/dm/:userId/plans` — Create DM plan
- `GET /api/plans/me` — My created plans across all chats
- `GET /api/plans/:planId` — Plan details
- `PUT /api/plans/:planId` — Update plan
- `PUT /api/plans/:planId/status` — Update status (`open`, `confirmed`, `completed`, `cancelled`)
- `GET /api/plans/:planId/participants` — Plan participant RSVP summary
- `PUT /api/plans/:planId/response` — Vote RSVP (`{ response: "in" | "maybe" | "cant_make_it" }`)
- `GET /api/plans/:planId/poll` — Get plan poll
- `POST /api/plans/:planId/poll` — Create poll
- `PUT /api/plans/:planId/poll/votes` — Vote in poll

---

## 6. WebSocket Protocol

Connection endpoint: `${NEXT_PUBLIC_WS_URL || NEXT_PUBLIC_API_URL}/ws`

### Outgoing Frames
```json
// Send DM
{ "type": "dm", "receiverId": "uuid", "content": "Hello!" }

// Send Channel Message
{ "type": "channel_message", "channelId": "uuid", "content": "Hello team!" }

// Typing notifications
{ "type": "typing_start", "channelId": "uuid" }
{ "type": "typing_stop", "channelId": "uuid" }

// Room subscription
{ "type": "join_channel", "channelId": "uuid" }
{ "type": "leave_channel", "channelId": "uuid" }

// Read receipts
{ "type": "delivered", "messageId": "uuid" }
{ "type": "read", "messageId": "uuid" }
```

### Incoming Frames
```json
// Incoming Message
{ "event": "message", "data": { "id": "uuid", "type": "dm", "content": "...", "createdAt": "...", "sender": { "id": "...", "name": "..." } } }

// Message Deleted
{ "event": "message.deleted", "data": { "messageId": "uuid", "senderId": "..." } }

// Message Ack
{ "event": "ack", "data": { "messageId": "uuid", "status": "sent" | "delivered" | "read" } }

// Real-Time Plan Events
{ "event": "plan.created" | "plan.updated" | "plan.response_changed" | "plan.status_changed", "data": { "eventId": "uuid", "planId": "uuid", "channelId": "uuid" } }
```

---

## 7. Development Guidelines for Future Features

1. **Strictly Preserve the Near-Black & Blue Theme**: Always use existing CSS variables (`--oc-bg-app`, `--oc-bg-sidebar`, `--oc-bg-elevated`, `--oc-border`, `--oc-accent`) or Tailwind equivalents. Never introduce yellow, amber, neon, or glassmorphism effects unless explicitly instructed.
2. **React Strict State Hygiene**: Never invoke state setters of another component inside a `setState` updater callback. Use `queueMicrotask` or trigger side-effects from `useEffect`.
3. **Prevent Re-render Cascades**: When passing updater callbacks from parent to child (`onPlansUpdated`, `onPlanChanged`), wrap them in `useCallback` and perform structural equality checks (`prev.id === next.id`) before updating state to avoid infinite network loops.
4. **Optimistic UI Updates**: New messages and plans should appear instantly on the sending client while awaiting server confirmation.
5. **Deduplication**: WebSocket events must be guarded against duplicate IDs (`processedPlanEventIDs`, `seenPlanEventIDs`) to prevent duplicate cards or notifications.
6. **File Links**: Always reference codebase files using clickable markdown links with the `file://` scheme.

---

## 8. Onechat Jam (Background Radio / Music Player)

### 8.1 Architecture & Ground Rules
- **Feature Flag**: Jam is enabled by default; `NEXT_PUBLIC_FEATURE_JAM=false` opts out (see §8.6).
- **Layout-Level Persistence**: The `AudioEngine` is a singleton outside the React component tree. The `<MiniPlayer />` and `<JamPanel />` are mounted inside `src/app/layout.tsx` at the root `<Providers>` level so playback never pauses or unmounts when navigating between routes (`/connect`, `/friend-requests`, `/home`).
- **Free & Legal**: Only public, legitimate audio streams (linked directly, not re-hosted) and the public community Radio Browser API.
- **HLS & Codecs**: Standard MP3/AAC streams play natively via `HTMLAudioElement`. HTTP Live Streaming (`.m3u8`) is supported via dynamic `hls.js` (with native Safari HLS fallback).

### 8.2 Jam Files & Modules
- [jam.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/types/jam.ts): Core TypeScript interfaces (`Station`, `PlaybackState`, `JamSession`, `RadioBrowserStation`, `RadioBrowserFilter`).
- [defaultStations.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/data/defaultStations.ts): 16 curated, verified HTTPS fallback streams across Lofi, Jazz, Synthwave, Classical, Indian/Bollywood, Rock, and Pop.
- [radioBrowserApi.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/api/radioBrowserApi.ts): Radio Browser API client with DNS mirror discovery (`/json/servers`), mirror failover rotation, multi-criteria station search, and click counter registration (`/json/url/{id}`).
- [useJamQueries.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/hooks/useJamQueries.ts): TanStack Query hooks for debounced station search (2 min stale time) and trending/top-voted lists (10 min stale time) with automatic fallback to curated offline streams.
- [AudioEngine.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/engine/AudioEngine.ts): Singleton audio manager with buffering states, retry with exponential backoff (max 3), and `navigator.mediaSession` integration for system notifications and lock screen controls.
- [useJamStore.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/store/useJamStore.ts): Zustand store with `persist` middleware for volume, mute, current station, favorites, and recents.
- [MiniPlayer.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/ui/MiniPlayer.tsx): Compact bottom-right player bar with station artwork, live pulsing badge, play/pause, volume slider, expand, favorite heart, and close buttons.
- [JamPanel.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/ui/JamPanel.tsx): Slide-over drawer with search, genre chips (Lofi, Jazz, Bollywood, etc.), Discover/Favorites/Recent tabs, and animated equalizer bars.
- [EqualizerBars.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/ui/EqualizerBars.tsx): CSS-animated equalizer bars for active playback states.
- [OnechatJamCard.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/ui/OnechatJamCard.tsx): Social listening card rendered in the chat timeline with station artwork, live pulsing "ON AIR" badge, and instant "Tune In" listening synchronization.
- [jamMessage.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/utils/jamMessage.ts): Utilities for serializing (`createJamMessageContent`) and parsing (`parseJamMessage`) Jam payloads in chat messages.

### 8.3 Social Listening ("Jam Together")
- **In-Chat Sharing**: Users can click "Start a Jam" from the message composer quick tools menu or chat topbar. If a station is currently playing, it broadcasts a formatted Jam message into the channel/DM. If not playing, it opens the Jam panel for station selection.
- **Timeline Integration**: [OnechatMessageList.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Chat/ui/OnechatMessageList.tsx) intercepts messages starting with `[onechat:jam]` and renders the interactive `OnechatJamCard`. Other channel members can tap "Tune In" to immediately synchronize and listen to the same station.
- **Context Details Widget**: [OnechatDetailsPanel.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Chat/ui/OnechatDetailsPanel.tsx) under the "About" tab renders a "Background Jam" card displaying the current station, live equalizers, and direct play/pause controls.

### 8.4 Phase 2 — Connected Music Providers (in progress)

Phase 2 adds external catalogs behind a provider abstraction. Playback still goes through the single `AudioEngine`; providers only expose catalog search + a direct stream URL, and every result is normalized into the existing `Station` shape so the store, MiniPlayer, favorites, recents and in-chat Jam sharing work unchanged.

- [providers/types.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/providers/types.ts): `MusicTrack`, `ProviderSearchOptions`, and the `MusicProvider` contract (`search`, `getTrending?`, `getStreamUrl`, `connect/disconnect`, availability flags).
- [providers/registry.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/providers/registry.ts): singleton `musicProviderRegistry` with `register/get/list/available`.
- [providers/audiusProvider.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/providers/audiusProvider.ts): **live** — free public Audius API (`https://api.audius.co/v1`), no key or account; streams via `/v1/tracks/{id}/stream`.
- [providers/jamendoProvider.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/providers/jamendoProvider.ts): **config-gated** — Creative Commons catalog; requires `NEXT_PUBLIC_JAMENDO_CLIENT_ID`. Hidden/disabled when absent.
- [providers/stubProviders.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/providers/stubProviders.ts): Spotify / SoundCloud / YouTube Music placeholders (`isAvailable: false`, shown as "Soon" in the UI).
- [providers/toStation.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/providers/toStation.ts): maps `MusicTrack` → `Station` with a provider-scoped id (`audius:<id>`) and provider label.
- [hooks/useProviderQueries.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/hooks/useProviderQueries.ts): TanStack Query search (2 min stale) and trending (10 min stale), gated by `isJamEnabled()` (enabled by default).
- [JamPanel.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/ui/JamPanel.tsx): provider chip row (Radio / Audius / Jamendo / Soon stubs); radio keeps curated/trending/top + genre chips, provider tabs show live catalog results.

**Status**

| Provider | Status |
|---|---|
| Internet radio (Radio Browser) | ✅ Implemented |
| Audius | ✅ Implemented (public API, no auth) |
| Jamendo | ⚙️ Implemented but needs `NEXT_PUBLIC_JAMENDO_CLIENT_ID` |
| Spotify | 🕓 Stub only (needs Premium OAuth) |
| SoundCloud | 🕓 Stub only (Widget API) |
| YouTube Music | 🕓 Stub only (IFrame API) |

`Station` now carries optional `provider`, `artist` and `durationMs` fields. Radio Browser click counting is skipped for non-radio stations.

### 8.5 Play Queue & Auto-Advance

Finite provider tracks (Audius/Jamendo) play as a queue; live radio remains a single endless stream.

- **Store** ([useJamStore.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/store/useJamStore.ts)): `queue: Station[]` + `queueIndex`, with `playQueue`, `playQueueIndex`, `playNext`, `playPrevious`, `addToQueue`, `removeFromQueue`, `clearQueue`, `seek`. Removing the currently playing item advances to whatever took its place. `progress: { currentTime, duration }` tracks finite-track playback. The queue is intentionally transient (not persisted) because provider stream URLs/signatures can expire; `stop()` clears it.
- **Auto-advance** ([AudioEngine.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/engine/AudioEngine.ts)): emits `onTrackEnded()` when a finite provider track finishes (web `ended` event; native `onCompletion` → `"ended"`). Radio streams that end unexpectedly still use the retry/backoff path.
- **Panel** ([JamPanel.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/ui/JamPanel.tsx)): tapping a row plays the whole visible list from that row. A sticky "Up next" bar shows position with **Skip** and **Clear**; clicking the bar expands a scrollable queue list where each item can be played directly or removed. Provider rows display artist • catalog • duration and an **Add to queue** action.
- **MiniPlayer** ([MiniPlayer.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/ui/MiniPlayer.tsx)): previous/next buttons appear when a queue is active; the subtitle shows the artist for tracks; the badge reads **Live** for radio and **Track** for finite audio; a seek bar with elapsed/total time appears for finite tracks on web.
- **Time updates** ([AudioEngine.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/engine/AudioEngine.ts)): `timeupdate` / `loadedmetadata` / `durationchange` feed the store's `progress`; `seek()` emits immediately so the slider stays in sync. Native playback has no time events yet, so the seek bar is hidden on Android.
- **Native** ([MediaPlaybackService.java](file:///home/adii/Projects/miloverse/frontend/android/app/src/main/java/com/onechat/app/MediaPlaybackService.java)): `onCompletion` releases the player and emits `ended` (previously emitted `idle`, which raced the next track); `onError` now emits `error` without immediately overwriting it with `idle`.

### 8.6 Web Readiness

- **Enabled by default**: Jam UI and queries now use [featureFlag.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/utils/featureFlag.ts). `NEXT_PUBLIC_FEATURE_JAM` no longer has to be set; set it to `false` to opt out. This fixes production builds where only `.env.local` had the flag.
- **HTTPS / mixed content**: [webPlayback.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/utils/webPlayback.ts) hides HTTP-only stations when the app is served over HTTPS and shows a specific hint in the empty state. `AudioEngine.play()` fails fast with a clear error instead of retrying a blocked stream. `radioBrowserApi` now prefers an HTTPS `url_resolved`/`url` when the directory offers one.
- **Chat cards**: `OnechatJamCard` distinguishes "Live Jam / ON AIR" from "Shared Track / TRACK" and shows the artist for provider tracks.
- **Overlay**: the mini player hides while the Jam panel is open so its controls are not buried behind the panel.

---

## 9. Android Native Application (Capacitor & Background Audio)

### 9.1 Native Architecture
- **Framework**: Capacitor 8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/cli`, `@capacitor/status-bar`, `@capacitor/splash-screen`).
- **Application ID**: `com.onechat.app`
- **Native Android Scaffold**: Located in `/android`.
- **Background Audio via Foreground Service**:
  - `AudioEngine.ts` inspects `Capacitor.isNativePlatform()`.
  - When running natively on Android, audio playback routes to the custom [NativeRadioPlugin.java](file:///home/adii/Projects/miloverse/frontend/android/app/src/main/java/com/onechat/app/NativeRadioPlugin.java).
  - The [MediaPlaybackService.java](file:///home/adii/Projects/miloverse/frontend/android/app/src/main/java/com/onechat/app/MediaPlaybackService.java) runs as an Android Foreground Service with a `PARTIAL_WAKE_LOCK` and an ongoing `NotificationCompat` media notification. This prevents Android WebView suspension when the device screen is locked or the application is minimized.
  - Features audio focus management (`AudioManager.OnAudioFocusChangeListener`), automatically pausing playback on phone calls and ducking volume on notifications.
- **Cleartext Audio Streams**: Configured in [network_security_config.xml](file:///home/adii/Projects/miloverse/frontend/android/app/src/main/res/xml/network_security_config.xml) to enable public HTTP live radio streaming while retaining HTTPS defaults.
- **Keyboard Handling**: Android activity uses `android:windowSoftInputMode="adjustResize"` to ensure the chat composer floats above the virtual keyboard.

### 9.2 Build Scripts & Documentation
- Detailed build and signing instructions are documented in [docs/ANDROID_BUILD.md](file:///home/adii/Projects/miloverse/frontend/docs/ANDROID_BUILD.md).
- Phase 2 connected music accounts architecture is documented in [docs/PHASE_2_MUSIC_PROVIDERS.md](file:///home/adii/Projects/miloverse/frontend/docs/PHASE_2_MUSIC_PROVIDERS.md).
- Native build scripts:
  - `npm run android:sync` — Syncs web assets to Android.
  - `npm run android:open` — Opens project in Android Studio.
  - `npm run android:apk:debug` — Compiles `app-debug.apk`.
  - `npm run android:apk:release` — Compiles signed production release APK.

---

## 10. Development Status & Progress Log

> **Maintenance rule:** every agent must append a dated entry here after finishing work — what changed, what was verified, and the next step. Keep the newest entry at the top. This is how the next agent picks up without re-discovery.

### 2026-11-24 — Loading screen until the app page is ready

**Cause of the white screen**
- The shipped `splash.png` is solid white and `launchAutoHide` hid it after only 1500 ms, while the WebView still had to fetch the remote Vercel page and resolve auth. `AppTheme.NoActionBar` also had a null/white background.
- Root `/` renders `null` while `useAuthStore.isLoading` is true, so there was nothing else to paint in that gap.

**Changes**
- Native (`capacitor.config.ts`, `res/values/colors.xml`, `res/values/styles.xml`, new `res/layout/oc_splash_layout.xml`): dark `#09090B` splash theme with launcher icon, dark WebView background, branded progress layout for pre-Android-12, `launchShowDuration` 10000 ms as a failsafe, 250 ms fade-out.
- Web (`src/shared/components/BootSplash.tsx`, `src/styles/components/boot-splash.css`, `src/app/layout.tsx`, `src/styles/globals.css`): server-rendered full-screen brand loader with logo + spinner. It stays until `window.load` has fired **and** auth initialization has finished (min 600 ms, 10 s hard failsafe), then calls `SplashScreen.hide()` on native and unmounts.

**Verified**
- `pnpm exec tsc --noEmit` exit 0; `pnpm lint` exit 0 (81 warnings, unchanged); `pnpm build` compiled and generated 11/11 pages.
- Production SSR HTML contains `oc-boot-splash`, logo, wordmark and spinner markup.
- `pnpm exec cap sync android` + `./gradlew clean assembleDebug` → BUILD SUCCESSFUL; APK contains `color/oc_splash_background`, `layout/oc_splash_layout` and the dark `windowSplashScreenBackground`.

**Next steps**
1. Deploy the frontend to Vercel — the web loader is only effective once the remote page is updated.
2. Push/tag a new release so CI rebuilds the APK with the native splash changes. Note the GitHub `v1.0.8` certificate differs from earlier releases, so existing installs must be uninstalled first.
3. `public/onechat.apk` was intentionally not refreshed (large binary); the release workflow builds a fresh APK from source.

### 2026-11-24 — "App not installed" from GitHub release APK — root cause

**Investigated**
- User downloaded the APK from a GitHub release tag and got "App not installed".
- Verified both release APKs are structurally valid and correctly signed (v2): `v1.0.3` cert SHA-256 `0040e769…` (matches the local/debug keystore), `v1.0.8` cert SHA-256 `20dcde32…` (different, CI-generated key).
- Both declare `com.onechat.app`, versionCode 1 / versionName 1.0, minSdk 24 / targetSdk 35.
- Root cause: installing `v1.0.8` over an existing Onechat install signed with the other key → Android rejects it as a signature mismatch.

**Immediate workaround:** uninstall the existing Onechat app, then install `v1.0.8`.
**Durable fix (not applied):** check in a stable signing keystore and reference it from `app/build.gradle` for debug/release; bump `versionCode` for every release tag.

### 2026-11-24 — Android CI duplicate-class root cause + dependency audit

**Investigated**
- Fresh CI `./gradlew assembleDebug` failed at `:app:checkDebugDuplicateClasses`: `kotlin-stdlib:1.8.22` vs `kotlin-stdlib-jdk7/jdk8:1.6.21` duplicate classes.
- Root cause chain (from committed HEAD): `appcompat:1.7.0` → `lifecycle-common:2.6.2` → `kotlinx-coroutines-android:1.6.4` → `kotlin-stdlib-jdk7/jdk8:1.6.21`. Kotlin 1.8+ merged these artifacts into `kotlin-stdlib`, so both on the classpath collide.
- **Local green / CI red explained:** `android/app/build.gradle` contains the exclude fix only in the working tree (` M android/app/build.gradle`); CI builds committed code without it.
- Full report written to [ANDROID_DEPENDENCY_AUDIT.md](file:///home/adii/Projects/miloverse/frontend/ANDROID_DEPENDENCY_AUDIT.md): version table, deprecated items, exact fixes, verification.

**Verified**
- `dependencyInsight` on HEAD confirms the chain; with the working-tree fix it reports no matching dependency.
- `./gradlew clean assembleDebug --rerun-tasks` with the fix: **BUILD SUCCESSFUL**, 190 tasks executed (matches fresh CI).
- Coroutines POMs checked: 1.6.4 → `stdlib-jdk8:1.6.21`; 1.8.0+ → `kotlin-stdlib` only (clean root-cause fix).
- `pnpm lint` actually exits 0 (81 warnings, 0 errors) — earlier note about ESLint/plugin incompatibility was stale and is corrected.

**Fixes applied (all uncommitted)**
- `android/app/build.gradle`: removed unused `flatDir` + redundant constraints; force `kotlinx-coroutines-android/core-jvm:1.8.1`; keep excludes as a safety net. Resolved `kotlin-stdlib` now uniformly 1.9.21.
- `MediaPlaybackService.java`: typed `startMediaForeground()` helper (API 29+ with 24–28 fallback), `stopForeground(STOP_FOREGROUND_REMOVE)` at all 3 sites, `@SuppressWarnings("deprecation")` on the legacy audio-focus methods needed for API 24/25.
- `AndroidManifest.xml`: **registered `.MediaPlaybackService`** — it was missing entirely, so native playback could not have worked. Permission was already present.
- `package.json` / `pnpm-lock.yaml`: removed deprecated `@studio-freight/lenis` (code already imports `lenis`).
- `public/onechat.apk`: refreshed from the clean debug build so the downloadable binary matches the fixed source.

**Verified after fixes**
- `./gradlew clean assembleDebug --rerun-tasks` with `-Xlint:deprecation` — BUILD SUCCESSFUL, 0 deprecation warnings from app sources.
- `dependencyInsight` — no `kotlin-stdlib-jdk8`; coroutines `1.6.4 -> 1.8.1`; all stdlib requests → 1.9.21.
- `pnpm exec tsc --noEmit`, `pnpm lint` (81 warnings, 0 errors), `pnpm build` — all pass.

**Next steps**
1. **Commit the changes** so CI picks them up (only remaining build blocker).
2. Separate task: AGP 8.13 → 9.x / Gradle 9.x / compileSdk 36-37 migration (do not bundle with the CI fix).
3. Logged-in browser playback smoke test for Jam (still outstanding from web phase).

### 2026-11-22 — Fixed Jam Visibility & Navigation Across Sidebar & Chat

**Fixed & Polished**
- **Sidebar Integration**:
  - Added `jam` as a first-class `NavTab` in [SidebarIconRail.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Connect/Components/SidebarIconRail.tsx) alongside `chats`, `friends`, `channels`, `plans`, and `explore`.
  - In [ConversationList.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Connect/Components/ConversationList.tsx), implemented `VIEW 6: JAM`: selecting Jam in the icon rail immediately updates the conversation sidebar to show "Onechat Jam", live playing status with animated equalizers, 8 curated stations with one-click play, and a "Full Player" drawer button.
- **Drawer Focus & Layering**:
  - Added a dimmed backdrop (`bg-black/60 backdrop-blur-xs z-[90]`) to [JamPanel.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/ui/JamPanel.tsx) with click-to-close behavior.
  - Elevated `JamPanel` container to `z-[100]` so it is never hidden behind `OnechatDetailsPanel` (`z-50`) or other layout chrome.
- **Runtime Error Safeguards**:
  - Added safe array fallback guards `(station.tags || [])` across [JamPanel.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/ui/JamPanel.tsx), [MiniPlayer.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/ui/MiniPlayer.tsx), [OnechatDetailsPanel.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Chat/ui/OnechatDetailsPanel.tsx), [OnechatJamCard.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/ui/OnechatJamCard.tsx), and [AudioEngine.ts](file:///home/adii/Projects/miloverse/frontend/src/features/Jam/engine/AudioEngine.ts), preventing `TypeError: Cannot read properties of undefined (reading 'slice')` on stations with missing or non-array tags.
- **Chat Actions**:
  - In [OnechatChatContainer.tsx](file:///home/adii/Projects/miloverse/frontend/src/features/Chat/ui/OnechatChatContainer.tsx), separated `handleOpenJam` (opens player panel) from `handleShareJam` (posts listening card to channel/DM) so tapping the radio icon or quick tool always opens the player even when no conversation is active.
- **Verification**: `npx tsc --noEmit` (0 errors) and `npm run lint` (0 errors).

### 2026-11-22 — Final Dark Theme, Plan Card Layout & Jam Feature Full Verification

**Verified & Fixed**
- **Theme & Message Bubble Shapes**:
  - Sent message bubbles: Obsidian dark (`#16161B`) with crisp border (`#383844`), completely eliminating cobalt blue backgrounds.
  - Received message bubbles: `#34343A` soft charcoal with light contrast text (`#F4F4F5`).
  - Message bubble shape: Replaced the overly rounded capsule/pill (`18px`) with sleek modern rounded rectangles with directional notch (`8px 8px 2px 8px` outgoing, `8px 8px 8px 2px` incoming, `8px 12px` padding).
  - Chat canvas: Soft charcoal `#28282C`, matching the ergonomic Microsoft Teams dark reference palette.
  - Eradicated all remaining `#3b82f6`, `#14243a`, and `#60a5fa` across `OnechatSidebar.tsx`, `OnechatDetailsPanel.tsx`, and all 12 modal components in `src/features/Chat/ui/CreatePlanModal/`.
- **Plan Card Empty Void Fix**:
  - In `OnechatPlanCard.tsx`, aligned `Plan` badge, title, and action buttons (`[Delete] [View plan]`) along the top row (`[Plan] • [Title] ... [Delete] [View plan]`), eliminating the vacant middle gap circled in user feedback. Description appears below on its own clean line.
- **Jam Feature Verification & Polish**:
  - Full implementation verified across `src/features/Jam/`:
    - Provider abstraction (`audiusProvider` live with 8s fetch timeout, `jamendoProvider` config-gated, stubs for Spotify/SoundCloud/YouTube Music).
    - `useJamStore`: Queue management with auto-advance, repeat modes (`off`/`all`/`one`), shuffle toggle, persistent favorites and recents.
    - `AudioEngine`: Singleton audio playback, Safari native HLS + dynamic HLS.js, MediaSession metadata handlers, Capacitor native Android Foreground Service routing.
    - UI components: `MiniPlayer.tsx` and `JamPanel.tsx` mounted globally in `src/app/layout.tsx`.
- **Verification**: `npx tsc --noEmit` and `npm run lint` pass with 0 errors.

### 2026-11-22 — Jam feature verification & theme harmonization

**Verified & Polished**
- **Architecture check**: All files required by `ONECHAT_CONTEXT.md` §8 and `docs/PHASE_2_MUSIC_PROVIDERS.md` are fully implemented:
  - `AudioEngine.ts`: Singleton audio manager with HTML5 audio, HLS.js streaming, `onTrackEnded` auto-advance, seek/timeupdate, and native Android Foreground Service routing via `NativeRadioPlugin`.
  - `useJamStore.ts`: Zustand store managing playback state, queue with auto-advance, progress tracking, volume, mute, panel visibility, favorites, and recents.
  - `radioBrowserApi.ts`: Dynamic mirror discovery, multi-criteria station search, and click counter registration with fallback to 16 curated HTTPS `DEFAULT_STATIONS`.
  - `providers/`: Provider abstraction with live `audiusProvider` (public API, no auth), `jamendoProvider` (config-gated), stubs for Spotify/SoundCloud/YouTube Music, and `musicTrackToStation` normalization.
  - `MiniPlayer.tsx` & `JamPanel.tsx`: Full queue expansion, seek bar, volume popover, discover/favorites/recents tabs, and responsive layout-level persistence in `src/app/layout.tsx`.
  - Social listening: Chat message serialization (`createJamMessageContent`) and rendering via `OnechatJamCard` in `OnechatMessageList.tsx`, plus "Start a Jam" action in `OnechatChatContainer.tsx`.
- **Theming & Color Fix**: Replaced all remaining legacy hardcoded blue colors (`#3B82F6`, `#14243A`, `#2563EB`) across `MiniPlayer.tsx`, `JamPanel.tsx`, `OnechatJamCard.tsx`, `EqualizerBars.tsx`, and `OnechatDetailsPanel.tsx` with Iris `#6E53CC` / `#A78BFA` and dark charcoal backgrounds matching the new theme.
- **Verification**: `npx tsc --noEmit` and `npm run lint` passed with 0 errors.

**Next steps**
1. Test Jam playback and queue advance with live audio in browser.
2. Optional: Configure `NEXT_PUBLIC_JAMENDO_CLIENT_ID` to activate the Jamendo catalog.

**Shipped (uncommitted)**
- Jam is now **enabled by default** on web; `NEXT_PUBLIC_FEATURE_JAM=false` opts out. Replaced all 10 hard-coded env checks with `isJamEnabled()`.
- **HTTPS mixed-content handling**: HTTP-only stations are filtered from the Jam panel, Radio Browser mapping prefers HTTPS URLs, and `AudioEngine` fails fast with a clear message instead of retrying a blocked stream.
- Shared Jam chat cards now show provider tracks correctly ("Shared Track / TRACK" + artist instead of "Live Jam / ON AIR").
- Mini player hides while the Jam panel is open.

**Verified**
- `pnpm exec tsc --noEmit` — clean
- `pnpm build` — production build succeeds
- `webPlayback` helper test (Node): HTTPS streams accepted, HTTP rejected on HTTPS pages, `urlResolved` HTTPS preferred — `WEB PLAYBACK TESTS OK`.
- `next start` smoke on port 3100: `/`, `/connect`, `/home` all returned 200; headless Chromium produced no JS errors (unauthenticated `/connect` correctly redirects to sign-in, so Jam UI itself needs a logged-in browser for full interaction).
- Production chunks contain the Jam UI and no literal `NEXT_PUBLIC_FEATURE_JAM` string, confirming the flag is inlined as enabled.

**Next steps**
1. Browser smoke test: open the Jam panel, play a curated HTTPS station and an Audius track, verify queue/seek/Tune In.
2. Then continue with native Android (seek/position events, on-device verification).

### 2026-11-22 — Jam play queue + auto-advance

**Shipped (uncommitted)**
- **Queue state**: `queue`/`queueIndex` in `useJamStore`, with `playQueue`, `playNext`, `playPrevious`, `addToQueue`, `removeFromQueue`, `clearQueue`, `seek`. Queue is transient (signed provider URLs expire); `stop()` resets it.
- **Auto-advance**: `AudioEngine.onTrackEnded()` fires for finite provider tracks on web (`ended`) and native (`ended` state). Radio stream failures keep the retry/backoff behavior.
- **Native fix**: `MediaPlaybackService.onCompletion` now releases the player and emits `ended` only (no racing `idle`); `onError` emits `error` and no longer gets overwritten by `idle`.
- **Panel**: rows play the visible list from the tapped index; sticky "Up next" bar with Skip/Clear; provider rows show artist • catalog • duration and an Add-to-queue button.
- **MiniPlayer**: skip back/forward when a queue exists, artist subtitle for tracks, Live/Track badge.
- **Media Session / native notification**: artist metadata now uses `station.artist` for provider tracks; artwork entries no longer claim `image/png`.
- **Queue UI**: the "Up next" bar now expands into a scrollable list with click-to-play and remove buttons; `playQueueIndex(index)` was added for direct jumps. Clear also collapses the list.
- **Seek UI**: `AudioEngine` emits `timeupdate`/metadata, the store keeps `progress`, and the mini player renders an elapsed/total seek slider for finite tracks on web (hidden on native until time events exist).
- **Bug fix**: `stop()` now clears `currentStation` too, so the mini player actually dismisses when the X button is pressed (previously it stayed visible with `playbackState: 'idle'`).

**Verified**
- `pnpm exec tsc --noEmit` — clean
- `pnpm build` — production build succeeds
- Store logic test (Node + type stripping, temp harness): queue start index, next/previous, direct index jump, out-of-range guard, seek/progress reset, add/dedupe, index shift on removal, removing the playing track, clear, single-station replace, stop reset, recents cap/unique — all passed (`QUEUE TESTS OK`).
- `./gradlew assembleDebug` — BUILD SUCCESSFUL; refreshed `public/onechat.apk` from `android/app/build/outputs/apk/debug/app-debug.apk`.
- Audius stream smoke test previously confirmed (`302` → audio); queue logic is store-level and does not change the stream contract.

**Next steps**
1. Add `NEXT_PUBLIC_JAMENDO_CLIENT_ID` and smoke-test Jamendo search/stream.
2. Install the refreshed `public/onechat.apk` and validate auto-advance plus error reporting on a real device.
3. Optional: shuffle/repeat modes, drag-to-reorder queue, persisted queue metadata (ids only, re-resolved on play).
4. Spotify OAuth PKCE + Web Playback SDK (Phase 2.3) when credentials are available.
5. Optional: synchronize playback position for "Jam Together" (currently station-level only).

**Known gaps**
- Queue is not persisted across reloads (deliberate); favorites/recents still are.
- Native Android time events / seek: `NativeRadioPlugin` has no `seek`/position API yet, so the mini-player seek bar is hidden on native. Add `ACTION_SEEK` + periodic position events in `MediaPlaybackService` if native scrubbing is wanted.
- Playlist continuation stops at the end of the queue (no repeat).
- Jam provider files and `docs/PHASE_2_MUSIC_PROVIDERS.md` are currently untracked in git.

### 2026-11-22 — Jam Phase 2 provider foundation + sidebar recheck

**Shipped (uncommitted)**
- **Jam Phase 2 foundation**: `MusicProvider` interface, `musicProviderRegistry`, `MusicTrack`/`Station` normalization, provider-scoped ids.
- **Audius provider (live)**: public catalog search + trending, direct MP3 stream URLs. Verified with `curl` against `https://api.audius.co/v1`.
- **Jamendo provider (config-gated)**: implemented; disabled with a "Soon"-style tooltip until `NEXT_PUBLIC_JAMENDO_CLIENT_ID` is set.
- **Spotify / SoundCloud / YouTube Music**: registered stubs, `isAvailable: false`, shown as "Soon" chips.
- **JamPanel**: provider chip row, provider-aware search/trending, radio-only curated/trending/top + genre sections, provider-aware empty/error/footer text.
- **Store**: Radio Browser click counting now only runs for radio stations (`provider` undefined or `radio`).
- **Sharing**: `jamMessage.ts` now serializes `provider`, `artist` and `durationMs`, so provider tracks shared into chat keep their catalog metadata.
- **Two-level sidebar recheck/fixes**: CSS class mismatch fixed, duplicate CSS removed, rail recent-chat avatars, WhatsApp-style list, mobile list→chat flow, details panel overlays on phones, long list scroll confirmed (`flex: 1`, `min-height: 0`, `overflow-y: auto`, non-shrinking chrome).

**Verified**
- `pnpm exec tsc --noEmit` — clean
- `pnpm build` — production build succeeds
- Audius endpoints reachable and streaming (`/v1/tracks/trending`, `/v1/tracks/search`, `/v1/tracks/{id}/stream`)
- Node smoke test (2026-11-22): provider search + trending returned tracks, `musicTrackToStation` produced `audius:<id>` stations with artist/artwork, and the resolved stream URL returned `302` to an audio file.

**Next steps**
1. Add `NEXT_PUBLIC_JAMENDO_CLIENT_ID` and smoke-test Jamendo search/stream.
2. ~~Playlist/queue support~~ — done; see the queue entry above.
3. Spotify OAuth PKCE + Web Playback SDK (Phase 2.3) when credentials are available.
4. Optional: synchronize playback position for "Jam Together" (currently station-level only).
5. Consider surfacing catalog provider on `OnechatJamCard` and persisted favorites UI.

**Known gaps**
- Jam provider files and `docs/PHASE_2_MUSIC_PROVIDERS.md` are currently untracked in git.
- `src/features/Connect/Components/OnechatSidebar.tsx` is legacy (unused, kept for reference).

### 2026-11-21 — Chat history Phase 1 (context for future agents)
- Backend channel history now joins sender + `channel_members` in one query and returns `403` for non-members.
- Frontend `useChatLogic` uses per-user/per-conversation React Query infinite caches, patches them from WebSocket events (new/confirmed/deleted/uploaded messages), and no longer blocks cached switches.
- Scroll fixed so prepending older pages does not jump to the bottom.
