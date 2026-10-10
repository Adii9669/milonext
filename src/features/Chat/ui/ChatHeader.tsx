"use client";

import { Crew } from "@/src/types/crew";
import { Friends } from "@/src/types/friends";
import { Button } from "@/src/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/src/shared/components/ui/dropdown-menu";
import { Bot, ChevronLeft, Info, MoreVertical, Search } from "lucide-react";

interface ChatHeaderProps {
  crew: Crew | null;
  friend: Friends | null;
  logout: () => void;
  onBack?: () => void;
  members?: Array<{ name?: string; username?: string; user?: { name?: string; username?: string } }>;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function ChatHeader({ crew, friend, logout, onBack, members = [], sidebarOpen = true, onToggleSidebar }: ChatHeaderProps) {
  const memberInitials = members.slice(0, 3).map((member) => (member.name || member.user?.name || member.username || member.user?.username || "?").slice(0, 1).toUpperCase());
  const memberNames = members.slice(0, 3).map((member) => member.name || member.user?.name || member.username || member.user?.username).filter(Boolean);
  return (
    <header className="chat-header shrink-0 px-4 py-3 sm:px-6">
      <button type="button" className="mobile-chat-back" onClick={onBack} aria-label="Back to chats"><ChevronLeft aria-hidden="true" /><span>Chats</span></button>
      <div className="flex items-center justify-between">
        <div className="chat-header-title flex min-w-0 items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="chat-header-sidebar-toggle"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <Bot aria-hidden="true" className="size-4" />
            </button>
          )}
          {crew ? (
            <span className="chat-header-avatar-group" aria-hidden="true">
              {(memberInitials.length ? memberInitials : [crew.name.slice(0, 1).toUpperCase()]).map((initial, index) => <span key={`${initial}-${index}`}>{initial}</span>)}
            </span>
          ) : (
            <span className="chat-header-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
              {(friend?.name || "?").slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold">{crew?.name || friend?.name}</p>
            <p className="text-xs font-normal text-text-muted">{crew ? `${members.length || 1} members · ${memberNames.join(", ") || "your circle"}` : "Direct message"}</p>
          </div>
        </div>

        <div className="chat-header-actions">
        <span className="chat-header-search" aria-hidden="true"><Search /></span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="chat-header-menu-trigger p-2 rounded-md"
              onClick={(e) => e.stopPropagation()}
              aria-label="Conversation info and actions"
            >
              <Info className="chat-header-menu-icon desktop-chat-info-icon h-5 w-5" />
              <MoreVertical className="chat-header-menu-icon mobile-chat-info-icon h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            variant="dark"
            className="w-40 bg-surface text-text-primary border-border"
          >
            <DropdownMenuLabel className="text-text-primary">
              Actions
            </DropdownMenuLabel>

            <DropdownMenuItem
              stylevariant="dark"
              className="text-text-primary focus:bg-surface-hover focus:text-text-primary"
            >
              View Details
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              stylevariant="dark"
              className="text-text-primary focus:bg-surface-hover focus:text-text-primary"
            >
              Open Crew
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              stylevariant="dark"
              onSelect={(e) => {
                e.stopPropagation();
                logout();
              }}
              className="text-error focus:bg-error/10 focus:text-error"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
