"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  SquarePen,
  Pin,
  PinOff,
  Check,
  CheckCheck,
  Hash,
  Users,
  Compass,
  CalendarDays,
  X,
  SlidersHorizontal,
  Radio,
  Play,
  Pause,
  Headphones,
  Sparkles,
  Mic,
  Camera,
  User,
  LogOut,
} from "lucide-react";
import { LOGO } from "@/src/shared/components/logo";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu";
import { Channel } from "@/src/types/channel";
import { Friends } from "@/src/types/friends";
import { Message } from "@/src/features/Chat/types/messages";
import CreateModal from "@/src/shared/components/Modals/CreateModal";
import { SidebarToggleIcon } from "@/src/shared/components/icons/SidebarIcons";
import { type NavTab } from "./SidebarIconRail";
import {
  useJamStore,
  openJamPanel as triggerOpenJam,
} from "@/src/features/Jam/store/useJamStore";
import { DEFAULT_STATIONS } from "@/src/features/Jam/data/defaultStations";
import { EqualizerBars } from "@/src/features/Jam/ui/EqualizerBars";

export type FilterType = "all" | "unread" | "dm" | "channel" | "favourites";

interface ConversationListProps {
  channels: Channel[];
  friends: Friends[];
  messages?: Message[];
  loading?: boolean;
  friendsLoading?: boolean;
  selectedChannel: Channel | null;
  selectedFriend: Friends | null;
  onSelectChannel: (channel: Channel) => void;
  onSelectFriend: (friend: Friends) => void;
  onCreateChannel: (name: string) => Promise<void> | void;
  incomingRequestCount?: number;
  user?: { id?: string; name?: string; username?: string; email?: string } | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  activeNav?: NavTab;
  onNavigate?: (tab: NavTab) => void;
  getTypingUsers?: (id: string) => string[];
}

