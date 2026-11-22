"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Users,
  Hash,
  CalendarDays,
  Compass,
  Radio,
  SquarePen,
  Search,
  Plus,
  Settings,
  LogOut,
} from "lucide-react";
import { isJamEnabled } from "@/src/features/Jam/utils/featureFlag";
import { Channel } from "@/src/types/channel";
import { Friends } from "@/src/types/friends";
import { Message } from "@/src/features/Chat/types/messages";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import CreateModal from "@/src/shared/components/Modals/CreateModal";
import { SidebarToggleIcon } from "@/src/shared/components/icons/SidebarIcons";
import { useJamStore } from "@/src/features/Jam/store/useJamStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu";

export type NavTab = "chats" | "friends" | "channels" | "plans" | "explore" | "jam";

interface OnechatSidebarProps {
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
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobileChat?: () => void;
  activeNav?: NavTab;
  onNavigate?: (tab: NavTab) => void;
}

export function OnechatSidebar({
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
  collapsed,
  onToggleCollapse,
  onOpenMobileChat,
  activeNav: activeNavProp,
  onNavigate,
}: OnechatSidebarProps) {
  const { logout } = useAuth();
  const [internalActiveNav, setInternalActiveNav] = useState<NavTab>("chats");
  const activeNav = activeNavProp ?? internalActiveNav;
  const [searchQuery, setSearchQuery] = useState("");

  const isJamFeatureEnabled = isJamEnabled();
  const isJamOpen = useJamStore((s) => s.isPanelOpen);
  const isJamPlaying = useJamStore((s) => s.playbackState === "playing");
  const toggleJamPanel = useJamStore((s) => s.togglePanel);

  const handleNavigate = (tab: NavTab) => {
    setInternalActiveNav(tab);
    onNavigate?.(tab);
  };

  // Search filtering
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;
    return channels.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channels, searchQuery]);

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    return friends.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  // Retrieve last messages
  const getLastChannelMessage = (channelId: string) => {
    return messages
      .filter((m) => m.type === "channel" && m.channelId === channelId)
      .at(-1);
  };

  const getLastFriendMessage = (friendId: string) => {
    return messages
      .filter(
        (m) =>
          m.type === "dm" &&
          (m.isMine ? m.receiverId === friendId : m.sender?.id === friendId)
      )
      .at(-1);
  };

  const formatActivityTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${Math.max(diffMins, 1)}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  // Resolve current user details dynamically without hardcoded fallbacks
  const resolvedName =
    user?.name?.trim() ||
    (user as any)?.username?.trim() ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "User";

  const resolvedHandle =
    (user as any)?.username?.trim() ||
    (user?.email ? user.email.split("@")[0] : "") ||
    resolvedName.toLowerCase().replace(/\s+/g, "");

  const userInitial = resolvedName.charAt(0).toUpperCase() || "U";

  return (
    <motion.aside
      className="oc-sidebar"
      animate={{ width: collapsed ? 64 : 300 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {collapsed ? (
        /* ════════════════════════════════════════════════════════════════
           COLLAPSED RAIL VIEW (Discord / Slack / ChatGPT Style)
           - Perfectly centered 40x40 squircle buttons
           - Refined hover & active selection states
           - Custom sidebar toggle & compose icons
           - Workspace/channel badges & centered user avatar
           ════════════════════════════════════════════════════════════════ */
        <div className="w-full h-full flex flex-col items-center py-3 bg-[#101012] select-none">
          {/* Top Actions: Sidebar Toggle & New Channel/Chat */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24] active:bg-[#6E53CC]/20 transition-all duration-150 cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <SidebarToggleIcon className="w-5 h-5" />
            </button>

            <CreateModal
              title="Create a new Channel"
              description="Channels let your team communicate in public or private frequencies."
              placeholder="Channel name (e.g. Design Circle)"
              confirmText="Create Channel"
              onConfirm={onCreateChannel}
            >
              <button
                type="button"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24] active:bg-[#6E53CC]/20 transition-all duration-150 cursor-pointer"
                title="Create Channel / New Chat"
                aria-label="Create Channel"
              >
                <SquarePen size={18} />
              </button>
            </CreateModal>
          </div>

          {/* Subtle Divider */}
          <div className="w-8 h-px bg-[#25252b] my-2 shrink-0" />

          {/* Main Navigation Stack */}
          <nav className="flex flex-col items-center gap-2 shrink-0" aria-label="Main navigation">
            {/* Chats */}
            <button
              type="button"
              onClick={() => handleNavigate("chats")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative cursor-pointer ${
                activeNav === "chats"
                  ? "bg-[#6E53CC]/20 text-[#A78BFA] border border-[#6E53CC]/40 shadow-sm"
                  : "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24]"
              }`}
              title="Chats"
              aria-label="Chats"
            >
              <MessageSquare size={18} />
              {incomingRequestCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6E53CC] ring-2 ring-[#101012]" />
              )}
            </button>

            {/* Friends */}
            <button
              type="button"
              onClick={() => handleNavigate("friends")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative cursor-pointer ${
                activeNav === "friends"
                  ? "bg-[#6E53CC]/20 text-[#A78BFA] border border-[#6E53CC]/40 shadow-sm"
                  : "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24]"
              }`}
              title="Friends"
              aria-label="Friends"
            >
              <Users size={18} />
            </button>

            {/* Channels */}
            <button
              type="button"
              onClick={() => handleNavigate("channels")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative cursor-pointer ${
                activeNav === "channels"
                  ? "bg-[#6E53CC]/20 text-[#A78BFA] border border-[#6E53CC]/40 shadow-sm"
                  : "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24]"
              }`}
              title="Channels"
              aria-label="Channels"
            >
              <Hash size={18} />
            </button>

            {/* Plans */}
            <button
              type="button"
              onClick={() => handleNavigate("plans")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative cursor-pointer ${
                activeNav === "plans"
                  ? "bg-[#6E53CC]/20 text-[#A78BFA] border border-[#6E53CC]/40 shadow-sm"
                  : "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24]"
              }`}
              title="Plans"
              aria-label="Plans"
            >
              <CalendarDays size={18} />
            </button>

            {/* Explore */}
            <button
              type="button"
              onClick={() => handleNavigate("explore")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative cursor-pointer ${
                activeNav === "explore"
                  ? "bg-[#6E53CC]/20 text-[#A78BFA] border border-[#6E53CC]/40 shadow-sm"
                  : "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24]"
              }`}
              title="Explore"
              aria-label="Explore"
            >
              <Compass size={18} />
            </button>

            {/* Jam Radio */}
            {isJamFeatureEnabled && (
              <button
                type="button"
                onClick={toggleJamPanel}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative cursor-pointer ${
                  isJamOpen
                    ? "bg-[#6E53CC]/20 text-[#A78BFA] border border-[#6E53CC]/40 shadow-sm"
                    : isJamPlaying
                    ? "text-[#A78BFA] bg-[#6E53CC]/15 hover:bg-[#1f1f24]"
                    : "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24]"
                }`}
                title={isJamPlaying ? "Onechat Jam (Live)" : "Onechat Jam"}
                aria-label="Onechat Jam"
              >
                <Radio size={18} />
                {isJamPlaying && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#6E53CC] animate-pulse" />
                )}
              </button>
            )}
          </nav>

          {/* Subtle Divider */}
          <div className="w-8 h-px bg-[#25252b] my-2 shrink-0" />

          {/* Channels Badges (Scrollable) */}
          <div className="flex-1 w-full overflow-y-auto scrollbar-none py-1 flex flex-col items-center gap-2">
            {channels.map((c) => {
              const isSelected = selectedChannel?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onSelectChannel(c);
                    onOpenMobileChat?.();
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs tracking-wider transition-all duration-150 shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-[#6E53CC]/20 text-[#A78BFA] border border-[#6E53CC] shadow-sm"
                      : "bg-[#17171b] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24] border border-[#25252b]/40"
                  }`}
                  title={`# ${c.name}`}
                  aria-label={`Channel ${c.name}`}
                >
                  {c.name.slice(0, 2).toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* User Profile at Bottom (with dropdown menu) */}
          <div className="pt-2 pb-1 flex flex-col items-center shrink-0 border-t border-[#25252b]/60">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative w-10 h-10 rounded-full bg-[#17171b] border border-[#25252b] flex items-center justify-center text-[#f4f4f5] font-semibold text-sm hover:border-[#6E53CC]/60 transition-colors cursor-pointer focus:outline-none"
                  title={`${resolvedName} (@${resolvedHandle})`}
                  aria-label="User profile options"
                >
                  {userInitial}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22c55e] ring-2 ring-[#101012]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="right"
                sideOffset={12}
                className="w-52 bg-[#17171b] text-[#f4f4f5] border-[#25252b]"
              >
                <DropdownMenuLabel className="text-xs">
                  <div className="font-semibold text-[#f4f4f5]">{resolvedName}</div>
                  <div className="text-[11px] text-[#71717a] font-normal">
                    @{resolvedHandle}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#25252b]" />
                <DropdownMenuItem
                  className="text-xs focus:bg-[#202026] cursor-pointer"
                  onClick={() => alert(`Logged in as: ${user?.email || resolvedName}`)}
                >
                  Profile Details
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#25252b]" />
                <DropdownMenuItem
                  className="text-xs text-[#ef4444] focus:bg-[#202026] cursor-pointer flex items-center gap-2"
                  onClick={logout}
                >
                  <LogOut size={14} />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════════
           EXPANDED DRAWER VIEW
           - Header with brand, search focus, and collapse toggle
           - Search bar
           - Navigation items (Chats, Friends, Channels, Plans, Explore)
           - Direct Messages and Channels lists
           - User profile info & settings
           ════════════════════════════════════════════════════════════════ */
        <>
          {/* Top Header */}
          <div className="oc-sidebar-header">
            <div className="flex items-center justify-between w-full">
              <div className="oc-sidebar-brand">
                <span>Onechat</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById(
                      "oc-sidebar-search-input"
                    ) as HTMLInputElement | null;
                    input?.focus();
                  }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24] transition-colors cursor-pointer"
                  title="Search conversations"
                  aria-label="Search"
                >
                  <Search size={17} />
                </button>

                <CreateModal
                  title="Create a new Channel"
                  description="Channels let your team communicate in public or private frequencies."
                  placeholder="Channel name (e.g. Design Circle)"
                  confirmText="Create Channel"
                  onConfirm={onCreateChannel}
                >
                  <button
                    type="button"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24] transition-colors cursor-pointer"
                    title="Create Channel"
                    aria-label="Create Channel"
                  >
                    <SquarePen size={17} />
                  </button>
                </CreateModal>

                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24] transition-colors cursor-pointer"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <SidebarToggleIcon className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="oc-search-wrap">
            <div className="oc-search-box">
              <Search size={14} className="text-[#71717a] shrink-0" />
              <input
                id="oc-sidebar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="oc-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-[#71717a] hover:text-[#f4f4f5] px-1"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Main Navigation List */}
          <nav className="oc-nav-menu" aria-label="Main navigation">
            <button
              type="button"
              onClick={() => handleNavigate("chats")}
              className={`oc-nav-item ${activeNav === "chats" ? "active" : ""}`}
              title="Chats"
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={17} />
                <span>Chats</span>
              </div>
              {incomingRequestCount > 0 && (
                <span className="oc-nav-badge">{incomingRequestCount}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("friends")}
              className={`oc-nav-item ${activeNav === "friends" ? "active" : ""}`}
              title="Friends"
            >
              <div className="flex items-center gap-3">
                <Users size={17} />
                <span>Friends</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("channels")}
              className={`oc-nav-item ${activeNav === "channels" ? "active" : ""}`}
              title="Channels"
            >
              <div className="flex items-center gap-3">
                <Hash size={17} />
                <span>Channels</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("plans")}
              className={`oc-nav-item ${activeNav === "plans" ? "active" : ""}`}
              title="Plans"
            >
              <div className="flex items-center gap-3">
                <CalendarDays size={17} />
                <span>Plans</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("explore")}
              className={`oc-nav-item ${activeNav === "explore" ? "active" : ""}`}
              title="Explore"
            >
              <div className="flex items-center gap-3">
                <Compass size={17} />
                <span>Explore</span>
              </div>
            </button>

            {/* Jam Button */}
            {isJamFeatureEnabled && (
              <button
                type="button"
                onClick={toggleJamPanel}
                className={`oc-nav-item ${isJamOpen ? "active" : ""}`}
                title="Jam (Background Music)"
              >
                <div className="flex items-center gap-3">
                  <Radio size={17} />
                  <span>Jam</span>
                </div>
                {isJamPlaying && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#6E53CC]/20 text-[#A78BFA] border border-[#6E53CC]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6E53CC] animate-pulse" />
                    Live
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Expanded Lists */}
          <div className="flex-1 overflow-y-auto oc-scroll min-h-0">
            {/* Direct Messages Section */}
            {(activeNav === "chats" || activeNav === "friends") && (
              <div>
                <div className="oc-section-header">
                  <span className="oc-section-title">Direct Messages</span>
                  <Link
                    href="/friend-requests"
                    className="oc-section-action-btn"
                    title="Friend Requests"
                  >
                    <Plus size={14} />
                  </Link>
                </div>

                {friendsLoading ? (
                  <div className="px-4 py-2 text-xs text-[#71717a]">Loading messages…</div>
                ) : filteredFriends.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-[#71717a]">
                    No direct conversations.
                  </div>
                ) : (
                  filteredFriends.map((f) => {
                    const isSelected = selectedFriend?.id === f.id;
                    const lastMsg = getLastFriendMessage(f.id);
                    const timeStr = formatActivityTime(lastMsg?.createdAt);

                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          onSelectFriend(f);
                          onOpenMobileChat?.();
                        }}
                        className={`oc-conv-row ${isSelected ? "active" : ""}`}
                      >
                        <div className="oc-avatar-wrap">
                          <div className="oc-avatar">
                            {f.name.slice(0, 1).toUpperCase()}
                          </div>
                          <span className="oc-online-badge" />
                        </div>
                        <div className="oc-conv-info">
                          <div className="oc-conv-top">
                            <span className="oc-conv-name">{f.name}</span>
                            {timeStr && <span className="oc-conv-time">{timeStr}</span>}
                          </div>
                          <div className="oc-conv-bottom">
                            <span className="oc-conv-preview">
                              {lastMsg?.content || "Start a conversation"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* Channels Section */}
            {(activeNav === "chats" || activeNav === "channels") && (
              <div className="mt-2">
                <div className="oc-section-header">
                  <span className="oc-section-title">Channels</span>
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
                  <div className="px-4 py-2 text-xs text-[#71717a]">Loading channels…</div>
                ) : filteredChannels.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-[#71717a]">No channels yet.</div>
                ) : (
                  filteredChannels.map((c) => {
                    const isSelected = selectedChannel?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onSelectChannel(c);
                          onOpenMobileChat?.();
                        }}
                        className={`oc-conv-row ${isSelected ? "active" : ""}`}
                      >
                        <div className="oc-avatar-wrap">
                          <div className="oc-avatar oc-avatar-channel">
                            <Hash size={16} />
                          </div>
                        </div>
                        <div className="oc-conv-info">
                          <div className="oc-conv-top">
                            <span className="oc-conv-name">{c.name}</span>
                          </div>
                          <div className="oc-conv-bottom">
                            <span className="oc-conv-preview">Channel discussion</span>
                            {isSelected  }
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* Plans Tab Overview */}
            {activeNav === "plans" && (
              <div className="p-4">
                <div className="p-4 rounded-xl bg-[#17171b] border border-[#25252b]">
                  <div className="flex items-center gap-2 text-[#A78BFA] font-bold text-xs uppercase tracking-wider mb-2">
                    <CalendarDays size={15} />
                    <span>Onechat Plans</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#f4f4f5]">Your plan calendar</h3>
                  <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                    Browse the plans you created by date. Select Plans to open your calendar.
                  </p>
                </div>
              </div>
            )}

            {/* Explore Tab Overview */}
            {activeNav === "explore" && (
              <div className="p-4">
                <div className="p-4 rounded-xl bg-[#17171b] border border-[#25252b] text-center">
                  <Compass size={28} className="mx-auto text-[#A78BFA] mb-2" />
                  <h3 className="text-sm font-semibold text-[#f4f4f5]">Explore Onechat</h3>
                  <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                    Discover public channels, creative circles, and friends across the network.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Current User Section (Bottom) */}
          <div className="oc-sidebar-user">
            <div className="oc-user-card">
              <div className="oc-avatar-wrap">
                <div className="oc-avatar">
                  {userInitial}
                </div>
                <span className="oc-online-badge" />
              </div>
              <div className="min-w-0">
                <div className="oc-user-name" title={resolvedName}>{resolvedName}</div>
                <div className="oc-user-sub" title={`@${resolvedHandle}`}>@{resolvedHandle}</div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1f1f24] transition-colors cursor-pointer"
                  title="Account Settings"
                  aria-label="Settings"
                >
                  <Settings size={17} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-[#17171b] text-[#f4f4f5] border-[#25252b]"
              >
                <DropdownMenuLabel className="text-xs text-[#a1a1aa]">
                  Account Settings
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#25252b]" />
                <DropdownMenuItem
                  className="text-xs focus:bg-[#202026] cursor-pointer"
                  onClick={() => alert(`Logged in as: ${user?.email || resolvedName}`)}
                >
                  Profile Details
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#25252b]" />
                <DropdownMenuItem
                  className="text-xs text-[#ef4444] focus:bg-[#202026] cursor-pointer flex items-center gap-2"
                  onClick={logout}
                >
                  <LogOut size={14} />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </motion.aside>
  );
}
