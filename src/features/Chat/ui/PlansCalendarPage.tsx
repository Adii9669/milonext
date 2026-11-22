"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { getMyPlans } from "@/src/features/Chat/api/planApi";
import { Plan, PlanStatus } from "@/src/features/Chat/types/plans";
import { Friends } from "@/src/types/friends";
import { Channel } from "@/src/types/channel";
import { PlanDetailsDialog } from "./PlanDetailsDialog";
import { PlanDeleteDialog } from "./PlanDeleteDialog";
import {
  getMonthGridDates,
  groupPlansByLocalDate,
  localDateKey,
} from "./plansCalendar";

export const myPlansQueryKey = (userId: string) => ["my-created-plans", userId] as const;

interface Props {
  userId: string;
  friends: Friends[];
  channels: Channel[];
  refreshToken?: number;
  onBack?: () => void;
}

type PlanStatusFilter = "all" | PlanStatus;

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function statusClasses(status: PlanStatus): string {
  switch (status) {
    case "confirmed":
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    case "completed":
      return "bg-zinc-500/10 text-zinc-300 border-zinc-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-300 border-red-500/20";
    default:
      return "bg-blue-500/10 text-blue-300 border-blue-500/20";
  }
}

function conversationLabel(plan: Plan, userId: string, friends: Friends[], channels: Channel[]): string {
  if (plan.channelId) {
    const channel = channels.find((item) => item.id === plan.channelId);
    return channel ? `# ${channel.name}` : "Channel conversation";
  }
  const otherUserId = plan.dmUserLowId === userId ? plan.dmUserHighId : plan.dmUserLowId;
  const friend = friends.find((item) => item.id === otherUserId);
  return friend ? `Chat with ${friend.name}` : "Direct message";
}

