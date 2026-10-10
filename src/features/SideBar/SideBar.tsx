"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bot, CalendarDays, MessageCircle, Plus, Search, UserRound, UserRoundPlus } from "lucide-react";
import { Crew } from "@/src/types/crew";
import { Friends } from "@/src/types/friends";
import { Message } from "@/src/features/Chat/types/messages";
import CreateModal from "@/src/shared/components/Modals/CreateModal";
import ThemeToggle from "@/src/shared/components/ToggleTheme";

interface CrewSidebarProps {
  crews: Crew[];
  messages?: Message[];
  loading: boolean;
  friends?: Friends[];
  selectedFriend?: Friends | null;
  setSelectedFriend?: (friend: Friends | null) => void;
  friendsLoading?: boolean;
  selectedCrew: Crew | null;
  setSelectedCrew?: (crew: Crew | null) => void;
  onSelectCrew: (crew: Crew) => void;
  onCreateCrew: (name: string) => Promise<void> | void;
  onDeleteCrew?: (crewId: string) => void;
  onClearSelectedCrew?: () => void;
  activeView?: "dm" | "crew";
  setActiveView?: (view: "dm" | "crew") => void;
  onOpenChat?: () => void;
  incomingRequestCount?: number;
  incomingRequestNames?: string[];
  user?: { name?: string; username?: string; email?: string } | null;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

type MobileTab = "chats" | "friends" | "plans" | "me";

export default function SideBar({
  crews, messages = [], loading, friends = [], selectedFriend, setSelectedFriend, friendsLoading,
  selectedCrew, setSelectedCrew, onSelectCrew, onCreateCrew, activeView, setActiveView,
  onOpenChat, incomingRequestCount = 0, user,
  incomingRequestNames = [],
  sidebarOpen = true,
  onToggleSidebar,
}: CrewSidebarProps) {
  const [localView, setLocalView] = useState<"dm" | "crew">(activeView ?? "crew");
  const [mobileTab, setMobileTab] = useState<MobileTab>("chats");
  const [search, setSearch] = useState("");
  const [chatFilter, setChatFilter] = useState<"all" | "unread" | "crews">("all");
  const view = activeView ?? localView;
  const filteredCrews = useMemo(() => crews.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [crews, search]);
  const filteredFriends = useMemo(() => friends.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [friends, search]);

  useEffect(() => {
    if (activeView) setLocalView(activeView);
  }, [activeView]);

  function changeView(next: "dm" | "crew") {
    setLocalView(next);
    setActiveView?.(next);
  }

  function selectCrew(crew: Crew) {
    onSelectCrew(crew);
    setSelectedFriend?.(null);
    changeView("crew");
    setMobileTab("chats");
    onOpenChat?.();
  }

  function selectFriend(friend: Friends) {
    setSelectedFriend?.(friend);
    setSelectedCrew?.(null);
    changeView("dm");
    setMobileTab("chats");
    onOpenChat?.();
  }

  function setListTab(tab: MobileTab) {
    setMobileTab(tab);
    if (tab === "friends") changeView("dm");
    if (tab === "chats") setActiveView?.("crew");
  }

  const isCrewSelected = (item: Crew) => selectedCrew?.id === item.id;
  const isFriendSelected = (item: Friends) => selectedFriend?.id === item.id;
  const isLoading = loading || friendsLoading;

  function formatMessageTime(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function latestForCrew(crewId: string) {
    return messages.filter((message) => message.type === "crew" && message.crewId === crewId).at(-1);
  }

  function latestForFriend(friendId: string) {
    return messages.filter((message) => message.type === "dm" && (message.isMine ? message.receiverId === friendId : message.sender?.id === friendId)).at(-1);
  }

  function renderCrew(item: Crew) {
    const latest = latestForCrew(item.id);
    return (
      <button key={item.id} type="button" onClick={() => selectCrew(item)} className={`chat-list-row ${isCrewSelected(item) ? "chat-list-row-active" : ""}`}>
        <span className="chat-list-avatar">{item.name.slice(0, 2).toUpperCase()}</span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm font-semibold text-text-primary">{item.name}</span>
          <span className="mt-1 block truncate text-xs text-text-muted">{latest?.content || "Crew conversation"}</span>
        </span>
        {latest && <time className="self-start pt-1 text-[9px] text-text-muted">{formatMessageTime(latest.createdAt)}</time>}
      </button>
    );
  }

  function renderFriend(item: Friends) {
    const latest = latestForFriend(item.id);
    return (
      <button key={item.id} type="button" onClick={() => selectFriend(item)} className={`chat-list-row ${isFriendSelected(item) ? "chat-list-row-active" : ""}`}>
        <span className="chat-list-avatar">{item.name.slice(0, 1).toUpperCase()}</span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm font-semibold text-text-primary">{item.name}</span>
          <span className="mt-1 block truncate text-xs text-text-muted">{latest?.content || "Direct message"}</span>
        </span>
        {latest && <time className="self-start pt-1 text-[9px] text-text-muted">{formatMessageTime(latest.createdAt)}</time>}
      </button>
    );
  }

  return (
    <aside className="sidebar-container app-sidebar flex h-[100dvh] shrink-0 border-r border-border">
      <nav className={`app-nav-rail flex shrink-0 flex-col items-center border-r border-border ${sidebarOpen ? "" : "is-collapsed"}`} aria-label="Main navigation">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="app-mark cursor-pointer border-0 bg-transparent transition-transform hover:scale-110 active:scale-95"
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <Bot aria-hidden="true" />
        </button>
        <button type="button" onClick={() => setListTab("chats")} className={`app-rail-button ${mobileTab === "chats" ? "is-active" : ""}`} aria-label="Chats"><MessageCircle aria-hidden="true" /></button>
        <Link href="/friend-requests" className="app-rail-button" aria-label="Friend requests"><UserRoundPlus aria-hidden="true" />{incomingRequestCount > 0 && <span className="app-rail-badge">{incomingRequestCount}</span>}</Link>
        <button type="button" onClick={() => setListTab("plans")} className={`app-rail-button ${mobileTab === "plans" ? "is-active" : ""}`} aria-label="Plans"><CalendarDays aria-hidden="true" /></button>
        <div className="mt-auto flex flex-col items-center gap-3">
          <ThemeToggle />
          <button type="button" onClick={() => setListTab("me")} className={`app-profile-avatar ${mobileTab === "me" ? "is-active" : ""}`} aria-label="Your profile">{(user?.name || user?.username || "Y").slice(0, 1).toUpperCase()}</button>
        </div>
      </nav>

      <section className="chat-list-panel flex min-w-0 flex-1 flex-col" aria-label="Your chats">
        <div className="chat-list-heading flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="chat-toggle-sidebar-button"
                title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                <Bot aria-hidden="true" className="size-4" />
              </button>
            )}
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {mobileTab === "plans" ? "Plans" : mobileTab === "me" ? "Me" : mobileTab === "friends" ? "Friends" : "Chats"}
            </h1>
          </div>
          {mobileTab === "chats" && (
            <CreateModal title="Create a new crew" description="Give your group a name." placeholder="Crew name" confirmText="Create crew" onConfirm={onCreateCrew}>
              <button type="button" className="chat-list-add shrink-0" aria-label="Create a crew"><Plus aria-hidden="true" /></button>
            </CreateModal>
          )}
        </div>

        {mobileTab === "chats" || mobileTab === "friends" ? (
          <>
            <label className="chat-search"><Search aria-hidden="true" className="size-4 shrink-0" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find by username" aria-label="Find chats by name" /></label>
            {mobileTab === "chats" && <div className="chat-filter-tabs" role="group" aria-label="Filter chats">
              {(["all", "unread", "crews"] as const).map((filter) => <button key={filter} type="button" className={chatFilter === filter ? "is-active" : ""} onClick={() => setChatFilter(filter)}>{filter === "all" ? "All" : filter === "unread" ? "Unread" : "Crews"}</button>)}
            </div>}
            <Link href="/friend-requests" className="friend-requests-link">
              <span>Friend requests</span><span className="friend-request-count">{incomingRequestCount}</span>
            </Link>
            <div className="chat-list-scroll">
              {isLoading ? <p className="chat-list-feedback">Loading your chats…</p> : null}
              {!isLoading && mobileTab === "chats" && chatFilter === "all" && <>
                <h2 className="chat-list-section-label">Pinned</h2>
                {filteredCrews.length ? filteredCrews.map(renderCrew) : <p className="chat-list-feedback">No crews yet.</p>}
                <h2 className="chat-list-section-label">Recent</h2>
                {filteredFriends.length ? filteredFriends.map(renderFriend) : <p className="chat-list-feedback">No friends yet.</p>}
              </>}
              {!isLoading && mobileTab === "chats" && chatFilter === "crews" && (filteredCrews.length ? filteredCrews.map(renderCrew) : <p className="chat-list-feedback">No crews yet.</p>)}
              {!isLoading && mobileTab === "chats" && chatFilter === "unread" && <p className="chat-list-feedback">No unread chats right now.</p>}
              {!isLoading && mobileTab === "friends" && (filteredFriends.length ? filteredFriends.map(renderFriend) : <p className="chat-list-feedback">No friends yet. Search by username to find someone.</p>)}
            </div>
            {mobileTab === "chats" && incomingRequestCount > 0 && <div className="friend-request-summary"><span><strong>{incomingRequestCount} friend requests</strong><small>{incomingRequestNames.slice(0, 2).join(" and ") || "People want to connect"}</small></span><Link href="/friend-requests">Review</Link></div>}
          </>
        ) : mobileTab === "plans" ? (
          <div className="mobile-panel-card"><span className="mobile-panel-eyebrow">Coming soon</span><h2>Make a plan together</h2><p>Keep a little plan with your people, right alongside the conversation.</p><div className="mobile-plan-preview"><strong>Saturday, 7pm</strong><span>Café with the best cake</span><div><b>I’m in</b><i>Maybe</i></div></div></div>
        ) : (
          <div className="mobile-panel-card"><span className="mobile-panel-eyebrow">Your account</span><h2>{user?.name || user?.username || "Your profile"}</h2><p>{user?.email || "Your Onechat account"}</p><Link href="/auth/login" className="mobile-account-link">Account settings</Link></div>
        )}

        <nav className="mobile-tab-bar" aria-label="App sections">
          <button type="button" className={mobileTab === "chats" ? "is-active" : ""} onClick={() => setListTab("chats")}><MessageCircle aria-hidden="true" /><span>Chats</span></button>
          <button type="button" className={mobileTab === "friends" ? "is-active" : ""} onClick={() => setListTab("friends")}><UserRoundPlus aria-hidden="true" /><span>Friends</span></button>
          <button type="button" className={mobileTab === "plans" ? "is-active" : ""} onClick={() => setListTab("plans")}><CalendarDays aria-hidden="true" /><span>Plans</span></button>
          <button type="button" className={mobileTab === "me" ? "is-active" : ""} onClick={() => setListTab("me")}><UserRound aria-hidden="true" /><span>Me</span></button>
        </nav>
      </section>
    </aside>
  );
}
