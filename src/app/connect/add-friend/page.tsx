"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProtectedRoute } from "@/src/hooks/useProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";
import { getUsers, getFriends, getFriendRequests, sendFriendRequest } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";

type UserItem = {
  id: string;
  name: string;
  email: string;
};

type FriendRequestDTO = {
  id: string;
  name?: string;
  status?: string;
};

export default function AddFriendPage() {
  const { user, loading: authLoading } = useAuth();
  useProtectedRoute("/connect");
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string>("");
  const [sendingTo, setSendingTo] = useState<string>("");

  const { data: userList, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await getUsers();
      return (res.users || []) as UserItem[];
    },
    enabled: !!user,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["friends", user?.id],
    queryFn: getFriends,
    enabled: !!user,
  });

  const { data: outgoingRequests = [] } = useQuery({
    queryKey: ["friendRequests", "outgoing"],
    queryFn: async () => {
      const res = await getFriendRequests("outgoing");
      if (!res) return [] as FriendRequestDTO[];
      if (Array.isArray(res.send)) return res.send as FriendRequestDTO[];
      if (Array.isArray(res)) return res as FriendRequestDTO[];
      return [] as FriendRequestDTO[];
    },
    enabled: !!user,
  });

  const sendRequestMutation = useMutation({
    mutationFn: (userID: string) => sendFriendRequest(userID),
    onMutate: (userID: string) => {
      setSendingTo(userID);
    },
    onSuccess: () => {
      setMessage("Friend request sent.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["friends", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests", "outgoing"] });
    },
    onError: (err: any) => {
      setMessage(err?.message || "Failed to send request.");
    },
    onSettled: () => {
      setSendingTo("");
    },
  });

  if (authLoading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Unauthorized</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto rounded-xl border border-slate-800 bg-slate-900 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Connect</p>
            <h1 className="text-xl font-semibold">Add Friend</h1>
            <p className="text-slate-300 text-sm">Send requests to registered users.</p>
          </div>
          <Link href="/connect">
            <Button variant="secondary">Back to Chat</Button>
          </Link>
        </div>

        {message ? (
          <div className="mb-3 rounded-md border border-slate-600 bg-slate-800 p-2 text-sm text-slate-200">
            {message}
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-md border border-red-500 bg-red-950/20 p-3 text-sm text-red-200">
            Error loading users: {String((error as Error)?.message ?? "Unknown error")}
          </div>
        ) : isLoading ? (
          <div className="p-4">Loading users...</div>
        ) : (
          <div className="space-y-2">
            {(userList ?? [])
              .filter((u) => u.id !== user.id)
              .filter((u) => !friends.some((f: any) => f.id === u.id))
              .map((u) => {
                const outgoing = outgoingRequests.find((req: FriendRequestDTO) => req.id === u.id);
                const pending = outgoing?.status === "pending" || outgoing?.status === undefined;

                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-slate-700 bg-slate-800/60 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-100">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                    {pending ? (
                      <Button size="sm" variant="secondary" disabled>
                        Pending
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={sendingTo === u.id}
                        onClick={() => sendRequestMutation.mutate(u.id)}
                      >
                        Send Request
                      </Button>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
