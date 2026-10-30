"use client";

import React from "react";
import { Plus, UserPlus, Hash } from "lucide-react";
import CreateModal from "@/src/shared/components/Modals/CreateModal";
import { useChannelStore } from "@/src/app/stores/channelStores";
import Link from "next/link";

export default function EmptyState() {
  const { createChannel } = useChannelStore();

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#09090b] text-[#f4f4f5] px-6">
      <div className="flex flex-col items-center space-y-6 text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-[#14243a] text-[#3b82f6] border border-[#25252b] flex items-center justify-center shadow-lg">
          <Hash size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#f4f4f5]">
            Welcome to Onechat
          </h1>
          <p className="text-sm text-[#a1a1aa] leading-relaxed">
            You don’t have any active channels or conversations yet. Start by creating
            a channel or connecting with friends.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <CreateModal
            title="Create a Channel"
            description="Enter a name for your new channel to start messaging."
            placeholder="Channel name"
            confirmText="Create Channel"
            onConfirm={async (name: string) => {
              await createChannel(name);
            }}
          >
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#3b82f6] hover:bg-[#60a5fa] text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Create Channel</span>
            </button>
          </CreateModal>
          <Link
            href="/friend-requests"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#17171b] hover:bg-[#202026] text-[#f4f4f5] border border-[#25252b] text-xs font-semibold transition-colors"
          >
            <UserPlus size={16} className="text-[#3b82f6]" />
            <span>Add Friends</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
