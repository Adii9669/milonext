"use client";

import { Button } from "@/src/shared/components/ui/button";
import CreateModal from "@/src/shared/components/Modals/CreateModal";
import { useCrewStore } from "@/src/app/stores/crewStores";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

export default function EmptyState() {
  const { createCrew } = useCrewStore();
  const { logout: Logout } = useAuth();

  return (
    <div className="flex h-full w-full items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center space-y-6 text-center max-w-md">
        <h1 className="text-2xl font-bold">Welcome to MiloChat 🚀</h1>
        <p className="text-text-secondary">
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
          <Button className="font-light">create Crew</Button>
        </CreateModal>
        <div>
          <Button className="bg-primary text-primary-foreground">Add Friend</Button>
        </div>
      </div>
    </div>
  );
}
