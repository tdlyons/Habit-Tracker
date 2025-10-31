'use client';

import { useMemo, useState, useTransition } from "react";
import type { SerializedDashboardData } from "@/lib/habit-service";

type HabitFormState = {
  name: string;
  description: string;
  color: string;
  icon: string;
};

const DEFAULT_FORM_STATE: HabitFormState = {
  name: "",
  description: "",
  color: "#2563eb",
  icon: "",
};

const COLOR_PRESETS = [
  "#2563eb",
  "#0891b2",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#ec4899",
];

const formatPercent = (value: number) =>
  `${Math.round(Math.min(Math.max(value * 100, 0), 100))}%`;

const formatDateLabel = (isoDate: string) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  }).format(new Date(`${isoDate}T00:00:00Z`));

export function Dashboard({ initialData }: { initialData: SerializedDashboardData }) {
  const [data, setData] = useState(initialData);
  const [formState, setFormState] = useState<HabitFormState>(DEFAULT_FORM_STATE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const maxDailyCompletions = useMemo(
    () =>
      data.history.reduce((max, day) => (day.completions > max ? day.completions : max), 0) || 1,
    [data.history],
  );

  const resetForm = () => {
    setFormState(DEFAULT_FORM_STATE);
    setErrorMessage(null);
  };

  const handleCreateHabit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          description: formState.description || null,
          color: formState.color,
          icon: formState.icon || null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Unable to create habit.");
      }

      const payload = (await response.json()) as SerializedDashboardData;
      setData(payload);
      resetForm();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleHabit = (habitId: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/habits/${habitId}/entries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error ?? "Unable to update habit.");
        }

        const payload = (await response.json()) as SerializedDashboardData;
        setData(payload);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unexpected error.");
      }
    });
  };

  const handleArchiveHabit = (habitId: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/habits/${habitId}/archive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: true }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error ?? "Unable to archive habit.");
        }

        const payload = (await response.json()) as SerializedDashboardData;
        setData(payload);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unexpected error.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute right-10 top-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-6">
          <div className="space-y-2">
            <span className="text-sm font-medium text-blue-200/80">
              {new Intl.DateTimeFormat(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              }).format(new Date())}
            </span>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Your Habit Studio
            </h1>
            <p className="max-w-xl text-sm leading-6 text-blue-100/80 sm:text-base">
              Build rhythm, celebrate streaks, and stay accountable with a calm, Apple-inspired
              dashboard that keeps your habits in focus.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-4 pt-2 text-left sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-5 backdrop-blur">
              <dt className="text-xs uppercase tracking-wide text-blue-100/70">Active habits</dt>
              <dd className="mt-2 text-2xl font-semibold">{data.summary.totalHabits}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-5 backdrop-blur">
              <dt className="text-xs uppercase tracking-wide text-blue-100/70">7 day cadence</dt>
              <dd className="mt-2 text-2xl font-semibold">
                {formatPercent(data.summary.completionRate7d)}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-5 backdrop-blur">
              <dt className="text-xs uppercase tracking-wide text-blue-100/70">Active streaks</dt>
              <dd className="mt-2 text-2xl font-semibold">{data.summary.activeStreaks}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-5 backdrop-blur">
              <dt className="text-xs uppercase tracking-wide text-blue-100/70">Today&apos;s wins</dt>
              <dd className="mt-2 text-2xl font-semibold">{data.summary.completionsToday}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/40 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Momentum tracker</h2>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Last {data.history.length} days
            </span>
          </div>
          <div className="mt-6 flex items-end gap-2">
            {data.history.map((point) => {
              const height = Math.max((point.completions / maxDailyCompletions) * 100, 4);
              return (
                <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-xl bg-gradient-to-t from-slate-200 to-blue-500"
                    style={{ height: `${height}%`, minHeight: "12px" }}
                  />
                  <span className="text-xs font-medium text-slate-400">
                    {formatDateLabel(point.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleCreateHabit}
          className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/40 lg:col-span-2"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Create a habit</h2>
            <p className="mt-1 text-sm text-slate-500">Keep it specific and meaningful.</p>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Habit name
            <input
              required
              value={formState.name}
              onChange={(event) =>
                setFormState((state) => ({ ...state, name: event.target.value }))
              }
              placeholder="Meditate for 5 minutes"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-normal text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Description
            <textarea
              value={formState.description}
              onChange={(event) =>
                setFormState((state) => ({ ...state, description: event.target.value }))
              }
              placeholder="Add a calming description…"
              className="min-h-[90px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-normal text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
              Accent color
              <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormState((state) => ({ ...state, color }))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent transition hover:scale-105"
                    style={{
                      background: color,
                      opacity: formState.color === color ? 1 : 0.6,
                      boxShadow:
                        formState.color === color ? "0 0 0 2px rgba(15,118,110,0.25)" : "none",
                    }}
                    aria-label={`Select ${color}`}
                  />
                ))}
                <input
                  type="color"
                  value={formState.color}
                  onChange={(event) =>
                    setFormState((state) => ({ ...state, color: event.target.value }))
                  }
                  className="h-8 w-16 cursor-pointer rounded-xl border border-slate-200 bg-white px-2 py-1 outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
              Glyph
              <input
                value={formState.icon}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, icon: event.target.value }))
                }
                placeholder="Optional initial or emoji"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-normal text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          {errorMessage && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating…" : "Add habit"}
          </button>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {data.habits.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white/90 p-10 text-center shadow-lg shadow-slate-200/50">
            <h3 className="text-lg font-semibold text-slate-900">
              No habits yet — let&apos;s build your first ritual.
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Use the form above to add a habit, then mark it complete to start your streak.
            </p>
          </div>
        ) : (
          data.habits.map((habit) => {
            const completedToday = habit.completionsToday > 0;
            const history = habit.history.slice(-7);
            const iconLabel =
              habit.icon?.trim() && habit.icon.trim().length > 0
                ? habit.icon.trim().slice(0, 2)
                : habit.name.charAt(0).toUpperCase();

            return (
              <article
                key={habit.id}
                className="group flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span
                      className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-md shadow-slate-200"
                      style={{
                        background: habit.color ?? "#2563eb",
                        color: "#fff",
                      }}
                    >
                      {iconLabel}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-sm text-slate-500">{habit.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleArchiveHabit(habit.id)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
                  >
                    Archive
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Current streak
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {habit.currentStreak}
                      <span className="text-sm font-medium text-slate-400"> days</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Best streak
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {habit.longestStreak}
                      <span className="text-sm font-medium text-slate-400"> days</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Weekly rhythm
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {formatPercent(habit.completionRate7d)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-400">
                    <span>Last 7 days</span>
                    <span>{completedToday ? "Today completed" : "Today pending"}</span>
                  </p>
                  <div className="flex gap-2">
                    {history.map((point) => (
                      <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                        <span
                          className="flex h-10 w-full flex-1 items-center justify-center rounded-2xl border border-slate-100 text-sm font-semibold transition"
                          style={{
                            background: point.completed
                              ? habit.color ?? "#2563eb"
                              : "rgba(248,250,252, 1)",
                            color: point.completed ? "#fff" : "#94a3b8",
                          }}
                        >
                          {point.completed ? "✓" : ""}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {formatDateLabel(point.date)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleHabit(habit.id)}
                  disabled={isPending}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                    completedToday
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      : "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800"
                  } disabled:cursor-progress`}
                >
                  {completedToday ? "Undo today" : "Mark complete"}
                </button>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
