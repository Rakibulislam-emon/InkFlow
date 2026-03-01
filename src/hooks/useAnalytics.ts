"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { type Card } from "@/types";
import { useSettings } from "@/hooks/useSettings";

interface DailyActivity {
  date: string;
  cardsReviewed: number;
  correct: number;
  incorrect: number;
}

interface ReviewSessionData {
  id: string;
  date: string;
  cards_reviewed: number;
  correct_count: number;
  incorrect_count: number;
  duration_seconds: number;
}

export function useAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCards: 0,
    masteredCards: 0,
    streak: 0,
    dueToday: 0,
    accuracy: 0,
    upcomingEvents: [] as Card[],
  });
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [boxDistribution, setBoxDistribution] = useState<number[]>([
    0, 0, 0, 0, 0,
  ]);
  const [confusedLetters, setConfusedLetters] = useState<
    { id: string; char: string; errors: number; total: number }[]
  >([]);
  const [reviewHistory, setReviewHistory] = useState<ReviewSessionData[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const { boxes: settingsBoxes } = useSettings();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Cards Stats
      const { data: cardsRaw, error: cardsError } = await supabase
        .from("cards")
        .select("*")
        .eq("user_id", user.id);

      if (cardsError) throw cardsError;
      const cards = (cardsRaw || []) as Card[];

      const maxBoxId =
        settingsBoxes.length > 0
          ? Math.max(...settingsBoxes.map((b) => b.id))
          : 5;

      const totalCards = cards.length;
      const masteredCards = cards.filter((c) => c.box === maxBoxId).length;
      const dueToday = cards.filter(
        (c) => new Date(c.next_review) <= new Date(),
      ).length;

      const totalCorrect = cards.reduce(
        (acc, c) => acc + (c.correct_count || 0),
        0,
      );
      const totalIncorrect = cards.reduce(
        (acc, c) => acc + (c.incorrect_count || 0),
        0,
      );
      const accuracy =
        totalCorrect + totalIncorrect > 0
          ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
          : 0;

      // 2. Leitner Box Distribution
      const distribution = new Array(settingsBoxes.length || 5).fill(0);
      cards.forEach((c) => {
        const boxIndex = settingsBoxes.findIndex((b) => b.id === c.box);
        if (boxIndex !== -1) {
          distribution[boxIndex]++;
        } else {
          // Fallback for Box 1 or unexpected values
          distribution[0]++;
        }
      });
      setBoxDistribution(distribution);

      // 3. Most Confused Letters
      const letterErrors = cards
        .filter(
          (c) => (c.incorrect_count || 0) > 0 && (c.box || 1) <= 3, // Only show cards still in early boxes (not mastered)
        )
        .map((c) => ({
          id: c.id,
          char: c.correct_char,
          errors: c.incorrect_count || 0,
          total: (c.correct_count || 0) + (c.incorrect_count || 0),
        }))
        .sort((a, b) => b.errors - a.errors)
        .slice(0, 10);
      setConfusedLetters(letterErrors);

      // 4. Fetch Sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("review_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (sessionsError) throw sessionsError;

      setReviewHistory((sessions || []).slice(0, 20) as ReviewSessionData[]);
      setTotalReviews(
        (sessions || []).reduce((sum, s) => sum + (s.cards_reviewed || 0), 0),
      );

      // 5. Daily Activity (last 30 days)
      const last30Days: DailyActivity[] = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];

        const daySessions = (sessions || []).filter((s) => {
          const sDate = new Date(s.date).toISOString().split("T")[0];
          return sDate === dateStr;
        });

        last30Days.push({
          date: dateStr,
          cardsReviewed: daySessions.reduce(
            (sum, s) => sum + (s.cards_reviewed || 0),
            0,
          ),
          correct: daySessions.reduce(
            (sum, s) => sum + (s.correct_count || 0),
            0,
          ),
          incorrect: daySessions.reduce(
            (sum, s) => sum + (s.incorrect_count || 0),
            0,
          ),
        });
      }
      setDailyActivity(last30Days);

      // 6. Calculate Streak
      let streak = 0;
      if (sessions && sessions.length > 0) {
        const today = new Date().setHours(0, 0, 0, 0);
        let lastDate = new Date(sessions[0].date).setHours(0, 0, 0, 0);

        if (today - lastDate <= 86400000) {
          streak = 1;
          for (let i = 1; i < sessions.length; i++) {
            const currentDate = new Date(sessions[i].date).setHours(0, 0, 0, 0);
            if (lastDate - currentDate === 86400000) {
              streak++;
              lastDate = currentDate;
            } else if (lastDate - currentDate > 86400000) {
              break;
            }
          }
        }
      }

      setStats({
        totalCards,
        masteredCards,
        streak,
        dueToday,
        accuracy,
        upcomingEvents: cards
          .filter((c) => new Date(c.next_review) <= new Date())
          .sort(
            (a, b) =>
              new Date(a.next_review).getTime() -
              new Date(b.next_review).getTime(),
          )
          .slice(0, 3),
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [settingsBoxes]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    loading,
    stats,
    dailyActivity,
    boxDistribution,
    confusedLetters,
    reviewHistory,
    totalReviews,
    refresh: fetchStats,
  };
}
