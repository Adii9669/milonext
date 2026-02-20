"use client";

import { useAuth } from "@/src/context/AuthContext";
import { Crew } from "@/src/types/crew";
import { useCrewStore } from "@/src/app/stores/crewStores";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

import { MoreVertical } from "lucide-react";
import { Button } from "@/src/components/ui/button";

import ConfirmModal from "@/src/components/Modals/Confirmation";
import CreateModal from "@/src/components/Modals/CreateModal";
// import { Friends } from "../../../types/friends";
import { useFriendStore } from "../../stores/friendStore";
import { useQuery } from "@tanstack/react-query";

/* =======================
   Props (LEAN)
======================= */

interface CrewSidebarProps {
  crews: Crew[];
  loading: boolean;
  selectedCrew: Crew | null;
  onSelectCrew: (crew: Crew) => void;
  onCreateCrew: (name: string) => void;
  onDeleteCrew: (crewId: string) => void;
}

/* =======================
   Component
======================= */

export default function CrewSidebar({
  crews,
  loading,
  selectedCrew,
  onSelectCrew,
  onCreateCrew,
  onDeleteCrew,
}: CrewSidebarProps) {
  const { user, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex w-20 items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex w-20 flex-col items-center space-y-4 bg-gray-900 p-3 text-white">
      {/* Render Crews */}
      {crews.map((crew) => (
        <div
          key={crew.id}
          className={`relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-xl text-2xl font-bold transition-all duration-200 ${
            selectedCrew?.id === crew.id
              ? "rounded-2xl bg-blue-600"
              : "bg-gray-700 hover:rounded-2xl hover:bg-blue-600"
          }`}
          onClick={() => onSelectCrew(crew)}
          title={crew.name}
        >
          {crew.name.charAt(0).toUpperCase()}

          {/* Dropdown */}
          <div className="absolute top-1 right-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-full bg-gray-800 hover:bg-gray-700 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3 text-white" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Delete only if owner */}
                {user && crew.ownerId === user.id && (
                  <ConfirmModal
                    title="Delete Crew"
                    description={`Are you sure you want to delete "${crew.name}"? This cannot be undone.`}
                    confirmText="Delete"
                    // onConfirm={() => deleteCrew(crew.id)}
                    onConfirm={() => onDeleteCrew(crew.id)}
                  >
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                      Delete Crew
                    </DropdownMenuItem>
                  </ConfirmModal>
                )}

                <DropdownMenuItem>Open Crew</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}

      {/* Create Crew */}
      <CreateModal
        title="Create a New Crew"
        description="Enter a name for your new crew"
        placeholder="Crew name"
        confirmText="Create"
        onConfirm={async (name: string) => {
          // await createCrew(name);
          onCreateCrew(name);
        }}
      >
        <div className="mt-4 flex h-14 w-14 cursor-pointer items-center justify-center rounded-xl bg-gray-700 transition-all duration-200 hover:rounded-2xl hover:bg-green-600">
          <span className="text-3xl font-light">+</span>
        </div>
      </CreateModal>
      
    </div>
  );
}
