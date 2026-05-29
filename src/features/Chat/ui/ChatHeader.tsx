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
import { MoreVertical } from "lucide-react";

interface ChatHeaderProps {
  crew: Crew | null;
  friend: Friends | null;
  logout: () => void;
}

export function ChatHeader({ crew, friend, logout }: ChatHeaderProps) {
  return (
    <header className="chat-header p-4 font-bold shrink-0">
      <div className="flex justify-between items-center">
        <div className="chat-header-title flex items-center gap-2">
          {crew?.name || friend?.name}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="chat-header-menu-trigger p-2 rounded-md"
              onClick={(e) => e.stopPropagation()}
              aria-label="Chat actions"
            >
              <MoreVertical className="chat-header-menu-icon h-5 w-5" />
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
              styleVariant="dark"
              className="text-text-primary focus:bg-surface-hover focus:text-text-primary"
            >
              View Details
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              styleVariant="dark"
              className="text-text-primary focus:bg-surface-hover focus:text-text-primary"
            >
              Open Crew
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              styleVariant="dark"
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
    </header>
  );
}