export function PlansCalendarPage({ userId, friends, channels, refreshToken = 0, onBack }: Props) {
  const queryClient = useQueryClient();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()));
  const [statusFilter, setStatusFilter] = useState<PlanStatusFilter>("all");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const previousRefreshToken = useRef(refreshToken);

  const queryKey = myPlansQueryKey(userId);
  const plansQuery = useQuery({
    queryKey,
    queryFn: () => getMyPlans(),
  });

  useEffect(() => {
    if (previousRefreshToken.current !== refreshToken) {
      previousRefreshToken.current = refreshToken;
      void queryClient.invalidateQueries({ queryKey: myPlansQueryKey(userId) });
    }
  }, [refreshToken, queryClient, userId]);

  const plans = plansQuery.data ?? [];
  const filteredPlans = useMemo(
    () => plans.filter((plan) => statusFilter === "all" || plan.status === statusFilter),
    [plans, statusFilter],
  );
  const plansByDate = useMemo(() => groupPlansByLocalDate(filteredPlans), [filteredPlans]);
  const gridDates = useMemo(() => getMonthGridDates(visibleMonth), [visibleMonth]);
  const selectedPlans = plansByDate.get(selectedDate) ?? [];
  const monthTitle = visibleMonth.toLocaleDateString([], { month: "long", year: "numeric" });
  const todayKey = localDateKey(new Date());

  function setPlanInCache(updated: Plan) {
    queryClient.setQueryData<Plan[]>(queryKey, (current) =>
      current?.map((plan) => plan.id === updated.id ? updated : plan),
    );
    setSelectedPlan(updated);
  }

  function removePlanFromCache(planId: string) {
    queryClient.setQueryData<Plan[]>(queryKey, (current) =>
      current?.filter((plan) => plan.id !== planId) ?? [],
    );
    setSelectedPlan((current) => current?.id === planId ? null : current);
    setPlanToDelete((current) => current?.id === planId ? null : current);
  }

  function changeMonth(offset: number) {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    setVisibleMonth(nextMonth);
    setSelectedDate(localDateKey(nextMonth));
  }

  function showToday() {
    const today = new Date();
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(localDateKey(today));
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-y-auto bg-[#09090b] text-[#f4f4f5] xl:overflow-hidden">
      <header className="flex shrink-0 flex-col gap-4 border-b border-[#25252b] px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-white md:hidden"
          >
            <ArrowLeft size={14} />
            Back to conversations
          </button>
          <div className="mb-1 flex items-center gap-2 text-blue-400">
            <CalendarDays size={18} aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">Onechat plans</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Your plan calendar</h1>
          <p className="mt-1 text-sm text-[#a1a1aa]">All the plans you created, organized by date.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#a1a1aa]">
          <span>Show</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as PlanStatusFilter)}
            className="h-10 rounded-lg border border-[#3f3f46] bg-[#17171b] px-3 text-sm text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter plans by status"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </header>

      <div className="grid min-h-0 flex-1 gap-5 p-4 sm:p-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.8fr)] xl:overflow-hidden">
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[#25252b] bg-[#101012]" aria-label="Monthly plan calendar">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#25252b] px-4 py-4 sm:px-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-[#2e2e35] text-[#a1a1aa] hover:bg-[#202026] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Previous month"
              >
                <ChevronLeft size={17} />
              </button>
              <h2 className="min-w-36 text-center text-base font-semibold">{monthTitle}</h2>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-[#2e2e35] text-[#a1a1aa] hover:bg-[#202026] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Next month"
              >
                <ChevronRight size={17} />
              </button>
              <button
                type="button"
                onClick={showToday}
                className="ml-1 rounded-lg border border-[#2e2e35] px-3 py-2 text-xs font-medium text-[#d4d4d8] hover:bg-[#202026]"
              >
                Today
              </button>
            </div>
            <p className="text-xs text-[#71717a]">{filteredPlans.length} {filteredPlans.length === 1 ? "plan" : "plans"}</p>
          </div>

          {plansQuery.isPending ? (
            <div className="grid min-h-80 place-items-center p-8 text-sm text-[#a1a1aa]" role="status">Loading your plans…</div>
          ) : plansQuery.isError ? (
            <div className="grid min-h-80 place-items-center p-8 text-center">
              <div>
                <p className="font-medium text-red-300">Couldn’t load your plans.</p>
                <p className="mt-1 text-sm text-[#a1a1aa]">{plansQuery.error instanceof Error ? plansQuery.error.message : "Please try again."}</p>
                <button type="button" onClick={() => void plansQuery.refetch()} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500">Try again</button>
              </div>
            </div>
          ) : plans.length === 0 ? (
            <div className="grid min-h-80 place-items-center p-8 text-center">
              <div className="max-w-sm">
                <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-400"><CalendarDays size={22} /></div>
                <h3 className="font-semibold">Your calendar is ready</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#a1a1aa]">Plans you create in a conversation will appear here, organized by date.</p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#71717a]"><Plus size={13} />Create a plan from any chat to get started.</p>
              </div>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="grid min-h-80 place-items-center p-8 text-center text-sm text-[#a1a1aa]">No plans match this status filter.</div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-x-auto">
              <div className="flex min-h-0 min-w-[700px] flex-1 flex-col">
                <div className="grid shrink-0 grid-cols-7 border-b border-[#25252b]">
                  {weekDays.map((day) => <div key={day} className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-[#71717a]">{day}</div>)}
                </div>
                <div
                  className="grid min-h-0 flex-1 grid-cols-7"
                  style={{ gridTemplateRows: `repeat(${gridDates.length / 7}, minmax(0, 1fr))` }}
                >
                  {gridDates.map((date) => {
                    const key = localDateKey(date);
                    const datePlans = plansByDate.get(key) ?? [];
                    const visiblePlans = datePlans.slice(0, gridDates.length > 35 ? 1 : 2);
                    const inMonth = date.getMonth() === visibleMonth.getMonth();
                    const isSelected = selectedDate === key;
                    return (
                      <div
                        key={key}
                        className={`min-h-0 overflow-hidden border-b border-r border-[#25252b] p-1 sm:p-1.5 ${
                          inMonth ? "bg-[#101012]" : "bg-[#0d0d0f]"
                        } ${isSelected ? "ring-1 ring-inset ring-blue-500/70" : ""}`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedDate(key)}
                          aria-label={`${date.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}${datePlans.length ? `, ${datePlans.length} plans` : ""}`}
                          aria-pressed={isSelected}
                          className={`mb-0.5 grid size-6 place-items-center rounded-full text-[11px] ${
                            key === todayKey
                              ? "bg-blue-600 font-semibold text-white"
                              : isSelected
                                ? "bg-blue-500/15 font-semibold text-blue-300"
                                : inMonth ? "text-[#d4d4d8] hover:bg-[#25252b]" : "text-[#52525b] hover:bg-[#1b1b20]"
                          }`}
                        >
                          {date.getDate()}
                        </button>
                        <div className="grid gap-1">
                          {visiblePlans.map((plan) => (
                            <button
                              type="button"
                              key={plan.id}
                              onClick={() => setSelectedPlan(plan)}
                              title={`${new Date(plan.startAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · ${plan.title}`}
                              className={`w-full truncate rounded-md border px-1.5 py-1 text-left text-[10px] leading-tight transition-colors hover:brightness-125 ${
                                statusClasses(plan.status)
                              }`}
                            >
                              <span className="font-medium">{new Date(plan.startAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                              <span className="ml-1">{plan.title}</span>
                            </button>
                          ))}
                          {datePlans.length > visiblePlans.length && (
                            <button type="button" onClick={() => setSelectedDate(key)} className="px-1 text-left text-[10px] font-medium text-blue-300 hover:text-blue-200">
                              +{datePlans.length - visiblePlans.length} more
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[#25252b] bg-[#101012]" aria-label="Plans for selected date">
          <div className="shrink-0 border-b border-[#25252b] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">Day agenda</p>
            <h2 className="mt-1 text-lg font-semibold">
              {new Date(`${selectedDate}T12:00:00`).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            </h2>
            <p className="mt-1 text-xs text-[#71717a]">{selectedPlans.length} {selectedPlans.length === 1 ? "plan scheduled" : "plans scheduled"}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {selectedPlans.length === 0 ? (
              <div className="grid min-h-48 place-items-center text-center">
                <div>
                  <CalendarDays size={23} className="mx-auto text-[#52525b]" />
                  <p className="mt-3 text-sm font-medium text-[#d4d4d8]">Nothing planned for this day</p>
                  <p className="mt-1 text-xs text-[#71717a]">Choose another date to browse your plans.</p>
                </div>
              </div>
            ) : (
              <ol className="space-y-3">
                {selectedPlans.map((plan) => (
                  <li key={plan.id} className="relative rounded-xl border border-[#2a2a31] bg-[#17171b] p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="min-w-14 pt-0.5 text-xs font-semibold text-blue-300">
                        {new Date(plan.startAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </div>
                      <div className="min-w-0 flex-1">
                        <button type="button" onClick={() => setSelectedPlan(plan)} className="block max-w-full truncate text-left text-sm font-semibold hover:text-blue-300">
                          {plan.title}
                        </button>
                        <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${statusClasses(plan.status)}`}>{plan.status.replace("_", " ")}</span>
                        <p className="mt-2 truncate text-xs text-[#a1a1aa]">{conversationLabel(plan, userId, friends, channels)}</p>
                        {plan.location && <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#71717a]"><MapPin size={12} />{plan.location}</p>}
                        {plan.endAt && <p className="mt-1 flex items-center gap-1.5 text-xs text-[#71717a]"><Clock3 size={12} />Until {new Date(plan.endAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>}
                      </div>
                      {plan.creatorId === userId && (
                        <button
                          type="button"
                          onClick={() => setPlanToDelete(plan)}
                          className="rounded-md p-1.5 text-[#a1a1aa] hover:bg-red-500/10 hover:text-red-300"
                          aria-label={`Delete plan: ${plan.title}`}
                          title="Delete plan"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>

      {selectedPlan && (
        <PlanDetailsDialog
          plan={selectedPlan}
          currentUserId={userId}
          onPlanChanged={setPlanInCache}
          onPlanDeleted={removePlanFromCache}
          onClose={() => setSelectedPlan(null)}
          refreshToken={refreshToken}
        />
      )}
      {planToDelete && (
        <PlanDeleteDialog
          plan={planToDelete}
          open
          onOpenChange={(open) => {
            if (!open) setPlanToDelete(null);
          }}
          onDeleted={removePlanFromCache}
        />
      )}
    </main>
  );
}
