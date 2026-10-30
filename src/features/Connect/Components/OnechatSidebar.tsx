"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Users,
  Hash,
  CalendarDays,
  Compass,
  SquarePen,
  Search,
  Plus,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Circle,
} from "lucide-react";
import { Channel } from "@/src/types/channel";
import { Friends } from "@/src/types/friends";
import { Message } from "@/src/features/Chat/types/messages";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import CreateModal from "@/src/shared/components/Modals/CreateModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu";

export type NavTab = "chats" | "friends" | "channels" | "plans" | "explore";

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
}: OnechatSidebarProps) {
  const { logout } = useAuth();
  const [activeNav, setActiveNav] = useState<NavTab>("chats");
  const [searchQuery, setSearchQuery] = useState("");

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
      animate={{ width: collapsed ? 68 : 300 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="oc-sidebar-header">
        {!collapsed ? (
          <div className="flex items-center justify-between w-full">
            <Link href="/" className="oc-sidebar-brand">
              <span>Onechat</span>
              <span className="oc-sidebar-brand-dot" />
            </Link>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById(
                    "oc-sidebar-search-input"
                  ) as HTMLInputElement | null;
                  input?.focus();
                }}
                className="oc-btn-icon"
                title="Search conversations"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="oc-btn-icon"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full gap-2">
            <button
              type="button"
              className="oc-btn-icon active"
              onClick={onToggleCollapse}
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* ── Search Bar ────────────────────────────────────────── */}
      {!collapsed && (
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
      )}

      {/* ── Main Navigation List (Chats, Friends, Channels, Plans, Explore) */}
      <nav className="oc-nav-menu" aria-label="Main navigation">
        <button
          type="button"
          onClick={() => setActiveNav("chats")}
          className={`oc-nav-item ${activeNav === "chats" ? "active" : ""}`}
          title="Chats"
        >
          <div className="flex items-center gap-3">
            <MessageCircle size={17} />
            {!collapsed && <span>Chats</span>}
          </div>
          {!collapsed && incomingRequestCount > 0 && (
            <span className="oc-nav-badge">{incomingRequestCount}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveNav("friends")}
          className={`oc-nav-item ${activeNav === "friends" ? "active" : ""}`}
          title="Friends"
        >
          <div className="flex items-center gap-3">
            <Users size={17} />
            {!collapsed && <span>Friends</span>}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveNav("channels")}
          className={`oc-nav-item ${activeNav === "channels" ? "active" : ""}`}
          title="Channels"
        >
          <div className="flex items-center gap-3">
            <Hash size={17} />
            {!collapsed && <span>Channels</span>}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveNav("plans")}
          className={`oc-nav-item ${activeNav === "plans" ? "active" : ""}`}
          title="Plans"
        >
          <div className="flex items-center gap-3">
            <CalendarDays size={17} />
            {!collapsed && <span>Plans</span>}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveNav("explore")}
          className={`oc-nav-item ${activeNav === "explore" ? "active" : ""}`}
          title="Explore"
        >
          <div className="flex items-center gap-3">
            <Compass size={17} />
            {!collapsed && <span>Explore</span>}
          </div>
        </button>
      </nav>

      {/* ── Collapsed View vs Expanded View ─────────────────────── */}
      {collapsed ? (
        <div className="flex-1 overflow-y-auto oc-scroll py-2 flex flex-col items-center gap-2">
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
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                  isSelected
                    ? "bg-[#14243a] text-[#3b82f6] border border-[#3b82f6]"
                    : "bg-[#17171b] text-[#a1a1aa] hover:text-[#f4f4f5]"
                }`}
                title={`# ${c.name}`}
              >
                {c.name.slice(0, 2).toUpperCase()}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto oc-scroll min-h-0">
          {/* ── DIRECT MESSAGES Section ──────────────────────────── */}
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
                <div className="px-4 py-3 text-xs text-[#71717a]">No direct conversations.</div>
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

          {/* ── CHANNELS Section ─────────────────────────────────── */}
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
                  <button type="button" className="oc-section-action-btn" title="Create Channel">
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
                          {isSelected && <span className="oc-unread-dot" />}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* ── PLANS Navigation Tab Overview ────────────────────── */}
          {activeNav === "plans" && (
            <div className="p-4">
              <div className="p-4 rounded-xl bg-[#17171b] border border-[#25252b]">
                <div className="flex items-center gap-2 text-[#3b82f6] font-bold text-xs uppercase tracking-wider mb-2">
                  <CalendarDays size={15} />
                  <span>Onechat Plans</span>
                </div>
                <h3 className="text-sm font-semibold text-[#f4f4f5]">Active Calendar</h3>
                <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                  Plans created in conversations appear directly in the chat timeline and in the right details panel.
                </p>
              </div>
            </div>
          )}

          {/* ── EXPLORE Navigation Tab Overview ──────────────────── */}
          {activeNav === "explore" && (
            <div className="p-4">
              <div className="p-4 rounded-xl bg-[#17171b] border border-[#25252b] text-center">
                <Compass size={28} className="mx-auto text-[#3b82f6] mb-2" />
                <h3 className="text-sm font-semibold text-[#f4f4f5]">Explore Onechat</h3>
                <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                  Discover public channels, creative circles, and friends across the network.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Current User Section (Bottom) ────────────────────────── */}
      <div className="oc-sidebar-user">
        {!collapsed ? (
          <>
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
                  className="oc-btn-icon"
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
          </>
        ) : (
          <div className="mx-auto">
            <div className="oc-avatar" title={`${resolvedName} (@${resolvedHandle})`}>
              {userInitial}
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
