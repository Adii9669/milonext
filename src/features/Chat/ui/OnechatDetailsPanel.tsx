"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Phone,
  MoreVertical,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Link2,
  Download,
  ExternalLink,
  UserPlus,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import { Channel } from "@/src/types/channel";
import { Friends } from "@/src/types/friends";
import { Plan } from "@/src/features/Chat/types/plans";
import { Message } from "@/src/features/Chat/types/messages";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { channelApi, friendApi, userApi } from "@/src/lib/api";
import { PlanDetailsDialog } from "./PlanDetailsDialog";

export type RightPanelTab = "about" | "plans" | "files" | "links" | "media";

interface Member {
  id?: string;
  userID?: string;
  name?: string;
  username?: string;
  status?: string;
  role?: string;
  user?: { id?: string; name?: string; username?: string; status?: string };
}

interface OnechatDetailsPanelProps {
  channel: Channel | null;
  friend: Friends | null;
  members?: Member[];
  plans?: Plan[];
  messages?: Message[];
  currentUserID?: string;
  isOpen: boolean;
  onClose: () => void;
  onFriendRemoved?: () => void;
  onPlanChanged?: (plan: Plan) => void;
  refreshToken?: number;
}

export function OnechatDetailsPanel({
  channel,
  friend,
  members = [],
  plans = [],
  messages = [],
  currentUserID,
  isOpen,
  onClose,
  onFriendRemoved,
  onPlanChanged,
  refreshToken = 0,
}: OnechatDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<RightPanelTab>("about");
  const [usernameSearch, setUsernameSearch] = useState("");
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<Plan | null>(null);

  const queryClient = useQueryClient();
  const canManageMembers = channel?.role === "owner" || channel?.role === "admin";
  const memberIDs = new Set(
    members.map((m) => m.userID || m.id || m.user?.id)
  );

  // Search users to add to channel
  const searchQuery = useQuery({
    queryKey: ["userSearch", usernameSearch],
    queryFn: async () => {
      const response = await userApi.searchUsers(usernameSearch.trim());
      return (response?.users ?? []) as Array<{ id: string; username: string }>;
    },
    enabled: Boolean(canManageMembers && usernameSearch.trim().length >= 2),
  });

  const addableUsers =
    searchQuery.data?.filter((res) => !memberIDs.has(res.id)) ?? [];

  const addMemberMutation = useMutation({
    mutationFn: (userID: string) => channelApi.addChannelMember(channel!.id, userID),
    onSuccess: () => {
      setUsernameSearch("");
      queryClient.invalidateQueries({ queryKey: ["channelMembers", channel?.id] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userID: string) => channelApi.removeChannelMember(channel!.id, userID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channelMembers", channel?.id] });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: (friendID: string) => friendApi.removeFriend(friendID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      onFriendRemoved?.();
    },
  });

  // Extract shared files from messages
  const sharedFiles = useMemo(() => {
    return messages.filter((m) => m.fileUrl && !isInlineImage(m.mimeType));
  }, [messages]);

  // Extract shared media from messages
  const sharedMedia = useMemo(() => {
    return messages.filter((m) => m.fileUrl && isInlineImage(m.mimeType));
  }, [messages]);

  // Extract shared links from messages
  const sharedLinks = useMemo(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const links: Array<{ url: string; time: string; sender: string }> = [];
    messages.forEach((m) => {
      if (m.content) {
        const matches = m.content.match(urlRegex);
        if (matches) {
          matches.forEach((url) => {
            links.push({
              url,
              time: m.createdAt,
              sender: m.sender?.name || (m.isMine ? "You" : "Contact"),
            });
          });
        }
      }
    });
    return links;
  }, [messages]);

  const displayName = channel ? channel.name : friend ? friend.name : "Conversation Details";
  const displayHandle = channel
    ? `${members.length || 1} members`
    : friend?.name
    ? `@${friend.name.toLowerCase().replace(/\s+/g, "")}`
    : "";
  const displayInitials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const tabs: Array<{ id: RightPanelTab; label: string }> = [
    { id: "about", label: "About" },
    { id: "plans", label: "Plans" },
    { id: "files", label: "Files" },
    { id: "links", label: "Links" },
    { id: "media", label: "Media" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="oc-right-sidebar"
          aria-label="Contact or channel context"
        >
          {/* ── Topbar Actions (Video, Phone, Options, Close) ───────── */}
          <div className="oc-right-topbar">
            <button
              type="button"
              className="oc-btn-icon"
              title="Video call"
              aria-label="Video call"
              onClick={() => alert("Video calls are scheduled for the next release.")}
            >
              <Video size={16} />
            </button>
            <button
              type="button"
              className="oc-btn-icon"
              title="Voice call"
              aria-label="Voice call"
              onClick={() => alert("Voice calls are scheduled for the next release.")}
            >
              <Phone size={16} />
            </button>
            <button
              type="button"
              className="oc-btn-icon"
              title="More options"
              aria-label="More options"
            >
              <MoreVertical size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="oc-btn-icon"
              title="Close panel"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Profile Cover Area & Overlapping Avatar ─────────────── */}
          <div className="oc-profile-cover-wrap">
            <div className="oc-profile-cover" />
            <div className="oc-profile-avatar-overlap">
              {displayInitials}
              <span
                className="oc-online-badge"
                style={{ width: "12px", height: "12px", right: "2px", bottom: "2px" }}
              />
            </div>
          </div>

          <div className="oc-profile-info">
            <h2 className="oc-profile-name-lg">{displayName}</h2>
            <div className="oc-profile-handle-lg">{displayHandle}</div>
            <p className="oc-profile-status-sub">
              {channel
                ? "Channel frequency"
                : friend?.status === "accepted"
                ? "Connected Friend"
                : "Onechat Member"}
            </p>
          </div>

          {/* ── 5 Tabs Bar ─────────────────────────────────────────── */}
          <div className="oc-tabs-bar" role="tablist">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`oc-tab-btn ${isActive ? "active" : ""}`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="oc-tab-underline"
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Tab Content Container ──────────────────────────────── */}
          <div className="oc-right-content oc-scroll">
            {/* TAB: ABOUT */}
            {activeTab === "about" && (
              <div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed mb-4">
                  {channel
                    ? "Active channel for team messaging, discussions, and shared plans."
                    : `Direct communication channel with ${friend?.name || "this user"}.`}
                </p>

                {/* Conversation Summary Cards */}
                <div className="oc-card-section">
                  <div className="oc-card-section-title">
                    <span>Overview</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#17171b] border border-[#25252b]">
                      <span className="text-[#71717a] block text-[11px]">Plans</span>
                      <span className="text-sm font-semibold text-[#f4f4f5]">{plans.length}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#17171b] border border-[#25252b]">
                      <span className="text-[#71717a] block text-[11px]">Files</span>
                      <span className="text-sm font-semibold text-[#f4f4f5]">{sharedFiles.length}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#17171b] border border-[#25252b]">
                      <span className="text-[#71717a] block text-[11px]">Links</span>
                      <span className="text-sm font-semibold text-[#f4f4f5]">{sharedLinks.length}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#17171b] border border-[#25252b]">
                      <span className="text-[#71717a] block text-[11px]">{channel ? "Members" : "Status"}</span>
                      <span className="text-sm font-semibold text-[#f4f4f5] truncate">
                        {channel ? members.length || 1 : friend?.status === "accepted" ? "Active" : friend?.status || "Connected"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Upcoming Plans Section */}
                <div className="oc-card-section">
                  <div className="oc-card-section-title">
                    <span>Upcoming Plans</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("plans")}
                      className="oc-card-section-link"
                    >
                      View all
                    </button>
                  </div>

                  {plans.length === 0 ? (
                    <p className="text-xs text-[#71717a] py-2">
                      No upcoming plans in this conversation.
                    </p>
                  ) : (
                    plans.slice(0, 3).map((p) => {
                      const d = new Date(p.startAt);
                      const dateStr = d.toLocaleDateString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                      const timeStr = d.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      });
                      return (
                        <div key={p.id} className="oc-sidebar-plan-card">
                          <div className="flex items-start gap-2.5">
                            <div className="oc-plan-icon-box">
                              <Calendar size={15} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-semibold text-[#f4f4f5] truncate">
                                {p.title}
                              </h4>
                              <p className="text-[11px] text-[#71717a] mt-0.5">
                                {dateStr} • {timeStr}
                              </p>
                              {p.location && (
                                <p className="text-[11px] text-[#a1a1aa] flex items-center gap-1 mt-1 truncate">
                                  <MapPin size={11} className="text-[#3b82f6]" />
                                  <span>{p.location}</span>
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedPlanForModal(p)}
                              className="text-[#71717a] hover:text-[#f4f4f5]"
                              title="Plan actions"
                            >
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Shared Files Section */}
                <div className="oc-card-section">
                  <div className="oc-card-section-title">
                    <span>Shared Files</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("files")}
                      className="oc-card-section-link"
                    >
                      View all
                    </button>
                  </div>

                  {sharedFiles.length === 0 ? (
                    <p className="text-xs text-[#71717a] py-2">
                      No files shared in this conversation yet.
                    </p>
                  ) : (
                    sharedFiles.slice(0, 3).map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-[#17171b] border border-[#25252b] mb-2"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#14243a] text-[#3b82f6] flex items-center justify-center shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0 flex-1 text-xs">
                          <span className="block truncate font-semibold text-[#f4f4f5]">
                            {f.fileName || "File"}
                          </span>
                          <span className="text-[10px] text-[#71717a]">
                            {formatFileSize(f.fileSize)}
                          </span>
                        </div>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}${f.fileUrl}`}
                          download
                          className="p-1 text-[#3b82f6] hover:opacity-80"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: PLANS */}
            {activeTab === "plans" && (
              <div>
                <div className="oc-card-section-title">
                  <span>All Conversation Plans</span>
                </div>

                {plans.length === 0 ? (
                  <p className="text-xs text-[#71717a] py-4 text-center">
                    No upcoming plans in this conversation.
                  </p>
                ) : (
                  plans.map((p) => {
                    const d = new Date(p.startAt);
                    const dateStr = d.toLocaleDateString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                    const timeStr = d.toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    });
                    return (
                      <div key={p.id} className="oc-sidebar-plan-card">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-xs font-semibold text-[#f4f4f5] truncate">
                            {p.title}
                          </h4>
                          <span className="text-[9px] font-bold uppercase text-[#3b82f6]">
                            {p.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#a1a1aa] mt-1">
                          <Clock size={12} className="text-[#3b82f6]" />
                          <span>
                            {dateStr} • {timeStr}
                          </span>
                        </div>
                        {p.location && (
                          <div className="flex items-center gap-1.5 text-xs text-[#a1a1aa] mt-1">
                            <MapPin size={12} className="text-[#3b82f6]" />
                            <span className="truncate">{p.location}</span>
                          </div>
                        )}
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedPlanForModal(p)}
                            className="text-xs font-semibold text-[#3b82f6] hover:underline inline-flex items-center gap-1"
                          >
                            <Eye size={12} />
                            <span>View Plan Details</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB: FILES */}
            {activeTab === "files" && (
              <div>
                <div className="oc-card-section-title">
                  <span>Shared Files</span>
                </div>

                {sharedFiles.length === 0 ? (
                  <p className="text-xs text-[#71717a] py-4 text-center">
                    No shared files in this conversation.
                  </p>
                ) : (
                  sharedFiles.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#17171b] border border-[#25252b] mb-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText size={18} className="text-[#3b82f6] shrink-0" />
                        <div className="min-w-0">
                          <span className="block truncate text-xs font-medium text-[#f4f4f5]">
                            {m.fileName || "File"}
                          </span>
                          <span className="text-[10px] text-[#71717a]">
                            {formatFileSize(m.fileSize)}
                          </span>
                        </div>
                      </div>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}${m.fileUrl}`}
                        download
                        className="p-1.5 text-[#3b82f6] hover:opacity-80 shrink-0"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: LINKS */}
            {activeTab === "links" && (
              <div>
                <div className="oc-card-section-title">
                  <span>Shared Links</span>
                </div>

                {sharedLinks.length === 0 ? (
                  <p className="text-xs text-[#71717a] py-4 text-center">
                    No links shared in this conversation.
                  </p>
                ) : (
                  sharedLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#17171b] border border-[#25252b] hover:border-[#3b82f6] transition-colors mb-2 group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Link2 size={16} className="text-[#3b82f6] shrink-0" />
                        <span className="truncate text-xs text-[#f4f4f5] group-hover:text-[#3b82f6]">
                          {link.url}
                        </span>
                      </div>
                      <ExternalLink size={13} className="text-[#71717a] shrink-0" />
                    </a>
                  ))
                )}
              </div>
            )}

            {/* TAB: MEDIA */}
            {activeTab === "media" && (
              <div>
                <div className="oc-card-section-title">
                  <span>Shared Media</span>
                </div>

                {sharedMedia.length === 0 ? (
                  <p className="text-xs text-[#71717a] py-4 text-center">
                    No shared media in this conversation.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {sharedMedia.map((m) => (
                      <a
                        key={m.id}
                        href={`${process.env.NEXT_PUBLIC_API_URL}${m.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-lg overflow-hidden border border-[#25252b] hover:border-[#3b82f6] transition-colors bg-[#17171b]"
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${m.filePreviewUrl || m.fileUrl}`}
                          alt={m.fileName || "Media"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal for viewing plan details from the right panel */}
          {selectedPlanForModal && (
            <PlanDetailsDialog
              plan={selectedPlanForModal}
              currentUserId={currentUserID}
              onPlanChanged={(updated) => {
                onPlanChanged?.(updated);
                setSelectedPlanForModal(null);
              }}
              refreshToken={refreshToken}
            />
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function isInlineImage(mimeType?: string): boolean {
  return [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
    "image/bmp",
  ].includes((mimeType || "").toLowerCase());
}

function formatFileSize(size?: number): string {
  if (typeof size !== "number") return "File";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
