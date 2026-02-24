"use client";

import React from "react";
import {
  Loader2,
  TrendingUp,
  Target,
  Flame,
  BookOpen,
  Trophy,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  Zap,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

const BOX_LABELS = [
  "Box 1 — New",
  "Box 2 — Learning",
  "Box 3 — Reviewing",
  "Box 4 — Familiar",
  "Box 5 — Mastered",
];
const BOX_COLORS = [
  "from-red-500/80 to-red-600/80",
  "from-orange-500/80 to-orange-600/80",
  "from-yellow-500/80 to-yellow-600/80",
  "from-blue-500/80 to-blue-600/80",
  "from-emerald-500/80 to-emerald-600/80",
];

export default function ProgressPage() {
  const {
    loading,
    stats,
    dailyActivity,
    boxDistribution,
    confusedLetters,
    reviewHistory,
    totalReviews,
  } = useAnalytics();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500/50" />
      </div>
    );
  }

  const maxDailyCards = Math.max(
    ...dailyActivity.map((d) => d.cardsReviewed),
    1,
  );
  const maxBoxCount = Math.max(...boxDistribution, 1);

  return (
    <div className="relative space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <BarChart3 className="w-4 h-4" />
            <span>Mastery Analytics</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tight bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              Your Progress
            </h1>
            <p className="text-lg font-medium text-slate-500 dark:text-slate-400 max-w-xl">
              Visualizing your cursive mastery journey and identifying areas for
              focused improvement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-white/50 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-base font-black">
                Level {Math.floor(stats.masteredCards / 5) + 1}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Skill Proficiency
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Practice",
            value: totalReviews.toString(),
            icon: BookOpen,
            color: "from-blue-500/20 to-blue-600/20",
            iconColor: "text-blue-500",
            subtitle: "Cards reviewed",
          },
          {
            label: "Mastery Accuracy",
            value: `${stats.accuracy}%`,
            icon: Target,
            color: "from-emerald-500/20 to-emerald-600/20",
            iconColor: "text-emerald-500",
            subtitle: "Precision rate",
          },
          {
            label: "Active Streak",
            value: `${stats.streak} Days`,
            icon: Flame,
            color: "from-orange-500/20 to-orange-600/20",
            iconColor: "text-orange-500",
            subtitle: "Consecutive days",
          },
          {
            label: "Collection Progress",
            value: `${stats.masteredCards}/${stats.totalCards}`,
            icon: Trophy,
            color: "from-amber-500/20 to-amber-600/20",
            iconColor: "text-amber-500",
            subtitle: "Mastered cards",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="group relative p-8 rounded-[2rem] bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] transition-all duration-300 active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-6">
              <div
                className={cn(
                  "p-4 rounded-2xl bg-linear-to-br transition-transform group-hover:scale-110 duration-300",
                  stat.color,
                )}
              >
                <stat.icon className={cn("w-7 h-7", stat.iconColor)} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-black tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {stat.label}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {stat.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Activity Chart - Premium Glass */}
      <div className="group relative p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-indigo-500" />
                Evolution of Practice
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Cards reviewed per day over the last 30 days
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-100 dark:bg-slate-800" />
                <span>Rest</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span>Peak</span>
              </div>
            </div>
          </div>

          {dailyActivity.some((d) => d.cardsReviewed > 0) ? (
            <div className="flex items-end gap-1.5 h-48 px-2">
              {dailyActivity.map((day, i) => {
                const height = (day.cardsReviewed / maxDailyCards) * 100;
                const isToday = i === dailyActivity.length - 1;
                const dayLabel = new Date(day.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  },
                );
                const showLabel = i % 5 === 0 || isToday;

                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center justify-end h-full group/bar relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 dark:bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all duration-200 translate-y-2 group-hover/bar:translate-y-0 whitespace-nowrap z-30 pointer-events-none shadow-xl border border-white/10 font-bold">
                      {day.cardsReviewed} cards ·{" "}
                      {new Date(day.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>

                    <div
                      className={cn(
                        "w-full rounded-full transition-all duration-500 min-h-[4px] relative",
                        isToday
                          ? "bg-linear-to-t from-indigo-600 to-indigo-400 shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
                          : day.cardsReviewed > 0
                            ? "bg-linear-to-t from-indigo-500/40 to-indigo-500/10 dark:from-indigo-500/30 dark:to-indigo-500/5 group-hover/bar:from-indigo-500/60 group-hover/bar:to-indigo-500/20"
                            : "bg-slate-100/50 dark:bg-slate-800/30",
                      )}
                      style={{ height: `${Math.max(height, 5)}%` }}
                    >
                      {isToday && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white animate-pulse" />
                      )}
                    </div>

                    {showLabel && (
                      <span className="text-[10px] text-slate-400 mt-4 font-black uppercase tracking-tighter">
                        {isToday ? "Now" : dayLabel}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300">
                <TrendingUp className="w-8 h-8" />
              </div>
              <p className="text-slate-400 font-bold max-w-xs text-sm">
                The chart is waiting for your data. Launch a review to start
                tracking.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Mid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leitner Box Distribution - Premium */}
        <div className="group relative p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 mb-2">
              <Layers className="w-6 h-6 text-purple-500" />
              Leitner Mastery Curve
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-10">
              Distribution of your card collection across study stages.
            </p>

            <div className="space-y-6">
              {boxDistribution.map((count, i) => {
                const pct = (count / maxBoxCount) * 100;
                return (
                  <div key={i} className="group/item space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                      <span className="group-hover/item:text-indigo-500 transition-colors">
                        {BOX_LABELS[i]}
                      </span>
                      <span className="text-slate-900 dark:text-white">
                        {count} Cards
                      </span>
                    </div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden p-[2px]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 bg-linear-to-r",
                          BOX_COLORS[i],
                        )}
                        style={{
                          width: `${Math.max(pct, count > 0 ? 5 : 0)}%`,
                        }}
                      >
                        <div className="w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {stats.totalCards > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                    {stats.totalCards}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Collection Volume
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-emerald-500 leading-none">
                    {Math.round((stats.masteredCards / stats.totalCards) * 100)}
                    %
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Mastery Quote
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Most Confused Letters - Premium */}
        <div className="group relative p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              Struggling Nodes
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-10">
              Specific characters that require more targeted drill.
            </p>

            {confusedLetters.length > 0 ? (
              <div className="space-y-4">
                {confusedLetters.map((item) => {
                  const errorRate = Math.round(
                    (item.errors / item.total) * 100,
                  );
                  const maxErrors = confusedLetters[0].errors;
                  const barWidth = (item.errors / maxErrors) * 100;

                  return (
                    <div
                      key={item.char}
                      className="group/item flex items-center gap-5 p-3 rounded-2xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    >
                      <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/20 group-hover/item:rotate-3 transition-transform uppercase">
                        {item.char}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-tighter text-slate-700 dark:text-slate-300">
                            {item.errors} Failures
                          </span>
                          <div
                            className={cn(
                              "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                              errorRate > 50
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20",
                            )}
                          >
                            {errorRate}% Conflict
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-amber-400 to-red-600 transition-all duration-1000"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300">
                  <Target className="w-8 h-8" />
                </div>
                <p className="text-slate-400 font-bold max-w-xs text-sm">
                  Precision perfect! No recurring confusion patterns detected.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review History Timeline - Premium Glass */}
      <div className="group relative p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Clock className="w-6 h-6 text-cyan-500" />
                Session History
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Your recent study timeline and performance metrics.
              </p>
            </div>
            <div className="px-5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                {reviewHistory.length} Sessions Logged
              </span>
            </div>
          </div>

          {reviewHistory.length > 0 ? (
            <div className="space-y-4">
              {reviewHistory.map((session) => {
                const sessionAccuracy =
                  session.correct_count + session.incorrect_count > 0
                    ? Math.round(
                        (session.correct_count /
                          (session.correct_count + session.incorrect_count)) *
                          100,
                      )
                    : 0;
                const duration = session.duration_seconds || 0;
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;

                return (
                  <div
                    key={session.id}
                    className="group/session flex items-center gap-6 p-6 rounded-[1.75rem] bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5"
                  >
                    {/* Date Block */}
                    <div className="text-center shrink-0 w-16 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="text-2xl font-black leading-none bg-linear-to-br from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                        {new Date(session.date).getDate()}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">
                        {new Date(session.date).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </div>
                    </div>

                    {/* Performance Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            Activity
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            <span className="text-lg font-black">
                              {session.cards_reviewed}{" "}
                              <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                                Cards
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            Outcome
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-base font-black text-emerald-600">
                                {session.correct_count}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-base font-black text-red-500">
                                {session.incorrect_count}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            Time Spent
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-500" />
                            <span className="text-base font-black text-slate-700 dark:text-slate-300">
                              {minutes > 0
                                ? `${minutes}m ${seconds}s`
                                : `${seconds}s`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Gauge */}
                    <div className="shrink-0 flex flex-col items-center justify-center space-y-1">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full border-4 flex items-center justify-center text-[11px] font-black shadow-lg",
                          sessionAccuracy >= 80
                            ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 shadow-emerald-500/10"
                            : sessionAccuracy >= 50
                              ? "border-amber-500/20 text-amber-500 bg-amber-500/5 shadow-amber-500/10"
                              : "border-red-500/20 text-red-500 bg-red-500/5 shadow-red-500/10",
                        )}
                      >
                        {sessionAccuracy}%
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        Accuracy
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300">
                <Clock className="w-8 h-8" />
              </div>
              <p className="text-slate-400 font-bold max-w-xs text-sm">
                No session data discovered. Complete your first practice to
                generate history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
