"use client";

import React, { useState } from "react";
import { useProtectedRoute } from "@/src/hooks/useProtectedRoute";
import { useConnectPage } from "@/src/features/Connect/hooks/useConnectPage";
import { ConnectLoading } from "./Loading";
import { OnechatSidebar } from "./OnechatSidebar";
import { OnechatChatContainer } from "@/src/features/Chat/ui/OnechatChatContainer";
import { OnechatDetailsPanel } from "@/src/features/Chat/ui/OnechatDetailsPanel";
import EmptyState from "./EmptyState";
import { Plan } from "@/src/features/Chat/types/plans";

export function ConnectLayout() {
  useProtectedRoute("/");

  // Independent panel states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [currentPlans, setCurrentPlans] = useState<Plan[]>([]);

  const {
    user,
    authLoading,
    realtime,
    queries,
    selection,
    isEmptyState,
  } = useConnectPage();

  if (authLoading) {
    return <ConnectLoading text="Loading Onechat…" />;
  }

  if (queries.channelsLoading || queries.friendsLoading) {
    return <ConnectLoading text="Loading conversations…" />;
  }

  if (!user) {
    return <ConnectLoading text="Unauthorized" />;
  }

  const hasActiveConversation = Boolean(
    selection.selectedChannel || selection.selectedFriend
  );

  return (
    <div className="oc-app-shell">
      {/* ── Left Navigation & Conversations Panel ──────────────── */}
      <div className={`${mobileChatOpen ? "hidden md:flex" : "flex"} h-full`}>
        <OnechatSidebar
          channels={queries.channels}
          friends={queries.friendsToShow}
          messages={realtime.messages}
          loading={queries.channelsLoading}
          friendsLoading={queries.friendsLoading}
          selectedChannel={selection.selectedChannel}
          selectedFriend={selection.selectedFriend}
          onSelectChannel={(channel) => {
            selection.handleSelectChannel(channel);
            setMobileChatOpen(true);
          }}
          onSelectFriend={(friend) => {
            selection.handleSelectFriend(friend);
            setMobileChatOpen(true);
          }}
          onCreateChannel={queries.createChannel}
          incomingRequestCount={queries.incomingRequests.length}
          user={user}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          onOpenMobileChat={() => setMobileChatOpen(true)}
        />
      </div>

      {/* ── Center Chat Panel ──────────────────────────────────── */}
      <div
        className={`flex-1 h-full min-w-0 flex flex-col ${
          !mobileChatOpen ? "hidden md:flex" : "flex"
        }`}
      >
        {isEmptyState ? (
          <div className="flex-1 flex flex-col h-full bg-[#09090b]">
            <EmptyState />
          </div>
        ) : (
          <OnechatChatContainer
            channel={selection.selectedChannel}
            friend={selection.selectedFriend}
            messages={realtime.messages}
            planEvents={realtime.planEvents}
            deletedMessageIds={realtime.deletedMessageIds}
            sendMessage={realtime.sendMessage}
            connected={realtime.connected}
            currentUser={user}
            sendDelivered={realtime.sendDelivered}
            sendRead={realtime.sendRead}
            typing={realtime.typing}
            getTypingUsers={realtime.getTypingUsers}
            startTyping={realtime.startTyping}
            stopTyping={realtime.stopTyping}
            onBack={() => setMobileChatOpen(false)}
            channelMembers={queries.channelMembers}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
            rightPanelOpen={rightPanelOpen}
            onToggleRightPanel={() => setRightPanelOpen((prev) => !prev)}
            onPlansUpdated={(plans) => setCurrentPlans(plans)}
          />
        )}
      </div>

      {/* ── Right Context & Details Panel ───────────────────────── */}
      {hasActiveConversation && (
        <OnechatDetailsPanel
          channel={selection.selectedChannel}
          friend={selection.selectedFriend}
          members={queries.channelMembers}
          plans={currentPlans}
          messages={realtime.messages}
          currentUserID={user.id}
          isOpen={rightPanelOpen}
          onClose={() => setRightPanelOpen(false)}
          onFriendRemoved={() => selection.setSelectedFriend(null)}
          onPlanChanged={(updated) => {
            setCurrentPlans((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
          }}
        />
      )}
    </div>
  );
}
