"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProtectedRoute } from "@/src/hooks/useProtectedRoute";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import {
  friendApi,
} from "@/src/lib/api";
import { Button } from "@/src/shared/components/ui/button";

type FriendRequestDTO = {
  id: string;
  name: string;
  status: string;
  created_at?: string;
};

export default function FriendRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  useProtectedRoute("/connect");
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [processingRequest, setProcessingRequest] = useState<string>("");

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
                    <p className="font-medium text-text-primary">{request.name || "Unknown User"}</p>
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
