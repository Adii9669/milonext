"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Check,
  Eye,
} from "lucide-react";
import { Plan } from "@/src/features/Chat/types/plans";
import { PlanDetailsDialog } from "./PlanDetailsDialog";
import { PlanParticipationPanel } from "./PlanParticipationPanel";

interface OnechatPlanCardProps {
  plan: Plan;
  currentUserId?: string;
  onPlanChanged?: (plan: Plan) => void;
  refreshToken?: number;
}

export function OnechatPlanCard({
  plan,
  currentUserId,
  onPlanChanged,
  refreshToken = 0,
}: OnechatPlanCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);

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
      {/* ── Top Row: Tag & View Plan Button ─────────────────────── */}
      <div className="oc-plan-top-row">
        <div className="oc-plan-type-pill">
          <CalendarDays size={15} />
          <span>Plan</span>
        </div>
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="oc-plan-btn-view"
        >
          View Plan
        </button>
      </div>

      {/* ── Title & Description ─────────────────────────────────── */}
      <h3 className="oc-plan-title-text">{plan.title}</h3>
      {plan.description && (
        <p className="oc-plan-desc-text">{plan.description}</p>
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
          refreshToken={refreshToken}
        />
      )}
    </motion.article>
  );
}
