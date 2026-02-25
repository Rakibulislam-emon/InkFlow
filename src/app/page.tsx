"use client";

import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Trophy,
  Loader2,
  Calendar,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useSettings } from "@/hooks/useSettings";
import { ConfusionMatrix } from "@/components/analytics/ConfusionMatrix";
import { useEffect, useState } from "react";
import { Card as CardType } from "@/types";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { stats, loading } = useAnalytics();
  const { getCards } = useFlashcards();
  const { boxes } = useSettings();
  const [allCards, setAllCards] = useState<CardType[]>([]);

  useEffect(() => {
    getCards().then(setAllCards);
  }, [getCards]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500/50" />
      </div>
    );
  }

  const maxBoxId = boxes.length > 0 ? Math.max(...boxes.map((b) => b.id)) : 5;
  const lastBoxName = boxes.length > 0 ? boxes[boxes.length - 1].name : "Box 5";

  const masteryProgress =
    allCards.length > 0
      ? (allCards.reduce(
          (acc, card) => acc + (card.box || 1) * (100 / maxBoxId),
          0,
        ) /
          (allCards.length * 100)) *
        100
      : 0;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Premium Hero Section */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-indigo-600 p-0 shadow-[0_20px_50px_-10px_rgba(79,70,229,0.3)] dark:shadow-none">
        <div className="relative z-10 overflow-hidden rounded-[2.4rem] bg-linear-to-br from-indigo-600 via-indigo-600 to-purple-700 p-6 md:p-16 text-center md:text-left text-white">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold backdrop-blur-md border border-white/10 animate-in zoom-in-95 duration-500">
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span className="bg-linear-to-r from-indigo-100 to-white bg-clip-text text-transparent uppercase tracking-wider text-xs">
                Handcrafted Mastery
              </span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.1]">
              Master the Art <br />
              <span className="bg-linear-to-r from-indigo-200 via-white to-indigo-100 bg-clip-text text-transparent drop-shadow-sm">
                of the Flow
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-indigo-100/80 font-medium leading-relaxed max-w-xl">
              InkFlow bridges the gap between raw effort and perfect precision.
              Master muscle memory with deliberate, spaced practice.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-6">
              <Link
                href="/review"
                className="w-full sm:w-auto flex items-center justify-center space-x-3 rounded-2xl bg-white px-8 py-4 font-bold text-indigo-600 shadow-xl shadow-indigo-950/20 transition-all hover:scale-105 active:scale-[0.98] hover:shadow-2xl group/btn"
              >
                <span>Start Reviewing</span>
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/cards"
                className="w-full sm:w-auto flex items-center justify-center space-x-3 rounded-2xl bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-md border border-white/20 transition-all hover:bg-white/20 active:scale-[0.98]"
              >
                <BookOpen className="w-5 h-5" />
                <span>Library</span>
              </Link>
            </div>
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(199,210,254,0.1),transparent)] pointer-events-none" />
        </div>
      </section>

      {/* Persistent Mistakes CTA */}
      {allCards.filter((c) => c.tags?.includes("mistake")).length > 0 && (
        <section className="animate-in slide-in-from-top-4 duration-700 px-1">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/50 dark:border-amber-500/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse">
                <Zap className="w-8 h-8 text-white fill-white" />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h2 className="text-2xl font-black tracking-tight text-amber-700 dark:text-amber-400 uppercase">
                  Mistakes Identified
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  You have{" "}
                  <span className="font-bold text-amber-600">
                    {allCards.filter((c) => c.tags?.includes("mistake")).length}
                  </span>{" "}
                  cards that need reinforcement. Practice them now?
                </p>
              </div>
            </div>
            <Link
              href="/review?mode=mistakes"
              className="w-full md:w-auto px-10 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg transition-all hover:scale-105 active:scale-[0.98] shadow-lg shadow-amber-500/20 text-center"
            >
              Practice Mistakes
            </Link>
          </div>
        </section>
      )}

      {/* Analytics Section */}
      {allCards.some(
        (c) => (c.incorrect_count || 0) > 0 && c.confused_with?.length,
      ) && (
        <div className="animate-in slide-in-from-top-4 duration-500 delay-200 px-1">
          <ConfusionMatrix cards={allCards} />
        </div>
      )}

      {/* Stats Grid - Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Collection Size",
            value: stats.totalCards.toString(),
            icon: BookOpen,
            color: "from-blue-500/20 to-blue-600/20",
            iconColor: "text-blue-500",
            subtitle: "Total cards created",
          },
          {
            label: "Concepts Mastered",
            value: stats.masteredCards.toString(),
            icon: Trophy,
            color: "from-amber-500/20 to-amber-600/20",
            iconColor: "text-amber-500",
            subtitle: `${lastBoxName} progress`,
          },
          {
            label: "Active Streak",
            value: `${stats.streak} Days`,
            icon: Zap,
            color: "from-purple-500/20 to-purple-600/20",
            iconColor: "text-purple-500",
            subtitle: "Consistent practice",
          },
          {
            label: "Global Accuracy",
            value: `${stats.accuracy}%`,
            icon: Target,
            color: "from-emerald-500/20 to-emerald-600/20",
            iconColor: "text-emerald-500",
            subtitle: "Correct review rate",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="group relative p-8 rounded-4xl bg-white/50 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] transition-all duration-300 active:scale-[0.98]"
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
              <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-800 group-hover:bg-indigo-500 transition-colors" />
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

      {/* Action Rows */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Upcoming List */}
        <div className="xl:col-span-3 group relative p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-100">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">
                  Upcoming Reviews
                </h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Your scheduled study plan
                </p>
              </div>
              {stats.dueToday > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/10 text-red-500 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    {stats.dueToday} DUE NOW
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {stats.upcomingEvents.length > 0 ? (
                stats.upcomingEvents.map((card, i) => (
                  <div
                    key={i}
                    className="group/item flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 transition-all hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 hover:-translate-y-0.5 duration-300"
                  >
                    <div className="flex items-center space-x-5 min-w-0 flex-1 mr-4">
                      <div className="min-w-14 h-14 px-3 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-indigo-500/20 group-hover/item:rotate-3 transition-transform whitespace-nowrap overflow-hidden">
                        {card.correct_char}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="font-bold text-slate-900 dark:text-white uppercase tracking-tighter truncate">
                          {card.tags?.includes("mistake")
                            ? "Needs Reinforcement"
                            : card.tags?.[0] || "Standard Practice"}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5" />
                          Due{" "}
                          {new Date(card.next_review).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/review?cardId=${card.id}`}
                      className="px-6 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all shadow-sm shrink-0"
                    >
                      Study
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <p className="text-slate-400 font-bold max-w-xs">
                    Clear schedule! Add more cards or take a well-deserved
                    break.
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Circular Mastery */}
        <div className="xl:col-span-2 group relative p-10 rounded-[2.5rem] bg-linear-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-[#020617] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="relative z-10 w-full space-y-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-black tracking-tight">
                Mastery Goal
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total collection verification progress
              </p>
            </div>

            <div className="relative w-56 h-56 mx-auto group/chart">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl scale-90 group-hover/chart:scale-110 transition-transform duration-700" />

              <svg className="w-56 h-56 transform -rotate-90 relative z-10">
                <circle
                  cx="112"
                  cy="112"
                  r="90"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="90"
                  stroke="url(#masteryGradient)"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={565.5}
                  strokeDashoffset={565.5 - (565.5 * masteryProgress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient
                    id="masteryGradient"
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

              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1 z-20">
                <div className="text-6xl font-black tracking-tight bg-linear-to-br from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent text-center">
                  {Math.round(masteryProgress)}%
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Complete
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-center gap-4 text-sm font-bold">
                <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-indigo-500 mr-1.5">
                    {stats.masteredCards}
                  </span>
                  <span className="text-slate-400">Mastered</span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-900 dark:text-white mr-1.5">
                    {stats.totalCards}
                  </span>
                  <span className="text-slate-400">Total</span>
                </div>
              </div>

              <Link
                href="/review"
                className="inline-flex items-center justify-center w-full py-5 rounded-3xl bg-indigo-600 text-white font-black text-lg shadow-xl shadow-indigo-500/20 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-900 transition-all hover:shadow-2xl active:scale-[0.98] group/cta"
              >
                Launch Session
                <Zap className="w-5 h-5 ml-2 fill-white stroke-none group-hover/cta:scale-110 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Subtle background decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
