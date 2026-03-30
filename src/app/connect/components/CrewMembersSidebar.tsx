"use client";

import { Button } from "@/src/components/ui/button";
import { Friends } from "@/src/types";

type CrewMember = { userID: string; role: string };
type UserItem = { id: string; name: string; email: string };

interface CrewMembersSidebarProps {
  crewName: string;
  selectedCrewId: string | null;
  members: CrewMember[];
  users: UserItem[];
  loading: boolean;
  show: boolean;
  onHide: () => void;
  onAddMember: (userId: string) => void;
  onUpdateRole: (userId: string, role: string) => void;
  onRemoveMember: (userId: string) => void;
  addDisabled: boolean;
  currentUserId?: string;
  pendingNewMemberId: string;
  onNewMemberChange: (id: string) => void;
}

export default function CrewMembersSidebar({
  crewName,
  selectedCrewId,
  members,
  users,
  loading,
  show,
  onHide,
  onAddMember,
  onUpdateRole,
  onRemoveMember,
  addDisabled,
  currentUserId,
  pendingNewMemberId,
  onNewMemberChange,
}: CrewMembersSidebarProps) {
  if (!show) return null;

  return (
    <div className="w-80 border-l border-slate-800 bg-slate-900 p-3 text-white overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-300">Crew Members</h2>
        <Button size="sm" variant="secondary" onClick={onHide}>
          Close
        </Button>
      </div>

      {!selectedCrewId ? (
        <div className="text-xs text-slate-400">Select a crew to manage members.</div>
      ) : loading ? (
        <div className="text-xs text-slate-400">Loading members...</div>
      ) : (
        <>
          <div className="mb-2 text-xs text-slate-300">Crew: {crewName}</div>
          <div className="mb-2 flex gap-2">
            <select
              className="flex-1 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm"
              value={pendingNewMemberId}
              onChange={(e) => onNewMemberChange(e.target.value)}
            >
              <option value="">Add member...</option>
              {users
                .filter((u) => u.id !== currentUserId)
                .filter((u) => !members.some((m) => m.userID === u.id))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
            <Button size="sm" disabled={addDisabled || !pendingNewMemberId} onClick={() => onAddMember(pendingNewMemberId)}>
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {members.map((member) => {
              const user = users.find((u) => u.id === member.userID);
              const isCurrentUser = member.userID === currentUserId;

              return (
                <div key={member.userID} className="rounded-md border border-slate-700 bg-slate-800/60 p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{user?.name ?? member.userID}</div>
                      <div className="text-[11px] text-slate-400">{member.role}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <select
                        className="rounded border border-slate-600 bg-slate-900 px-1 text-xs"
                        value={member.role}
                        onChange={(e) => onUpdateRole(member.userID, e.target.value)}
                      >
                        <option value="member">member</option>
                        <option value="admin">admin</option>
                        <option value="owner">owner</option>
                      </select>
                      {!isCurrentUser && (
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => onRemoveMember(member.userID)}
                          title="Remove member"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
