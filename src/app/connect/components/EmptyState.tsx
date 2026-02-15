"use client";

import { Button } from "@/components/ui/button";
import CreateModal from "@/src/components/Modals/CreateModal";
import { useCrewStore } from "@/src/app/stores/crewStores";
import { useAuth } from "@/src/context/AuthContext";

export default function EmptyState() {
  const { createCrew } = useCrewStore();
  const { logout: Logout } = useAuth();

  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white">
      <div className="flex flex-col items-center space-y-6 text-center max-w-md">
        <h1 className="text-2xl font-bold">Welcome to MiloChat 🚀</h1>
        <p className="text-gray-400">
          You don’t have any crews or friends yet. Start by creating a crew or
          adding friends.
        </p>
        <CreateModal
          title="Create a Crew"
          description="Enter a name for your new crew"
          placeholder="Crew name"
          confirmText="Create"
          onConfirm={async (name: string) => {
            await createCrew(name);
          }}
        >
          <Button className="font-bold font-light">create Crew</Button>
        </CreateModal>
        <div>
          <Button className="bg-blue-800">Add Friend</Button>
        </div>
      </div>
    </div>
  );
}
