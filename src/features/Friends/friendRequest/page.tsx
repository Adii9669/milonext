"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProtectedRoute } from "@/src/hooks/useProtectedRoute";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import {
  friendApi,
  userApi,
} from "@/src/lib/api";
import { Button } from "@/src/shared/components/ui/button";

type FriendRequestDTO = {
  id: string;
  name?: string;
  username?: string;
  status: string;
  created_at?: string;
};

type SearchUserDTO = { id: string; username: string };

export default function FriendRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  useProtectedRoute("/connect");
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [processingRequest, setProcessingRequest] = useState<string>("");
  const [usernameSearch, setUsernameSearch] = useState("");

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["friendRequests", "incoming"],
    queryFn: async () => {
      const res = await friendApi.getFriendRequests("incoming");
      if (!res) return [] as FriendRequestDTO[];
      if (Array.isArray(res.send)) return res.send as FriendRequestDTO[];
      if (Array.isArray(res)) return res as FriendRequestDTO[];
      return [] as FriendRequestDTO[];
    },
    enabled: !!user,
  });

  const acceptMutation = useMutation({
    mutationFn: (friendID: string) => friendApi.acceptFriendRequest(friendID),
    onMutate: (friendID: string) => {
      setProcessingRequest(friendID);
      setStatusMessage("Accepting request...");
    },
    onSuccess: () => {
      setStatusMessage("Friend request accepted.");
      queryClient.invalidateQueries({ queryKey: ["friendRequests", "incoming"] });
      queryClient.invalidateQueries({ queryKey: ["friends", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (err: any) => {
      setStatusMessage(err?.message || "Failed to accept friend request.");
    },
    onSettled: () => {
      setProcessingRequest("");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (friendID: string) => friendApi.rejectFriendRequest(friendID),
    onMutate: (friendID: string) => {
      setProcessingRequest(friendID);
      setStatusMessage("Rejecting request...");
    },
    onSuccess: () => {
      setStatusMessage("Friend request rejected.");
      queryClient.invalidateQueries({ queryKey: ["friendRequests", "incoming"] });
      queryClient.invalidateQueries({ queryKey: ["friends", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (err: any) => {
      setStatusMessage(err?.message || "Failed to reject friend request.");
    },
    onSettled: () => {
      setProcessingRequest("");
    },
  });

  const requests = useMemo(() => (data ? data : []), [data]);

  const searchResults = useQuery({
    queryKey: ["userSearch", usernameSearch],
    queryFn: async () => {
      const response = await userApi.searchUsers(usernameSearch.trim());
      const rows = Array.isArray(response) ? response : response?.users ?? response?.data?.users ?? [];
      return (rows as Array<Record<string, unknown>>).map((row): SearchUserDTO => {
        const nestedUser = row.user as Record<string, unknown> | undefined;
        return {
          id: String(row.id ?? row.userID ?? row.userId ?? ""),
          username: String(row.username ?? row.name ?? row.Name ?? nestedUser?.username ?? nestedUser?.name ?? ""),
        };
      }).filter((row) => row.id && row.username);
    },
    enabled: !!user && usernameSearch.trim().length >= 2,
  });

  const friendList = useQuery({
    queryKey: ["friends", user?.id],
    queryFn: friendApi.getFriends,
    enabled: !!user,
  });
  const outgoingRequests = useQuery({
    queryKey: ["friendRequests", "outgoing"],
    queryFn: async () => {
      const response = await friendApi.getFriendRequests("outgoing");
      return (response?.send ?? response ?? []) as FriendRequestDTO[];
    },
    enabled: !!user,
  });

  const sendMutation = useMutation({
    mutationFn: (userID: string) => friendApi.sendFriendRequest(userID),
    onSuccess: () => {
      setStatusMessage("Friend request sent.");
      queryClient.invalidateQueries({ queryKey: ["friendRequests", "outgoing"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests", "incoming"] });
    },
    onError: (err: any) => setStatusMessage(err?.message || "Could not send friend request."),
  });
  const removeFriendMutation = useMutation({
    mutationFn: (friendID: string) => friendApi.removeFriend(friendID),
    onMutate: () => setStatusMessage("Removing friend…"),
    onSuccess: () => {
      setStatusMessage("Friend removed.");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests", "incoming"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests", "outgoing"] });
    },
    onError: (err: any) => setStatusMessage(err?.message || "Could not remove friend."),
  });

  if (authLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8">Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-3xl mx-auto rounded-xl border border-border bg-surface p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Connect</p>
            <h1 className="text-xl font-semibold text-text-primary">Friend Requests</h1>
            <p className="text-text-secondary text-sm">Accept or reject incoming friend requests.</p>
          </div>
          <Link href="/connect">
            <Button variant="secondary">Back to Chat</Button>
          </Link>
        </div>
        {statusMessage ? (
          <div className="mb-3 rounded-md border border-border bg-surface-elevated p-2 text-sm text-text-secondary">
            {statusMessage}
          </div>
        ) : null}
        <section className="mb-6 rounded-lg border border-border bg-surface-elevated/40 p-4">
          <h2 className="font-medium text-text-primary">Find people</h2>
          <p className="mb-3 text-sm text-text-secondary">Search by username to send a friend request.</p>
          <input
            value={usernameSearch}
            onChange={(event) => setUsernameSearch(event.target.value)}
            placeholder="Search username"
            aria-label="Search username"
            className="mb-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          {usernameSearch.trim().length > 0 && usernameSearch.trim().length < 2 && <p className="text-xs text-text-muted">Enter at least 2 characters.</p>}
          {searchResults.isFetching && <p role="status" className="text-sm text-text-muted">Searching…</p>}
          {searchResults.isError && <p role="alert" className="text-sm text-error">{String(searchResults.error)}</p>}
          <div className="space-y-2">
            {searchResults.data?.map((result) => {
              const isFriend = Array.isArray(friendList.data) && friendList.data.some((entry: FriendRequestDTO) => entry.id === result.id);
              const incoming = requests.find((entry) => entry.id === result.id);
              const outgoing = outgoingRequests.data?.find((entry) => entry.id === result.id);
              const busy = processingRequest === result.id;
              return (
              <div key={result.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-2">
                <span className="text-sm text-text-primary">@{result.username}</span>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {isFriend ? <Button variant="destructive" size="sm" onClick={() => removeFriendMutation.mutate(result.id)} disabled={removeFriendMutation.isPending}>
                    {removeFriendMutation.isPending ? "Removing…" : "Remove friend"}
                  </Button> : incoming ? <>
                    <span className="text-xs text-text-muted">Incoming request</span>
                    <Button size="sm" onClick={() => acceptMutation.mutate(result.id)} disabled={busy || acceptMutation.isPending}>Accept</Button>
                    <Button variant="destructive" size="sm" onClick={() => rejectMutation.mutate(result.id)} disabled={busy || rejectMutation.isPending}>Reject</Button>
                  </> : outgoing ? <Button size="sm" disabled>Request sent</Button> : <Button size="sm" onClick={() => sendMutation.mutate(result.id)} disabled={sendMutation.isPending}>
                    {sendMutation.isPending ? "Sending…" : "Add friend"}
                  </Button>}
                </div>
              </div>
              );
            })}
            {searchResults.data?.length === 0 && !searchResults.isFetching && usernameSearch.trim().length >= 2 && <p className="text-sm text-text-muted">No usernames found.</p>}
          </div>
        </section>
        {isError ? (
          <div className="rounded-md border border-error bg-error/10 p-3 text-sm text-error">
            Error loading requests: {String((error as Error)?.message ?? "Unknown error")}
          </div>
        ) : isLoading ? (
          <div className="p-4">Loading friend requests...</div>
        ) : requests.length === 0 ? (
          <div className="rounded-md border border-border bg-surface-elevated/50 p-4 text-text-secondary">
            No incoming friend requests yet.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id + request.name}
                className="rounded-lg border border-border bg-surface-elevated/50 p-3 md:p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium text-text-primary">@{request.username || request.name || "Unknown username"}</p>
                    <p className="text-xs text-text-muted">Status: {request.status || "pending"}</p>
                    {request.created_at ? (
                      <p className="text-xs text-text-muted">Requested At: {new Date(request.created_at).toLocaleString()}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptMutation.mutate(request.id)}
                      disabled={processingRequest === request.id}
                    >
                      {processingRequest === request.id && acceptMutation.isPending ? "Accepting..." : "Accept"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => rejectMutation.mutate(request.id)}
                      disabled={processingRequest === request.id}
                    >
                      {processingRequest === request.id && rejectMutation.isPending ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
