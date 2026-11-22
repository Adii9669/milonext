"use client";

import React, { useState, useCallback, useEffect } from "react";
import { MessageSquare, CalendarDays, Compass, Radio } from "lucide-react";
import { useProtectedRoute } from "@/src/hooks/useProtectedRoute";
import { useConnectPage } from "@/src/features/Connect/hooks/useConnectPage";
import { ConnectLoading } from "./Loading";
import { SidebarIconRail } from "./SidebarIconRail";
import { ConversationList } from "./ConversationList";
import { OnechatChatContainer } from "@/src/features/Chat/ui/OnechatChatContainer";
import { OnechatDetailsPanel } from "@/src/features/Chat/ui/OnechatDetailsPanel";
import EmptyState from "./EmptyState";
import { Plan } from "@/src/features/Chat/types/plans";
import { PlansCalendarPage } from "@/src/features/Chat/ui/PlansCalendarPage";
import { type NavTab } from "./SidebarIconRail";
import { useJamStore } from "@/src/features/Jam/store/useJamStore";
import { isJamEnabled } from "@/src/features/Jam/utils/featureFlag";

function isMobileViewport() {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

export function ConnectLayout() {
  useProtectedRoute("/");

  // Independent panel states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [currentPlans, setCurrentPlans] = useState<Plan[]>([]);
  const [activeWorkspaceNav, setActiveWorkspaceNav] = useState<NavTab>("chats");

  const isJamFeatureEnabled = isJamEnabled();
  const isJamOpen = useJamStore((s) => s.isPanelOpen);
  const toggleJamPanel = useJamStore((s) => s.togglePanel);

  // Stable callback with structural comparison to prevent re-render cascades
  const handlePlansUpdated = useCallback((plans: Plan[]) => {
    setCurrentPlans((prev) => {
      if (
        prev.length === plans.length &&
        prev.every(
          (p, i) =>
            p.id === plans[i]?.id &&
            p.status === plans[i]?.status &&
            p.updatedAt === plans[i]?.updatedAt
        )
      ) {
        return prev;
      }
      return plans;
    });
  }, []);

  const {
    user,
    authLoading,
    realtime,
    queries,
    selection,
    isEmptyState,
  } = useConnectPage();

  // Clear current plans immediately when conversation switches so old plans never bleed through
  useEffect(() => {
    setCurrentPlans([]);
  }, [selection.selectedChannel?.id, selection.selectedFriend?.id]);

  // On phones, the details panel should start closed (it overlays the chat)
  useEffect(() => {
    if (isMobileViewport()) {
      setRightPanelOpen(false);
    }
  }, []);

  // Global Ctrl + \ shortcut to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const handleSelectChannel = (channel: Parameters<
    typeof selection.handleSelectChannel
  >[0]) => {
    selection.handleSelectChannel(channel);
    setActiveWorkspaceNav("chats");
    setMobileChatOpen(true);
    if (isMobileViewport()) setRightPanelOpen(false);
  };

  const handleSelectFriend = (friend: Parameters<
    typeof selection.handleSelectFriend
  >[0]) => {
    selection.handleSelectFriend(friend);
    setActiveWorkspaceNav("chats");
    setMobileChatOpen(true);
    if (isMobileViewport()) setRightPanelOpen(false);
  };

  const handleNavigate = (tab: NavTab) => {
    setActiveWorkspaceNav(tab);
    // On mobile the chat/calendar pane replaces the list for these tabs.
    setMobileChatOpen(tab === "plans");
  };

  const handleCreateChannel = async (name: string) => {
    try {
      const res: any = await queries.createChannel(name);
      const newChannel = res?.channel || (res?.id ? res : null);
      if (newChannel) {
        handleSelectChannel(newChannel);
      }
    } catch (err) {
      console.error("Failed to create channel:", err);
    }
  };

  return (
    <div className="oc-app-shell">
      {/* ── Two-level sidebar: icon rail + conversation list ───────── */}
      <div
        className={`oc-sidebars ${mobileChatOpen ? "oc-sidebars--chat-open" : ""}`}
      >
        <SidebarIconRail
          messages={realtime.messages}
          incomingRequestCount={queries.incomingRequests.length}
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          activeNav={activeWorkspaceNav}
          onNavigate={handleNavigate}
        />

        <ConversationList
          channels={queries.channels}
          friends={queries.friendsToShow}
          messages={realtime.messages}
          loading={queries.channelsLoading}
          friendsLoading={queries.friendsLoading}
          selectedChannel={selection.selectedChannel}
          selectedFriend={selection.selectedFriend}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          onSelectChannel={handleSelectChannel}
          onSelectFriend={handleSelectFriend}
          onCreateChannel={handleCreateChannel}
          incomingRequestCount={queries.incomingRequests.length}
          user={user}
          activeNav={activeWorkspaceNav}
          onNavigate={handleNavigate}
          getTypingUsers={realtime.getTypingUsers}
        />
      </div>

      {/* ── Mobile Bottom Navigation Bar (Divriots Mobile Tab Style) ─ */}
      {!mobileChatOpen && (
        <nav
          className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#0e0e10]/95 backdrop-blur-xl border-t border-[#22242a]/70 shadow-[0_-1px_12px_rgba(0,0,0,0.35)] md:hidden"
          data-active-classes="text-primary"
        >
          <div className="flex justify-around items-center h-14 px-2">
            <button
              type="button"
              onClick={() => handleNavigate("chats")}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
                activeWorkspaceNav === "chats"
                  ? "text-[#A78BFA]"
                  : "text-[#9ba1a6] hover:text-[#f0f2f5]"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  activeWorkspaceNav === "chats"
                    ? "bg-[#6E53CC]/25 text-[#A78BFA] font-bold"
                    : "bg-[#1e2025] text-[#9ba1a6]"
                }`}
              >
                <MessageSquare size={18} />
              </div>
              <span
                className={`text-[11px] mt-0.5 ${
                  activeWorkspaceNav === "chats"
                    ? "font-semibold text-[#A78BFA]"
                    : "font-medium"
                }`}
              >
                Chat
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("plans")}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
                activeWorkspaceNav === "plans"
                  ? "text-[#A78BFA]"
                  : "text-[#9ba1a6] hover:text-[#f0f2f5]"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  activeWorkspaceNav === "plans"
                    ? "bg-[#6E53CC]/25 text-[#A78BFA] font-bold"
                    : "bg-[#1e2025] text-[#9ba1a6]"
                }`}
              >
                <CalendarDays size={18} />
              </div>
              <span
                className={`text-[11px] mt-0.5 ${
                  activeWorkspaceNav === "plans"
                    ? "font-semibold text-[#A78BFA]"
                    : "font-medium"
                }`}
              >
                Plan
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("explore")}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
                activeWorkspaceNav === "explore"
                  ? "text-[#A78BFA]"
                  : "text-[#9ba1a6] hover:text-[#f0f2f5]"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  activeWorkspaceNav === "explore"
                    ? "bg-[#6E53CC]/25 text-[#A78BFA] font-bold"
                    : "bg-[#1e2025] text-[#9ba1a6]"
                }`}
              >
                <Compass size={18} />
              </div>
              <span
                className={`text-[11px] mt-0.5 ${
                  activeWorkspaceNav === "explore"
                    ? "font-semibold text-[#A78BFA]"
                    : "font-medium"
                }`}
              >
                Explore
              </span>
            </button>

            {isJamFeatureEnabled && (
              <button
                type="button"
                onClick={toggleJamPanel}
                className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
                  isJamOpen
                    ? "text-[#A78BFA]"
                    : "text-[#9ba1a6] hover:text-[#f0f2f5]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isJamOpen
                      ? "bg-[#6E53CC]/25 text-[#A78BFA] font-bold"
                      : "bg-[#1e2025] text-[#9ba1a6]"
                  }`}
                >
                  <Radio size={18} />
                </div>
                <span
                  className={`text-[11px] mt-0.5 ${
                    isJamOpen
                      ? "font-semibold text-[#A78BFA]"
                      : "font-medium"
                  }`}
                >
                  Jam
                </span>
              </button>
            )}
          </div>
        </nav>
      )}

      {/* ── Center Chat Panel ───────────────────────────────────────── */}
      <div
        className={`flex-1 h-full min-w-0 flex flex-col ${
          !mobileChatOpen ? "hidden md:flex" : "flex"
        }`}
      >
        {activeWorkspaceNav === "plans" ? (
          <PlansCalendarPage
            userId={user.id}
            friends={queries.friendsToShow}
            channels={queries.channels}
            refreshToken={realtime.planEvents.length}
            onBack={() => setMobileChatOpen(false)}
          />
        ) : isEmptyState ? (
          <div className="flex-1 flex flex-col h-full bg-[#09090b]">
            <EmptyState
              onCreateChannel={handleCreateChannel}
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
            />
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
            onPlansUpdated={handlePlansUpdated}
          />
        )}
      </div>

      {/* ── Right Context & Details Panel ───────────────────────────── */}
      {hasActiveConversation && activeWorkspaceNav !== "plans" && (
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
          onPlanDeleted={(planId) => {
            setCurrentPlans((prev) => prev.filter((plan) => plan.id !== planId));
          }}
        />
      )}
    </div>
  );
}
