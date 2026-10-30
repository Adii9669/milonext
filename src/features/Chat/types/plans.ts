export interface Plan {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  creatorName?: string;
  channelId?: string;
  dmUserLowId?: string;
  dmUserHighId?: string;
  startAt: string;
  endAt?: string;
  location?: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}

export type PlanStatus = "open" | "confirmed" | "completed" | "cancelled";

export interface CreatePlanInput {
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  location?: string;
}

export interface UpdatePlanInput extends CreatePlanInput {
  expectedUpdatedAt: string;
}

export type PlanResponseStatus = "in" | "maybe" | "cant_make_it";

export interface PlanParticipant {
  userId: string;
  name: string;
  image?: string;
  response: PlanResponseStatus | null;
  respondedAt?: string;
}

export interface PlanParticipationSummary {
  planId: string;
  inCount: number;
  maybeCount: number;
  cantMakeItCount: number;
  pendingResponseCount: number;
  participants: PlanParticipant[];
}

export interface PlanPollOption {
  id: string;
  text: string;
  voteCount: number;
  selectedByMe: boolean;
}

export interface PlanPoll {
  id: string;
  planId: string;
  question: string;
  options: PlanPollOption[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanPollInput {
  question: string;
  options: string[];
}