export function ConversationList({
  channels = [],
  friends = [],
  messages = [],
  loading = false,
  friendsLoading = false,
  selectedChannel,
  selectedFriend,
  onSelectChannel,
  onSelectFriend,
  onCreateChannel,
  incomingRequestCount = 0,
  user,
  collapsed = false,
  onToggleCollapse,
  activeNav = "chats",
  onNavigate,
  getTypingUsers,
}: ConversationListProps) {
  const { logout } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const currentJamStation = useJamStore((s) => s.currentStation);
  const jamPlaybackState = useJamStore((s) => s.playbackState);
  const playStation = useJamStore((s) => s.playStation);
  const toggleJamPlayPause = useJamStore((s) => s.togglePlayPause);
  const openJamPanel = useJamStore((s) => s.openPanel);

  // Persistent pinned / favourite chat IDs
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("onechat_pinned_chats");
      if (saved) {
        setPinnedIds(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        localStorage.setItem("onechat_pinned_chats", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Helper: get last message for channel
  const getLastChannelMessage = (channelId: string) => {
    return messages
      .filter((m) => m.type === "channel" && m.channelId === channelId)
      .at(-1);
  };

  // Helper: get last message for DM
  const getLastFriendMessage = (friendId: string) => {
    return messages
      .filter(
        (m) =>
          m.type === "dm" &&
          (m.isMine ? m.receiverId === friendId : m.sender?.id === friendId)
      )
      .at(-1);
  };

  // Helper: check unread count
  const getChannelUnreadCount = (channelId: string) => {
    return messages.filter(
      (m) =>
        m.type === "channel" &&
        m.channelId === channelId &&
        !m.isMine &&
        m.status !== "read"
    ).length;
  };

  const getFriendUnreadCount = (friendId: string) => {
    return messages.filter(
      (m) =>
        m.type === "dm" &&
        (m.sender?.id === friendId || m.receiverId === friendId) &&
        !m.isMine &&
        m.status !== "read"
    ).length;
  };

  // WhatsApp-style timestamp formatter (Image 1)
  const formatTimestamp = (timeStr?: string) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  // Helper: get channel recency timestamp (newest created or recent message)
  const getChannelSortTime = (c: Channel) => {
    const lastMsg = getLastChannelMessage(c.id);
    const lastMsgTime = lastMsg?.createdAt
      ? new Date(lastMsg.createdAt).getTime()
      : 0;
    const createdTime = c.createdAt ? new Date(c.createdAt).getTime() : 0;
    return Math.max(lastMsgTime, createdTime);
  };

  // Helper: get friend recency timestamp
  const getFriendSortTime = (f: Friends) => {
    const lastMsg = getLastFriendMessage(f.id);
    return lastMsg?.createdAt ? new Date(lastMsg.createdAt).getTime() : 0;
  };

  // Total unreads across channels & friends
  const totalUnreads = useMemo(() => {
    return (
      channels.reduce((acc, c) => acc + getChannelUnreadCount(c.id), 0) +
      friends.reduce((acc, f) => acc + getFriendUnreadCount(f.id), 0)
    );
  }, [channels, friends, messages]);

  // Filtered lists (newest / most recently active come on top)
  const filteredChannels = useMemo(() => {
    const list = channels.filter((c) => {
      const matchesSearch =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeFilter === "unread") {
        return getChannelUnreadCount(c.id) > 0;
      }
      if (activeFilter === "favourites") {
        return pinnedIds.includes(c.id);
      }
      if (activeFilter === "dm") {
        return false;
      }
      return true;
    });

    // Ensure newly created groups / channels appear at the top
    return list.slice().sort((a, b) => {
      const timeA = getChannelSortTime(a);
      const timeB = getChannelSortTime(b);
      return timeB - timeA;
    });
  }, [channels, searchQuery, activeFilter, pinnedIds, messages]);

  const filteredFriends = useMemo(() => {
    const list = friends.filter((f) => {
      const matchesSearch =
        !searchQuery.trim() ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeFilter === "unread") {
        return getFriendUnreadCount(f.id) > 0;
      }
      if (activeFilter === "favourites") {
        return pinnedIds.includes(f.id);
      }
      if (activeFilter === "channel") {
        return false;
      }
      return true;
    });

    return list.slice().sort((a, b) => {
      const timeA = getFriendSortTime(a);
      const timeB = getFriendSortTime(b);
      return timeB - timeA;
    });
  }, [friends, searchQuery, activeFilter, pinnedIds, messages]);

  // Pinned items in "All" view to show prominently at top
  const pinnedChannels = useMemo(() => {
    return filteredChannels.filter((c) => pinnedIds.includes(c.id));
  }, [filteredChannels, pinnedIds]);

  const unpinnedChannels = useMemo(() => {
    return filteredChannels.filter((c) => !pinnedIds.includes(c.id));
  }, [filteredChannels, pinnedIds]);

  const pinnedFriends = useMemo(() => {
    return filteredFriends.filter((f) => pinnedIds.includes(f.id));
  }, [filteredFriends, pinnedIds]);

  const unpinnedFriends = useMemo(() => {
    return filteredFriends.filter((f) => !pinnedIds.includes(f.id));
  }, [filteredFriends, pinnedIds]);

  // WhatsApp-style filter pill options (Image 1)
  const filterPills: Array<{
    id: FilterType;
    label: string;
    badge?: number;
  }> = [
    { id: "all", label: "All" },
    {
      id: "unread",
      label: "Unread",
      badge: totalUnreads > 0 ? totalUnreads : undefined,
    },
    { id: "dm", label: "Personal / DMs" },
    { id: "channel", label: "Groups" },
    {
      id: "favourites",
      label: "Pinned",
      badge: pinnedIds.length > 0 ? pinnedIds.length : undefined,
    },
  ];

  return (
    <aside
      className={`oc-conversation-sidebar ${collapsed ? "collapsed" : ""}`}
      aria-label="Conversations Sidebar"
    >
      {/* ── Mobile Header (Divriots Mobile Tab Style) ────────────── */}
      <header className="md:hidden sticky top-0 z-50 w-full pt-safe bg-[#0e0e10]/95 backdrop-blur-xl border-b border-[#22242a]/60 shadow-[0_1px_12px_rgba(0,0,0,0.4)]">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <LOGO
              text="OneChat"
              textClassName="font-bold text-[20px] tracking-tight text-[#f0f2f5]"
              iconClassName="w-6 h-6 text-[#6E53CC] fill-[#6E53CC]"
              href="/connect"
            />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Search"
              onClick={() => {
                searchInputRef.current?.focus();
                searchInputRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-9 h-9 rounded-full bg-[#1e2025] border border-[#2c2f36] text-[#f0f2f5] flex items-center justify-center transition-all active:scale-95"
            >
              <Search size={18} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Profile"
                  className="w-9 h-9 rounded-full bg-[#6E53CC] text-white flex items-center justify-center active:opacity-80 transition-opacity font-bold text-sm shadow-sm"
                >
                  {user?.name ? user.name.slice(0, 1).toUpperCase() : <User size={18} />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-[#17171b] text-[#f0f2f5] border-[#25252b] shadow-2xl rounded-xl p-1.5 z-50"
              >
                <DropdownMenuLabel className="text-xs px-2.5 py-2">
                  <div className="font-semibold text-[#f0f2f5] text-sm">
                    {user?.name || "User"}
                  </div>
                  <div className="text-[11px] text-[#8b90a0] font-normal">
                    @{user?.username || (user?.email ? user.email.split("@")[0] : "user")}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#41e575]">
                    <span className="w-2 h-2 rounded-full bg-[#41e575]" />
                    <span>Online</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#25252b]" />
                <DropdownMenuItem
                  className="text-xs text-[#ef4444] focus:bg-[#202026] cursor-pointer rounded-lg px-2.5 py-1.5 flex items-center gap-2"
                  onClick={logout}
                >
                  <LogOut size={14} />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Desktop Top Header (WhatsApp / Discord Style) ──────────── */}
      <div className="hidden md:flex oc-sidebar-header items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-[#f4f4f5] tracking-tight">
            {activeNav === "chats"
              ? "Chats"
              : activeNav === "friends"
              ? "Friends"
              : activeNav === "channels"
              ? "Channels"
              : activeNav === "plans"
              ? "Plans"
              : activeNav === "jam"
              ? "Onechat Jam"
              : "Explore"}
          </h2>
          {totalUnreads > 0 && activeNav === "chats" && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-black">
              {totalUnreads}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Create Channel / New Conversation Modal */}
          <CreateModal
            title="Create a new Channel"
            description="Channels let your team communicate in public or private frequencies."
            placeholder="Channel name (e.g. Design Circle)"
            confirmText="Create Channel"
            onConfirm={onCreateChannel}
          >
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24] transition-colors cursor-pointer"
              title="Create Channel (New Chat)"
              aria-label="Create Channel"
            >
              <SquarePen size={17} />
            </button>
          </CreateModal>

          {/* Sidebar Collapse Toggle */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24] transition-colors cursor-pointer"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <SidebarToggleIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Search & Filter Bar Section (Sticky on mobile) ────────── */}
      <div className="px-3.5 pt-2 pb-2.5 flex flex-col gap-2 bg-[#0e0e10]/95 md:bg-transparent sticky top-14 md:static z-40 border-b border-[#22242a]/60 md:border-b-0">
        {/* Search Pill Box */}
        <div className="relative flex items-center w-full h-9 bg-[#1e2025] border border-[#2c2f36] rounded-lg px-3 transition-colors focus-within:border-[#6E53CC]/70 focus-within:ring-1 focus-within:ring-[#6E53CC]/40">
          <Search size={16} className="text-[#8b90a0] shrink-0" />
          <input
            ref={searchInputRef}
            id="oc-conv-list-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent border-0 outline-none text-[#f0f2f5] placeholder:text-[#8b90a0] text-sm px-2"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[#8b90a0] hover:text-[#f0f2f5] p-1 cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Voice dictation"
              className="flex items-center justify-center text-[#8b90a0] hover:text-[#f0f2f5] transition-colors"
            >
              <Mic size={16} />
            </button>
          )}
        </div>

        {/* Filter Chips Bar (Horizontal scrolling on mobile) */}
        {activeNav === "chats" && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            {filterPills.map((pill) => {
              const isActive = activeFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setActiveFilter(pill.id)}
                  className={`px-3 py-1 rounded-full text-xs transition-all shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-[#6E53CC]/20 text-[#A78BFA] border border-[#6E53CC]/40 font-semibold shadow-xs"
                      : "bg-[#1e2025] text-[#9ba1a6] hover:text-[#f0f2f5] border border-transparent font-medium"
                  }`}
                >
                  <span>{pill.label}</span>
                  {pill.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        pill.id === "unread"
                          ? "bg-[#06c85d]/20 text-[#41e575]"
                          : "bg-[#6E53CC]/25 text-[#A78BFA]"
                      }`}
                    >
                      {pill.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Add Custom Filter or Create Channel Modal */}
            <CreateModal
              title="Create a new Channel"
              description="Channels let your team communicate in public or private frequencies."
              placeholder="Channel name (e.g. Design Circle)"
              confirmText="Create Channel"
              onConfirm={onCreateChannel}
            >
              <button
                type="button"
                aria-label="Add custom filter or list"
                className="w-7 h-7 rounded-full bg-[#1e2025] border border-[#2c2f36] text-[#9ba1a6] hover:text-[#f0f2f5] flex items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <Plus size={15} />
              </button>
            </CreateModal>
          </div>
        )}
      </div>

      {/* ── Scrollable Conversation List ──────────────────────────── */}
      <div className="oc-conv-list pb-24 md:pb-4" data-lenis-prevent aria-label="Conversation list">
        {/* VIEW 1: CHATS (WhatsApp + Discord style list) */}
        {activeNav === "chats" && (
          <>
            {/* Pinned / Favourites section if any exist in 'all' or 'favourites' */}
            {(activeFilter === "all" || activeFilter === "favourites") &&
              (pinnedFriends.length > 0 || pinnedChannels.length > 0) && (
                <div className="oc-conv-section mb-2">
                  <div className="oc-section-header">
                    <span className="oc-section-title flex items-center gap-1.5 text-[#F4F4F5]">
                      <Pin size={12} className="rotate-45" />
                      <span>PINNED</span>
                    </span>
                    <span className="text-[11px] text-[#71717a] font-medium">
                      {pinnedFriends.length + pinnedChannels.length}
                    </span>
                  </div>

                  {pinnedFriends.map((f) => (
                    <FriendChatRow
                      key={`pinned-f-${f.id}`}
                      friend={f}
                      isSelected={selectedFriend?.id === f.id}
                      lastMsg={getLastFriendMessage(f.id)}
                      unreadCount={getFriendUnreadCount(f.id)}
                      isPinned={true}
                      isTyping={getTypingUsers ? getTypingUsers(f.id).length > 0 : false}
                      formatTimestamp={formatTimestamp}
                      onSelect={() => onSelectFriend(f)}
                      onTogglePin={(e) => togglePin(f.id, e)}
                    />
                  ))}

                  {pinnedChannels.map((c) => (
                    <ChannelChatRow
                      key={`pinned-c-${c.id}`}
                      channel={c}
                      isSelected={selectedChannel?.id === c.id}
                      lastMsg={getLastChannelMessage(c.id)}
                      unreadCount={getChannelUnreadCount(c.id)}
                      isPinned={true}
                      isTyping={getTypingUsers ? getTypingUsers(c.id).length > 0 : false}
                      formatTimestamp={formatTimestamp}
                      onSelect={() => onSelectChannel(c)}
                      onTogglePin={(e) => togglePin(c.id, e)}
                    />
                  ))}
                </div>
              )}

            {/* Direct Messages Section */}
            {(activeFilter === "all" || activeFilter === "dm") && (
              <div className="oc-conv-section">
                <div className="oc-section-header">
                  <span className="oc-section-title">DIRECT MESSAGES</span>
                  <Link
                    href="/friend-requests"
                    className="oc-section-action-btn"
                    title="Friend Requests"
                  >
                    <Plus size={14} />
                    {incomingRequestCount > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                    )}
                  </Link>
                </div>

                {friendsLoading ? (
                  <div className="px-3 py-2 text-xs text-[#71717a]">
                    Loading messages…
                  </div>
                ) : (activeFilter === "all" ? unpinnedFriends : filteredFriends).length ===
                  0 ? (
                  pinnedFriends.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-[#71717a]">
                      No direct conversations.
                    </div>
                  ) : null
                ) : (
                  (activeFilter === "all" ? unpinnedFriends : filteredFriends).map(
                    (f) => (
                      <FriendChatRow
                        key={f.id}
                        friend={f}
                        isSelected={selectedFriend?.id === f.id}
                        lastMsg={getLastFriendMessage(f.id)}
                        unreadCount={getFriendUnreadCount(f.id)}
                        isPinned={pinnedIds.includes(f.id)}
                        isTyping={getTypingUsers ? getTypingUsers(f.id).length > 0 : false}
                        formatTimestamp={formatTimestamp}
                        onSelect={() => onSelectFriend(f)}
                        onTogglePin={(e) => togglePin(f.id, e)}
                      />
                    )
                  )
                )}
              </div>
            )}

            {/* Channels Section */}
            {(activeFilter === "all" || activeFilter === "channel") && (
              <div className="oc-conv-section mt-3">
                <div className="oc-section-header">
                  <span className="oc-section-title">CHANNELS</span>
                  <CreateModal
                    title="Create a new Channel"
                    description="Channels let your team communicate in public or private frequencies."
                    placeholder="Channel name (e.g. Design Circle)"
                    confirmText="Create Channel"
                    onConfirm={onCreateChannel}
                  >
                    <button
                      type="button"
                      className="oc-section-action-btn"
                      title="Create Channel"
                    >
                      <Plus size={14} />
                    </button>
                  </CreateModal>
                </div>

                {loading ? (
                  <div className="px-3 py-2 text-xs text-[#71717a]">
                    Loading channels…
                  </div>
                ) : (activeFilter === "all" ? unpinnedChannels : filteredChannels).length ===
                  0 ? (
                  pinnedChannels.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-[#71717a]">
                      No channels yet.
                    </div>
                  ) : null
                ) : (
                  (activeFilter === "all" ? unpinnedChannels : filteredChannels).map(
                    (c) => (
                      <ChannelChatRow
                        key={c.id}
                        channel={c}
                        isSelected={selectedChannel?.id === c.id}
                        lastMsg={getLastChannelMessage(c.id)}
                        unreadCount={getChannelUnreadCount(c.id)}
                        isPinned={pinnedIds.includes(c.id)}
                        isTyping={getTypingUsers ? getTypingUsers(c.id).length > 0 : false}
                        formatTimestamp={formatTimestamp}
                        onSelect={() => onSelectChannel(c)}
                        onTogglePin={(e) => togglePin(c.id, e)}
                      />
                    )
                  )
                )}
              </div>
            )}

            {/* Empty state for search or filter */}
            {filteredChannels.length === 0 &&
              filteredFriends.length === 0 &&
              !loading &&
              !friendsLoading && (
                <div className="p-6 text-center text-[#71717a] my-auto">
                  <SlidersHorizontal size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">
                    {searchQuery
                      ? `No conversations match "${searchQuery}"`
                      : activeFilter === "unread"
                      ? "No unread messages. You're all caught up! 🎉"
                      : activeFilter === "favourites"
                      ? "No pinned chats yet. Hover a chat and click the pin icon."
                      : "No conversations found."}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-xs text-[#F4F4F5] hover:underline cursor-pointer"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
          </>
        )}

        {/* VIEW 2: FRIENDS (When Friends tab is selected in Rail) */}
        {activeNav === "friends" && (
          <div className="oc-conv-section">
            <div className="oc-section-header">
              <span className="oc-section-title">ALL FRIENDS</span>
              <Link
                href="/friend-requests"
                className="oc-section-action-btn flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[#17171c]"
                title="Manage Friend Requests"
              >
                <Plus size={13} />
                <span>Requests ({incomingRequestCount})</span>
              </Link>
            </div>

            {filteredFriends.length === 0 ? (
              <div className="px-3 py-4 text-xs text-[#71717a] text-center">
                No friends found.
              </div>
            ) : (
              filteredFriends.map((f) => (
                <FriendChatRow
                  key={f.id}
                  friend={f}
                  isSelected={selectedFriend?.id === f.id}
                  lastMsg={getLastFriendMessage(f.id)}
                  unreadCount={getFriendUnreadCount(f.id)}
                  isPinned={pinnedIds.includes(f.id)}
                  isTyping={getTypingUsers ? getTypingUsers(f.id).length > 0 : false}
                  formatTimestamp={formatTimestamp}
                  onSelect={() => onSelectFriend(f)}
                  onTogglePin={(e) => togglePin(f.id, e)}
                />
              ))
            )}
          </div>
        )}

        {/* VIEW 3: CHANNELS (When Channels tab is selected in Rail) */}
        {activeNav === "channels" && (
          <div className="oc-conv-section">
            <div className="oc-section-header">
              <span className="oc-section-title">ALL CHANNELS</span>
              <CreateModal
                title="Create a new Channel"
                description="Channels let your team communicate in public or private frequencies."
                placeholder="Channel name (e.g. Design Circle)"
                confirmText="Create Channel"
                onConfirm={onCreateChannel}
              >
                <button
                  type="button"
                  className="oc-section-action-btn flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[#17171c]"
                  title="Create Channel"
                >
                  <Plus size={13} />
                  <span>New</span>
                </button>
              </CreateModal>
            </div>

            {filteredChannels.length === 0 ? (
              <div className="px-3 py-4 text-xs text-[#71717a] text-center">
                No channels found.
              </div>
            ) : (
              filteredChannels.map((c) => (
                <ChannelChatRow
                  key={c.id}
                  channel={c}
                  isSelected={selectedChannel?.id === c.id}
                  lastMsg={getLastChannelMessage(c.id)}
                  unreadCount={getChannelUnreadCount(c.id)}
                  isPinned={pinnedIds.includes(c.id)}
                  isTyping={getTypingUsers ? getTypingUsers(c.id).length > 0 : false}
                  formatTimestamp={formatTimestamp}
                  onSelect={() => onSelectChannel(c)}
                  onTogglePin={(e) => togglePin(c.id, e)}
                />
              ))
            )}
          </div>
        )}

        {/* VIEW 4: PLANS */}
        {activeNav === "plans" && (
          <div className="oc-conv-section p-4">
            <div className="p-4 rounded-xl bg-[#141417] border border-[#222228]">
              <div className="flex items-center gap-2 text-[#F4F4F5] font-bold text-xs uppercase tracking-wider mb-2">
                <CalendarDays size={16} />
                <span>Onechat Plans</span>
              </div>
              <h3 className="text-sm font-semibold text-[#f4f4f5]">
                Plan Calendar
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                Coordinate meetups, outings, and team events directly in your
                conversations.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 5: EXPLORE */}
        {activeNav === "explore" && (
          <div className="oc-conv-section p-4">
            <div className="p-4 rounded-xl bg-[#141417] border border-[#222228] text-center">
              <Compass size={28} className="mx-auto text-[#F4F4F5] mb-2" />
              <h3 className="text-sm font-semibold text-[#f4f4f5]">
                Explore Onechat
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                Discover creative circles, public frequencies, and new friends.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 6: ONECHAT JAM */}
        {activeNav === "jam" && (
          <div className="oc-conv-section p-3 space-y-3">
            {/* Now Playing Banner or Welcome Card */}
            <div className="p-3.5 rounded-xl bg-[#141417] border border-[#222228] shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#242036] text-[#A78BFA] flex items-center justify-center border border-[#6E53CC]/30">
                    <Radio size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider">
                      Onechat Jam
                    </h3>
                    <p className="text-[10px] text-[#71717A]">
                      Background Radio & Music
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={triggerOpenJam}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#6E53CC] hover:bg-[#7E64E0] text-white transition-colors cursor-pointer"
                >
                  Full Player
                </button>
              </div>

              {currentJamStation ? (
                <div className="mt-3 p-2.5 rounded-lg bg-[#18181C] border border-[#25252B] flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="relative w-8 h-8 rounded-md overflow-hidden bg-[#242036] text-[#A78BFA] flex items-center justify-center shrink-0">
                      {currentJamStation.favicon ? (
                        <img
                          src={currentJamStation.favicon}
                          alt={currentJamStation.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="font-bold text-xs">
                          {currentJamStation.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      {jamPlaybackState === "playing" && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <EqualizerBars isPlaying={true} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#F4F4F5] truncate">
                        {currentJamStation.name}
                      </p>
                      <p className="text-[10px] text-[#A78BFA] flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {jamPlaybackState === "playing" ? "Playing live" : "Paused"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof toggleJamPlayPause === 'function') {
                        toggleJamPlayPause();
                      } else {
                        useJamStore.getState().togglePlayPause?.();
                      }
                    }}
                    className="p-1.5 rounded-md bg-[#242036] text-[#A78BFA] hover:bg-[#2d2845] transition-colors shrink-0 cursor-pointer"
                    title={jamPlaybackState === "playing" ? "Pause" : "Play"}
                  >
                    {jamPlaybackState === "playing" ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} className="ml-0.5" />
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">
                  Listen to live internet radio, electronic beats, and chillout streams while chatting with friends.
                </p>
              )}
            </div>

            {/* Quick Station Selection */}
            <div>
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                  Curated Stations
                </span>
                <button
                  type="button"
                  onClick={triggerOpenJam}
                  className="text-[11px] text-[#A78BFA] hover:underline cursor-pointer"
                >
                  View all ({DEFAULT_STATIONS.length})
                </button>
              </div>

              <div className="space-y-1">
                {DEFAULT_STATIONS.slice(0, 8).map((station) => {
                  const isCurrent = currentJamStation?.id === station.id;
                  const isPlaying = isCurrent && jamPlaybackState === "playing";
                  return (
                    <div
                      key={station.id}
                      onClick={() => {
                        if (isCurrent) {
                          if (typeof toggleJamPlayPause === 'function') {
                            toggleJamPlayPause();
                          } else {
                            useJamStore.getState().togglePlayPause?.();
                          }
                        } else {
                          if (typeof playStation === 'function') {
                            playStation(station);
                          } else {
                            useJamStore.getState().playStation?.(station);
                          }
                        }
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#242036]/80 border-[#6E53CC]/40 text-[#A78BFA]"
                          : "bg-[#141417] border-[#222228] hover:bg-[#18181C] hover:border-[#6E53CC]/30 text-[#F4F4F5]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-md overflow-hidden bg-[#1C1C22] flex items-center justify-center shrink-0 text-[10px] font-bold text-[#A1A1AA]">
                          {station.favicon ? (
                            <img
                              src={station.favicon}
                              alt={station.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            station.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate leading-tight">
                            {station.name}
                          </p>
                          <p className="text-[10px] text-[#71717A] truncate mt-0.5">
                            {(station.tags || []).slice(0, 2).join(" • ") || "Music"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrent) {
                            if (typeof toggleJamPlayPause === 'function') {
                              toggleJamPlayPause();
                            } else {
                              useJamStore.getState().togglePlayPause?.();
                            }
                          } else {
                            if (typeof playStation === 'function') {
                              playStation(station);
                            } else {
                              useJamStore.getState().playStation?.(station);
                            }
                          }
                        }}
                        className={`p-1.5 rounded-md transition-colors shrink-0 cursor-pointer ${
                          isCurrent && isPlaying
                            ? "bg-[#6E53CC] text-white"
                            : "bg-[#1C1C22] text-[#A1A1AA] hover:text-white"
                        }`}
                        title={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponents: Rich Chat Rows (WhatsApp + Discord inspired)
// ─────────────────────────────────────────────────────────────────────────────

interface FriendChatRowProps {
  friend: Friends;
  isSelected: boolean;
  lastMsg?: Message;
  unreadCount: number;
  isPinned: boolean;
  isTyping?: boolean;
  formatTimestamp: (time?: string) => string;
  onSelect: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
}

function FriendChatRow({
  friend,
  isSelected,
  lastMsg,
  unreadCount,
  isPinned,
  isTyping = false,
  formatTimestamp,
  onSelect,
  onTogglePin,
}: FriendChatRowProps) {
  const hasUnread = unreadCount > 0;
  const timeStr = formatTimestamp(lastMsg?.createdAt);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`flex items-center px-4 py-3 hover:bg-[#121316] active:bg-[#1e2025] cursor-pointer transition-colors border-b border-[#22242a]/40 group ${
        isSelected ? "bg-[#17171b]" : ""
      }`}
    >
      {/* 12x12 Avatar with status indicator */}
      <div className="relative w-12 h-12 shrink-0 mr-3">
        <div className="w-12 h-12 rounded-full bg-[#1e2025] border border-[#26282f] flex items-center justify-center text-[#A78BFA] font-semibold text-[17px]">
          {friend.name.slice(0, 2).toUpperCase()}
        </div>
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#41e575] ring-2 ring-[#0e0e10]" />
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={`truncate text-[15px] md:text-[16px] leading-tight ${
              isSelected || hasUnread ? "font-semibold text-[#f0f2f5]" : "font-medium text-[#d4d4d8]"
            }`}
          >
            {friend.name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span
              className={`text-[11px] font-medium ${
                isTyping
                  ? "text-[#41e575]"
                  : hasUnread
                  ? "text-[#A78BFA]"
                  : "text-[#8b90a0]"
              }`}
            >
              {isTyping ? "typing..." : timeStr}
            </span>
            {isPinned && (
              <Pin size={13} className="text-[#8b90a0] fill-current rotate-45" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
            {isTyping ? (
              <span className="text-xs text-[#41e575] italic font-medium truncate">
                typing...
              </span>
            ) : (
              <>
                {lastMsg?.isMine && (
                  <span className="shrink-0">
                    {lastMsg.status === "read" ? (
                      <CheckCheck size={14} className="text-[#A78BFA]" />
                    ) : lastMsg.status === "delivered" ? (
                      <CheckCheck size={14} className="text-[#8b90a0]" />
                    ) : (
                      <Check size={14} className="text-[#8b90a0]" />
                    )}
                  </span>
                )}
                {lastMsg?.fileUrl ? (
                  <div className="flex items-center gap-1 text-[#8b90a0] min-w-0 truncate">
                    <Camera size={14} className="shrink-0 text-[#8b90a0]" />
                    <span className="text-xs truncate">
                      {lastMsg.fileName || "Photo"}
                    </span>
                  </div>
                ) : (
                  <span
                    className={`text-xs truncate ${
                      hasUnread
                        ? "text-[#f0f2f5] font-medium"
                        : "text-[#8b90a0] font-normal"
                    }`}
                  >
                    {lastMsg?.content || "Start a conversation"}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {/* Pin Toggle Button on hover */}
            <button
              type="button"
              onClick={onTogglePin}
              className={`p-1 rounded hover:bg-[#1A1A20] text-[#71717a] hover:text-white transition-opacity cursor-pointer ${
                isPinned ? "opacity-100 text-white" : "opacity-0 group-hover:opacity-100"
              }`}
              title={isPinned ? "Unpin chat" : "Pin chat"}
            >
              <Pin size={12} className={isPinned ? "rotate-45 fill-current" : ""} />
            </button>

            {/* Unread Badge Count Pill */}
            {hasUnread && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-[#6E53CC] text-white flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChannelChatRowProps {
  channel: Channel;
  isSelected: boolean;
  lastMsg?: Message;
  unreadCount: number;
  isPinned: boolean;
  isTyping?: boolean;
  formatTimestamp: (time?: string) => string;
  onSelect: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
}

function ChannelChatRow({
  channel,
  isSelected,
  lastMsg,
  unreadCount,
  isPinned,
  isTyping = false,
  formatTimestamp,
  onSelect,
  onTogglePin,
}: ChannelChatRowProps) {
  const hasUnread = unreadCount > 0;
  const timeStr = formatTimestamp(lastMsg?.createdAt);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`flex items-center px-4 py-3 hover:bg-[#121316] active:bg-[#1e2025] cursor-pointer transition-colors border-b border-[#22242a]/40 group ${
        isSelected ? "bg-[#17171b]" : ""
      }`}
    >
      {/* 12x12 Channel Avatar */}
      <div className="relative w-12 h-12 shrink-0 mr-3">
        <div className="w-12 h-12 rounded-full bg-[#6E53CC]/15 text-[#A78BFA] border border-[#6E53CC]/25 flex items-center justify-center font-bold text-base">
          <Users size={20} />
        </div>
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={`truncate text-[15px] md:text-[16px] leading-tight ${
              isSelected || hasUnread ? "font-semibold text-[#f0f2f5]" : "font-medium text-[#d4d4d8]"
            }`}
          >
            {channel.name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span
              className={`text-[11px] font-medium ${
                isTyping
                  ? "text-[#41e575]"
                  : hasUnread
                  ? "text-[#A78BFA]"
                  : "text-[#8b90a0]"
              }`}
            >
              {timeStr}
            </span>
            {isPinned && (
              <Pin size={13} className="text-[#8b90a0] fill-current rotate-45" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
            {isTyping ? (
              <span className="text-xs text-[#41e575] italic font-medium truncate">
                someone is typing...
              </span>
            ) : (
              <p className="text-xs text-[#8b90a0] truncate">
                {lastMsg?.sender?.name && (
                  <span className="text-[#f0f2f5] font-medium mr-1">
                    {lastMsg.sender.name}:
                  </span>
                )}
                {lastMsg?.content || "No messages yet"}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {/* Pin Toggle Button on hover */}
            <button
              type="button"
              onClick={onTogglePin}
              className={`p-1 rounded hover:bg-[#1A1A20] text-[#71717a] hover:text-white transition-opacity cursor-pointer ${
                isPinned ? "opacity-100 text-white" : "opacity-0 group-hover:opacity-100"
              }`}
              title={isPinned ? "Unpin channel" : "Pin channel"}
            >
              <Pin size={12} className={isPinned ? "rotate-45 fill-current" : ""} />
            </button>

            {/* Unread Badge Count Pill */}
            {hasUnread && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-[#6E53CC] text-white flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
