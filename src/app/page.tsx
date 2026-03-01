"use client";

import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Trophy,
  Loader2,
  Zap,
  Target,
  Flame,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useEffect, useState, useMemo } from "react";
import { Card as CardType } from "@/types";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { stats, loading, dailyActivity, confusedLetters, totalReviews } =
    useAnalytics();
  const { getCards } = useFlashcards();
  const [allCards, setAllCards] = useState<CardType[]>([]);

  useEffect(() => {
    getCards().then(setAllCards);
  }, [getCards]);

  const masteryProgress = useMemo(() => {
    if (allCards.length === 0) return 0;
    return (
      (allCards.reduce((acc, card) => acc + (card.box || 1) * (100 / 5), 0) /
        (allCards.length * 100)) *
      100
    );
  }, [allCards]);

  // Chart data — last 14 days for the activity bar chart
  const chartData = useMemo(() => {
    return dailyActivity.slice(-14);
  }, [dailyActivity]);

  const maxCardsReviewed = useMemo(
    () => Math.max(...chartData.map((d) => d.cardsReviewed), 1),
    [chartData],
  );

  // Weekly comparison
  const thisWeekReviews = useMemo(
    () => dailyActivity.slice(-7).reduce((sum, d) => sum + d.cardsReviewed, 0),
    [dailyActivity],
  );
  const lastWeekReviews = useMemo(
    () =>
      dailyActivity.slice(-14, -7).reduce((sum, d) => sum + d.cardsReviewed, 0),
    [dailyActivity],
  );
  const weeklyChange =
    lastWeekReviews > 0
      ? Math.round(
          ((thisWeekReviews - lastWeekReviews) / lastWeekReviews) * 100,
        )
      : thisWeekReviews > 0
        ? 100
        : 0;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500/50" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Compact Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-indigo-600 to-purple-700 p-8 md:p-12 text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span className="uppercase tracking-wider text-indigo-100">
                InkFlow Dashboard
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Welcome back 👋
            </h1>
            <p className="text-indigo-100/80 font-medium max-w-md">
              {stats.dueToday > 0
                ? `You have ${stats.dueToday} cards due for review. Let's keep the momentum going!`
                : "You're all caught up! Great job staying consistent."}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/review"
              className="flex items-center justify-center space-x-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-indigo-600 shadow-xl shadow-indigo-950/20 transition-all hover:scale-105 active:scale-[0.98]"
            >
              <span>Start Review</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/cards"
              className="flex items-center justify-center space-x-2 rounded-2xl bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur-md border border-white/20 transition-all hover:bg-white/20"
            >
              <BookOpen className="w-4 h-4" />
              <span>Library</span>
            </Link>
          </div>
        </div>
        <div className="absolute top-10 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl" />
      </section>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Cards",
            value: stats.totalCards,
            icon: BookOpen,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Mastered",
            value: stats.masteredCards,
            icon: Trophy,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "Streak",
            value: `${stats.streak}d`,
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
          },
          {
            label: "Accuracy",
            value: `${stats.accuracy}%`,
            icon: Target,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div className="text-3xl font-black tracking-tight">
              {stat.value}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Activity Chart + Mastery Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart - 14 day bar chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Review Activity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Last 14 days · {totalReviews} total reviews
              </p>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold",
                weeklyChange >= 0
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                  : "bg-red-50 dark:bg-red-900/20 text-red-600",
              )}
            >
              <TrendingUp
                className={cn("w-3.5 h-3.5", weeklyChange < 0 && "rotate-180")}
              />
              {weeklyChange >= 0 ? "+" : ""}
              {weeklyChange}% vs last week
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-1.5 h-40">
            {chartData.map((day, i) => {
              const height =
                day.cardsReviewed > 0
                  ? Math.max((day.cardsReviewed / maxCardsReviewed) * 100, 8)
                  : 4;
              const isToday = i === chartData.length - 1;
              const dateObj = new Date(day.date + "T00:00:00");
              const dayLabel = dateObj.toLocaleDateString(undefined, {
                weekday: "narrow",
              });

              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1 group"
                >
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-500 whitespace-nowrap">
                    {day.cardsReviewed > 0 ? day.cardsReviewed : ""}
                  </div>
                  <div
                    className={cn(
                      "w-full rounded-lg transition-all duration-300 cursor-default",
                      day.cardsReviewed > 0
                        ? isToday
                          ? "bg-indigo-500 shadow-sm shadow-indigo-500/30"
                          : "bg-indigo-400/60 dark:bg-indigo-500/40 group-hover:bg-indigo-500"
                        : "bg-slate-100 dark:bg-slate-800",
                    )}
                    style={{ height: `${height}%` }}
                    title={`${dateObj.toLocaleDateString()}: ${day.cardsReviewed} cards`}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-semibold",
                      isToday ? "text-indigo-500" : "text-slate-400",
                    )}
                  >
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-2.5 h-2.5 rounded bg-indigo-500" />
              Cards reviewed
            </div>
            <div className="text-xs text-slate-400">
              This week:{" "}
              <span className="font-bold text-slate-600 dark:text-slate-300">
                {thisWeekReviews}
              </span>
            </div>
          </div>
        </div>

        {/* Mastery Ring */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-bold tracking-tight mb-4">
            Mastery Progress
          </h3>

          <div className="relative w-44 h-44 mb-4">
            <svg className="w-44 h-44 transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="72"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="88"
                cy="88"
                r="72"
                stroke="url(#masteryGrad)"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={452.4}
                strokeDashoffset={452.4 - (452.4 * masteryProgress) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient
                  id="masteryGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-black">
                {Math.round(masteryProgress)}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                Complete
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500">
              {stats.masteredCards} mastered
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500">
              {stats.totalCards} total
            </span>
          </div>

          <Link
            href="/review"
            className="mt-5 w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Launch Session
          </Link>
        </div>
      </div>

      {/* Bottom Row: Due Cards + Most Confused */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Due Today */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold tracking-tight">Due Now</h2>
            {stats.dueToday > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-bold animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {stats.dueToday} cards
              </div>
            )}
          </div>
          {stats.upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingEvents.map((card, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 transition-all hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1 mr-3">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow shadow-indigo-500/20 shrink-0">
                      {card.correct_char.slice(0, 3)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate">
                        {card.correct_char}
                      </div>
                      <div className="text-xs text-slate-500">
                        Box {card.box || 1}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/review?cardId=${card.id}`}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shrink-0"
                  >
                    Study
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-sm text-slate-500 font-medium">
                All caught up! No cards due.
              </p>
            </div>
          )}
        </div>

        {/* Most Confused Cards */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold tracking-tight">Needs Practice</h2>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          {confusedLetters.length > 0 ? (
            <div className="space-y-2.5">
              {confusedLetters.slice(0, 5).map((item, i) => {
                const errorRate =
                  item.total > 0
                    ? Math.round((item.errors / item.total) * 100)
                    : 0;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 transition-all hover:bg-red-50/50 dark:hover:bg-red-500/5"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center font-bold text-red-500 text-sm shrink-0">
                      {item.char.slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold truncate">
                          {item.char}
                        </span>
                        <span className="text-xs font-semibold text-red-500 shrink-0 ml-2">
                          {errorRate}% error
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-red-400 to-red-500 transition-all duration-500"
                          style={{ width: `${errorRate}%` }}
                        />
                      </div>
                    </div>
                    <Link
                      href={`/review?cardId=${item.id}`}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all shrink-0"
                    >
                      Practice
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
                <Target className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="text-sm text-slate-500 font-medium">
                No trouble spots yet. Keep practicing!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
