import { apiFetch } from "@/src/lib/api/apiClient";
import { CreatePlanInput, CreatePlanPollInput, Plan, PlanPoll, PlanParticipationSummary, PlanResponseStatus, PlanStatus, UpdatePlanInput } from "@/src/features/Chat/types/plans";

export const getChannelPlans = (channelId: string): Promise<Plan[]> =>
  apiFetch(`/api/chats/channel/${channelId}/plans`);

export const createChannelPlan = (channelId: string, input: CreatePlanInput): Promise<Plan> =>
  apiFetch(`/api/chats/channel/${channelId}/plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

export const getDMPlans = (userId: string): Promise<Plan[]> =>
  apiFetch(`/api/chats/dm/${userId}/plans`);

export const createDMPlan = (userId: string, input: CreatePlanInput): Promise<Plan> =>
  apiFetch(`/api/chats/dm/${userId}/plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

export const getPlanParticipants = (planId: string): Promise<PlanParticipationSummary> =>
  apiFetch(`/api/plans/${planId}/participants`);

export const setPlanResponse = (planId: string, response: PlanResponseStatus): Promise<PlanParticipationSummary> =>
  apiFetch(`/api/plans/${planId}/response`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response }),
  });

export const getPlan = (planId: string): Promise<Plan> =>
  apiFetch(`/api/plans/${planId}`);

export const updatePlan = (planId: string, input: UpdatePlanInput): Promise<Plan> =>
  apiFetch(`/api/plans/${planId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

export const updatePlanStatus = (planId: string, status: PlanStatus, expectedUpdatedAt: string): Promise<Plan> =>
  apiFetch(`/api/plans/${planId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, expectedUpdatedAt }),
  });

export const getPlanPoll = (planId: string): Promise<PlanPoll> =>
  apiFetch(`/api/plans/${planId}/poll`);

export const createPlanPoll = (planId: string, input: CreatePlanPollInput): Promise<PlanPoll> =>
  apiFetch(`/api/plans/${planId}/poll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

export const setPlanPollVotes = (planId: string, optionIds: string[]): Promise<PlanPoll> =>
  apiFetch(`/api/plans/${planId}/poll/votes`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionIds }),
  });

