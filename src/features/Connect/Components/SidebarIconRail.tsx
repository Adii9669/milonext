"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Users,
  Hash,
  CalendarDays,
  Compass,
  Radio,
  LogOut,
} from "lucide-react";
import { isJamEnabled } from "@/src/features/Jam/utils/featureFlag";
import { Channel } from "@/src/types/channel";
import { Friends } from "@/src/types/friends";
import { Message } from "@/src/features/Chat/types/messages";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import {
  useJamStore,
  toggleJamPanel as triggerToggleJam,
} from "@/src/features/Jam/store/useJamStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu";

export type NavTab = "chats" | "friends" | "channels" | "plans" | "explore" | "jam";

export type RecentChat =
  | { type: "channel"; channel: Channel }
  | { type: "dm"; friend: Friends };

interface SidebarIconRailProps {
  channels?: Channel[];
  friends?: Friends[];
  messages?: Message[];
  selectedChannel?: Channel | null;
  selectedFriend?: Friends | null;
  recentChats?: RecentChat[];
  incomingRequestCount?: number;
  user?: {
    id?: string;
    name?: string;
    username?: string;
    email?: string;
  } | null;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onSelectChannel?: (channel: Channel) => void;
  onSelectFriend?: (friend: Friends) => void;
  onCreateChannel?: (name: string) => Promise<void> | void;
  activeNav?: NavTab;
  onNavigate?: (tab: NavTab) => void;
}

const NAV_ITEMS: Array<{
  id: NavTab;
  label: string;
  icon: React.ElementType;
}> = [
  { id: "chats", label: "Chats", icon: MessageSquare },
  { id: "friends", label: "Friends", icon: Users },
  { id: "channels", label: "Channels", icon: Hash },
  { id: "plans", label: "Plans", icon: CalendarDays },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "jam", label: "Jam", icon: Radio },
];

export function SidebarIconRail({
  messages = [],
  incomingRequestCount = 0,
  user,
  sidebarCollapsed = false,
  onToggleSidebar,
  activeNav: activeNavProp,
  onNavigate,
}: SidebarIconRailProps) {
  const { logout } = useAuth();
  const [internalActiveNav, setInternalActiveNav] = useState<NavTab>("chats");
  const activeNav = activeNavProp ?? internalActiveNav;

  const isJamFeatureEnabled = isJamEnabled();
  const isJamOpen = useJamStore((s) => s.isPanelOpen);
  const isJamPlaying = useJamStore((s) => s.playbackState === "playing");

  const handleNavigate = (tab: NavTab) => {
    if (tab === "jam") {
      setInternalActiveNav("jam");
      onNavigate?.("jam");
      triggerToggleJam();
      if (sidebarCollapsed) {
        onToggleSidebar?.();
      }
      return;
    }

    if (tab === "chats") {
      if (sidebarCollapsed) {
        // If sidebar is collapsed, clicking Chats opens it
        onToggleSidebar?.();
        if (activeNav !== "chats") {
          setInternalActiveNav("chats");
          onNavigate?.("chats");
        }
      } else {
        // If sidebar is already open:
        // Clicking Chats again toggles it off (closes it)
        if (activeNav === "chats") {
          onToggleSidebar?.();
        } else {
          // If on another tab, switch back to chats
          setInternalActiveNav("chats");
          onNavigate?.("chats");
        }
      }
      return;
    }

    // Other navigation tabs (friends, channels, plans, explore)
    setInternalActiveNav(tab);
    onNavigate?.(tab);
    if (sidebarCollapsed) {
      onToggleSidebar?.();
    }
  };

  const resolvedName =
    user?.name?.trim() ||
    user?.username?.trim() ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "User";
  const userInitial = resolvedName.charAt(0).toUpperCase() || "U";

  const hasUnreadChats = messages.some((m) => !m.isMine && m.status !== "read");

  return (
    <aside className="oc-sidebar-rail" aria-label="Main Navigation">
      {/* ── Main Navigation Items placed directly at top (WhatsApp style) ── */}
      <nav className="oc-rail-nav pt-3" aria-label="Main navigation">
        {NAV_ITEMS.filter((item) => item.id !== "jam" || isJamFeatureEnabled).map((item) => {
          const Icon = item.icon;
          const isActive =
            activeNav === item.id || (item.id === "jam" && isJamOpen);
          const showBadge =
            (item.id === "friends" && incomingRequestCount > 0) ||
            (item.id === "chats" && hasUnreadChats) ||
            (item.id === "jam" && isJamPlaying);

          const itemTitle =
            item.id === "chats"
              ? sidebarCollapsed
                ? "Chats (Click to open sidebar)"
                : isActive
                ? "Chats (Click to close sidebar)"
                : "Chats"
              : item.id === "jam"
              ? isJamPlaying
                ? "Onechat Jam (Live)"
                : "Onechat Jam"
              : item.label;

          return (
            <div
              key={item.id}
              className={`oc-rail-item-wrap ${isActive ? "active" : ""}`}
            >
              <span className="oc-rail-indicator" />
              <button
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`oc-rail-nav-btn ${isActive ? "active" : ""}`}
                title={itemTitle}
                aria-label={itemTitle}
                aria-current={isActive ? "true" : undefined}
              >
                <Icon size={19} />
                {showBadge && <span className="oc-rail-unread-badge" />}
              </button>
            </div>
          );
        })}
      </nav>

      {/* ── Vertical Spacer (pushes user profile to bottom) ───────── */}
      <div className="flex-1" />

      {/* ── Bottom: User profile ──────────────────────────────────── */}
      <div className="oc-rail-user">
        <RailUserProfile
          user={user}
          initial={userInitial}
          name={resolvedName}
          onLogout={logout}
        />
      </div>
    </aside>
  );
}

function RailUserProfile({
  user,
  initial,
  name,
  onLogout,
}: {
  user?: {
    id?: string;
    name?: string;
    username?: string;
    email?: string;
  } | null;
  initial: string;
  name: string;
  onLogout: () => void;
}) {
  const resolvedHandle =
    user?.username?.trim() ||
    (user?.email ? user.email.split("@")[0] : "") ||
    name.toLowerCase().replace(/\s+/g, "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="oc-rail-user-button"
          title={`${name} (@${resolvedHandle})`}
          aria-label="User profile options"
        >
          {initial}
          <span className="oc-rail-online-badge" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="right"
        sideOffset={14}
        className="w-56 bg-[var(--oc-bg-surface)] text-[var(--oc-text-primary)] border-[var(--oc-border)] shadow-2xl rounded-xl p-1.5"
      >
        <DropdownMenuLabel className="text-xs px-2.5 py-2">
          <div className="font-semibold text-[var(--oc-text-primary)] text-sm">{name}</div>
          <div className="text-[11px] text-[var(--oc-text-muted)] font-normal">
            @{resolvedHandle}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#22c55e]">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span>Online</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[var(--oc-border)]" />
        <DropdownMenuItem
          className="text-xs focus:bg-[var(--oc-bg-hover)] cursor-pointer rounded-lg px-2.5 py-1.5"
          onClick={() => alert(`Logged in as: ${user?.email || name}`)}
        >
          Profile Details
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[var(--oc-border)]" />
        <DropdownMenuItem
          className="text-xs text-[#ef4444] focus:bg-[var(--oc-bg-hover)] cursor-pointer rounded-lg px-2.5 py-1.5 flex items-center gap-2"
          onClick={onLogout}
        >
          <LogOut size={14} />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
