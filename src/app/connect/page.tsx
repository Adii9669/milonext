"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/context/page";
import { Crew } from "@/src/types";
import CrewSidebar from "./components/CrewSidebar";
import ChatComponent from "./components/ChatComponent";

export default function ChatPage() {
  const { crews, loading, logout, deleteCrew, getCrews } = useAuth();
  const [localCrews, setLocalCrews] = useState<Crew[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);

  // Keep localCrews in sync with context
  useEffect(() => {
    setLocalCrews(crews || []);
  }, [crews]);

  // Automatically select the first crew when available
  useEffect(() => {
    if (!loading && localCrews.length > 0 && !selectedCrew) {
      setSelectedCrew(localCrews[0]);
    }
  }, [loading, localCrews, selectedCrew]);

  if (loading) {
    return <div className="text-center mt-6">Loading...</div>;
  }

  // 🧠 Handle Crew Deletion
  const handleDeleteCrew = async (crewId: string) => {
    try {
      await deleteCrew(crewId);

      // Update local list
      const updatedCrews = localCrews.filter((c) => c.id !== crewId);
      setLocalCrews(updatedCrews);

      // 🧹 Unselect if the deleted one was open
      if (selectedCrew?.id === crewId) {
        // Option 1: Select next available crew
        if (updatedCrews.length > 0) {
          setSelectedCrew(updatedCrews[0]);
        } else {
          // Option 2: No crews left, clear selection
          setSelectedCrew(null);
        }
      }

      // Optionally, re-fetch from server for sync
      await getCrews();
      // setLocalCrews(crews || []);
    } catch (error) {
      console.error("Error deleting crew:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-200">
      <CrewSidebar
        crews={localCrews}
        onSelectCrew={setSelectedCrew}
        selectedCrew={selectedCrew}
        onDeleteCrew={handleDeleteCrew}
      />

      <div className="flex flex-1 flex-col">
        {selectedCrew ? (
          <>
            <div className="bg-white p-4 shadow-md flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedCrew.name}</h2>
            </div>
            <div className="flex-grow">
              <ChatComponent key={selectedCrew.id} crew={selectedCrew} />
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-xl text-gray-500">
              Select a crew to start chatting.
            </p>
          </div>
        )}
      </div>

      <div className="absolute cursor-pointer top-5 right-8 border-r-amber-100">
        <Button className="cursor-pointer" onClick={logout}>
          Out
        </Button>
      </div>
    </div>
  );
}
