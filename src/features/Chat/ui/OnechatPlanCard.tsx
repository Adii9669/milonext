"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Trash2,
} from "lucide-react";
import { Plan } from "@/src/features/Chat/types/plans";
import { PlanDetailsDialog } from "./PlanDetailsDialog";
import { PlanDeleteDialog } from "./PlanDeleteDialog";
import { PlanParticipationPanel } from "./PlanParticipationPanel";

interface OnechatPlanCardProps {
  plan: Plan;
  currentUserId?: string;
  onPlanChanged?: (plan: Plan) => void;
  onPlanDeleted?: (planId: string) => void;
  refreshToken?: number;
}

export function OnechatPlanCard({
  plan,
  currentUserId,
  onPlanChanged,
  onPlanDeleted,
  refreshToken = 0,
}: OnechatPlanCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isCreator = Boolean(currentUserId && currentUserId === plan.creatorId);

  const startDate = new Date(plan.startAt);
  const formattedDate = startDate.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedStartTime = startDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const formattedEndTime = plan.endAt
    ? new Date(plan.endAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const isMeetingLink =
    plan.location?.toLowerCase().includes("meet") ||
    plan.location?.toLowerCase().includes("zoom") ||
    plan.location?.toLowerCase().includes("http");

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="oc-plan-timeline-card"
    >
      {/* ── Top Row: Plan header with Title and Actions ──────────────── */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="oc-plan-type-pill shrink-0">
            <CalendarDays size={13} />
            <span>Plan</span>
          </div>
          <span className="text-[#52525B] text-xs select-none shrink-0">•</span>
          <h3 className="oc-plan-title-text truncate mb-0 font-semibold text-sm text-[#F4F4F5]">
            {plan.title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isCreator && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex size-7 items-center justify-center rounded-md border border-[#3f252b] text-red-400 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label={`Delete plan: ${plan.title}`}
              title="Delete plan"
            >
              <Trash2 size={13} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="oc-plan-btn-view"
          >
            View plan
          </button>
        </div>
      </div>

      {plan.description && (
        <p className="oc-plan-desc-text text-xs text-[#A1A1AA] mb-2.5 leading-relaxed">
          {plan.description}
        </p>
      )}

      {/* ── Meta Pills (Date, Time, Location/Link) ──────────────── */}
      <div className="oc-plan-meta-pills">
        <div className="oc-plan-pill">
          <CalendarDays size={14} />
          <span>{formattedDate}</span>
        </div>

        <div className="oc-plan-pill">
          <Clock size={14} />
          <span>
            {formattedStartTime}
            {formattedEndTime ? ` – ${formattedEndTime}` : ""}
          </span>
        </div>

        {plan.location && (
          <div className="oc-plan-pill">
            {isMeetingLink ? <Video size={14} /> : <MapPin size={14} />}
            <span className="truncate max-w-[160px]">{plan.location}</span>
          </div>
        )}
      </div>

      {/* ── Embedded Participation RSVP Buttons & Avatars ──────── */}
      <PlanParticipationPanel
        planId={plan.id}
        currentUserId={currentUserId}
        responseAllowed={plan.status === "open" || plan.status === "confirmed"}
        refreshToken={refreshToken}
      />

      {/* ── Full Details Dialog Modal ──────────────────────────── */}
      {detailOpen && (
        <PlanDetailsDialog
          plan={plan}
          currentUserId={currentUserId}
          onPlanChanged={(updated) => {
            onPlanChanged?.(updated);
          }}
          onPlanDeleted={onPlanDeleted}
          onClose={() => setDetailOpen(false)}
          refreshToken={refreshToken}
        />
      )}
      {isCreator && (
        <PlanDeleteDialog
          plan={plan}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onDeleted={(planId) => {
            setDetailOpen(false);
            onPlanDeleted?.(planId);
          }}
        />
      )}
    </motion.article>
  );
}
