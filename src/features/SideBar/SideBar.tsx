"use client";

import { useState, useEffect } from "react";
import { Crew } from "@/src/types/crew";
import { Friends } from "@/src/types/friends";
import CreateModal from "@/src/shared/components/Modals/CreateModal";
import FriendsSidebar from "./FriendSideBar";

/* =======================
   Props (LEAN)
======================= */

interface CrewSidebarProps {
  crews: Crew[];
  loading: boolean;
  friends?: Friends[];
  selectedFriend?: Friends | null;
  setSelectedFriend?: (f: Friends | null) => void;
  friendsLoading?: boolean;
  selectedCrew: Crew | null;
  setSelectedCrew?: (c: Crew | null) => void;

  onSelectCrew: (crew: Crew) => void;
  onCreateCrew: (name: string) => void;
  onDeleteCrew?: (crewId: string) => void;

  // optional: allow toggling to DM view / clearing selection without breaking callers
  activeView?: "dm" | "crew";
  setActiveView?: (v: "dm" | "crew") => void;
  onClearSelectedCrew?: () => void;
}

/* =======================
   Component
======================= */

export default function SideBar({
  crews,
  loading,
  friends,
  selectedFriend,
  setSelectedFriend,
  friendsLoading,
  selectedCrew,
  setSelectedCrew,
  onSelectCrew,
  onCreateCrew,
  activeView,
  setActiveView,
  onClearSelectedCrew,
}: CrewSidebarProps) {
  // local control when parent doesn't provide activeView
  const [showFriends, setShowFriends] = useState<boolean>(activeView === "dm");

  useEffect(() => {
    if (activeView !== undefined) {
      setShowFriends(activeView === "dm");
    }
  }, [activeView]);

  const isDmView = activeView !== undefined ? activeView === "dm" : showFriends;

  if (loading) {
    return (
      <div className="flex w-20 items-center justify-center bg-sidebar-background text-foreground">
        Loading...
      </div>
    );
  }

  // Changed: render left vertical crew bar + (conditionally) the friends sidebar as a sibling
  return (
    <div className="flex h-full">
      {/* Left vertical crew bar (w-20) */}
      <div className="flex w-20 flex-col items-center space-y-2 bg-sidebar-background p-3 text-foreground">
        {/* DM Toggle at top */}
        <button
          onClick={() => {
            const newState = !isDmView;
            setShowFriends(newState);
            setActiveView?.(newState ? "dm" : "crew");
          }}
          style={{
            backgroundColor: isDmView ? "var(--primary)" : "var(--sidebar-button-bg)",
            color: isDmView ? "var(--primary-foreground)" : "var(--text-primary)",
          }}
          className={`
    relative

    flex
    h-14
    w-14

    cursor-pointer

    items-center
    justify-center

    rounded-xl

    text-2xl
    font-bold

    transition-all
    duration-200
    
    ${isDmView ? "rounded-2xl" : "hover:rounded-2xl"}
  `}
          title="Direct Messages"
          type="button"
        >
          DM
        </button>

        {/* Render Crews */}
        {crews.map((crew) => (
          <div
            key={crew.id}
            style={{
              backgroundColor:
                selectedCrew?.id === crew.id
                  ? "var(--primary)"
                  : "var(--sidebar-button-bg)",
              color:
                selectedCrew?.id === crew.id
                  ? "var(--primary-foreground)"
                  : "var(--text-primary)",
            }}
            className={`relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-xl text-2xl font-bold transition-all duration-200 ${
              selectedCrew?.id === crew.id ? "rounded-2xl" : "hover:rounded-2xl"
            }`}
            onClick={() => {
              onSelectCrew(crew);
              setSelectedFriend?.(null);
              setActiveView?.("crew");
              setShowFriends(false);
            }}
            title={crew.name}
          >
            {crew.name.charAt(0).toUpperCase()}
          </div>
        ))}

        {/* Create Crew */}
        <CreateModal
          title="Create a New Crew"
          description="Enter a name for your new crew"
          placeholder="Crew name"
          confirmText="Create"
          onConfirm={async (name: string) => {
            onCreateCrew(name);
          }}
        >
          <div
            style={{
              backgroundColor: "var(--sidebar-button-bg)",
              color: "var(--success)",
            }}
            className="mt-4 flex h-14 w-14 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 hover:rounded-2xl"
          >
            <span className="text-3xl font-light">+</span>
          </div>
        </CreateModal>
      </div>

      {isDmView && (
        <FriendsSidebar
          friends={friends ?? []}
          selectedFriend={selectedFriend ?? null}
          onSelectFriend={(f) => {
            setSelectedFriend?.(f);
            setSelectedCrew?.(null);
            setShowFriends(true);
            setActiveView?.("dm");
          }}
          friendsLoading={friendsLoading ?? false}
        />
      )}
    </div>
  );
}
