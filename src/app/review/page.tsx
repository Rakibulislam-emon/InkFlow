"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Card as CardType } from "@/types";
import {
  Check,
  X,
  Home,
  RefreshCw,
  Trophy,
  Loader2,
  Keyboard,
  Flame,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Flashcard } from "@/components/flashcard/Flashcard";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useReviewSession } from "@/hooks/useReviewSession";
import { isCardDue } from "@/lib/LeitnerSystem";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ReviewPage() {
  const { getCards, loading: fetchingCards } = useFlashcards();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const cardId = searchParams.get("cardId");

  const [allCards, setAllCards] = useState<CardType[]>([]);
  const [queue, setQueue] = useState<CardType[]>([]);
  const [isMistakeMode, setIsMistakeMode] = useState(mode === "mistakes");
  const [isFlipped, setIsFlipped] = useState(false);
  const [guess, setGuess] = useState("");
  const [guessResult, setGuessResult] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showStreakPop, setShowStreakPop] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    currentCard,
    totalCards,
    currentIndex,
    sessionCompleted,
    stats,
    missedCards,
    progress,
    submitResult,
    resetSession: resetHook,
  } = useReviewSession(queue);

  useEffect(() => {
    let cancelled = false;
    getCards().then((data) => {
      if (!cancelled) {
        setAllCards(data);
        let filtered = [];
        if (isMistakeMode) {
          filtered = (data || []).filter((card: CardType) =>
            card.tags?.includes("mistake"),
          );
        } else if (cardId) {
          filtered = (data || []).filter(
            (card: CardType) => card.id === cardId,
          );
        } else {
          filtered = (data || []).filter((card: CardType) =>
            isCardDue(card.next_review),
          );
        }

        const shuffled = [...filtered];
        if (!cardId) {
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
        }
        setQueue(shuffled);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [getCards, isMistakeMode, cardId]);

  useEffect(() => {
    if (!isTransitioning) {
      inputRef.current?.focus();
    }
  }, [currentIndex, isMistakeMode, isTransitioning]);

  const checkGuess = useCallback(() => {
    if (!currentCard || !guess.trim()) return;
    const isCorrect =
      guess.trim().toLowerCase() ===
      currentCard.correct_char.trim().toLowerCase();
    setGuessResult(isCorrect ? "correct" : "incorrect");
    setIsFlipped(true);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      if (newStreak >= 3 && newStreak % 3 === 0) {
        setShowStreakPop(true);
        setTimeout(() => setShowStreakPop(false), 1500);
      }
    } else {
      setStreak(0);
    }
  }, [currentCard, guess, streak, bestStreak]);

  const handleResponse = useCallback(
    async (isCorrect: boolean) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setIsFlipped(false);
      setGuess("");
      setGuessResult(null);

      setTimeout(async () => {
        await submitResult(isCorrect);
        setIsTransitioning(false);
      }, 300);
    },
    [submitResult, isTransitioning],
  );

  // Keyboard handler: Enter to check guess, then Enter again to advance
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (sessionCompleted) return;

      // If card is not flipped and we have a guess, check it
      if (!isFlipped && guess.trim()) {
        e.preventDefault();
        checkGuess();
        return;
      }

      // If card is flipped (showing result), Enter advances based on guess result
      if (isFlipped && guessResult !== null) {
        e.preventDefault();
        handleResponse(guessResult === "correct");
        return;
      }
    },
    [
      isFlipped,
      guess,
      guessResult,
      checkGuess,
      handleResponse,
      sessionCompleted,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const startMistakeReview = () => {
    setIsMistakeMode(true);
    setQueue([...missedCards]);
    setStreak(0);
    resetHook();
  };

  const resetEverything = () => {
    setIsMistakeMode(false);
    const due = allCards.filter((card: CardType) =>
      isCardDue(card.next_review),
    );
    const shuffled = [...due];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setQueue(shuffled);
    setStreak(0);
    setBestStreak(0);
    resetHook();
  };

  if (fetchingCards && allCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="mt-4 text-slate-500 font-medium">
          Preparing your session...
        </p>
      </div>
    );
  }

  if (
    allCards.length > 0 &&
    totalCards === 0 &&
    !sessionCompleted &&
    !isMistakeMode &&
    !cardId
  ) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">All caught up!</h1>
          <p className="text-slate-500">
            You have no cards due for review today. Great job keeping your
            practice consistent!
          </p>
        </div>
        <div className="pt-4 flex flex-col gap-3">
          <Link href="/cards">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12">
              Browse All Cards
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (sessionCompleted) {
    const accuracy =
      stats.correct + stats.incorrect > 0
        ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)
        : 0;

    return (
      <div className="max-w-2xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
        <Card className="border-none shadow-2xl bg-linear-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <CardTitle className="text-3xl font-bold">
              {isMistakeMode ? "Mistakes Reviewed!" : "Session Complete!"}
            </CardTitle>
            <p className="text-slate-500">
              {isMistakeMode
                ? "You've successfully reviewed your missed cards."
                : "Your practice is paying off. Here's how you did today:"}
            </p>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats.correct}
                </div>
                <div className="text-xs font-semibold text-green-600/70 uppercase tracking-wider mt-1">
                  Correct
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-center">
                <div className="text-3xl font-bold text-red-600">
                  {stats.incorrect}
                </div>
                <div className="text-xs font-semibold text-red-600/70 uppercase tracking-wider mt-1">
                  Mistakes
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-center">
                <div className="text-3xl font-bold text-amber-600 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5" />
                  {bestStreak}
                </div>
                <div className="text-xs font-semibold text-amber-600/70 uppercase tracking-wider mt-1">
                  Best Streak
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <h3 className="font-semibold px-1">Accuracy</h3>
                <span className="text-sm font-bold text-indigo-500">
                  {accuracy}%
                </span>
              </div>
              <Progress value={accuracy} className="h-3" />
            </div>

            <div className="flex flex-col gap-3 pt-4">
              {!isMistakeMode && missedCards.length > 0 && (
                <Button
                  onClick={startMistakeReview}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-12 shadow-md"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Review Mistakes ({missedCards.length})
                </Button>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={resetEverything}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12"
                >
                  <Home className="w-4 h-4 mr-2" />
                  {isMistakeMode ? "New Session" : "Practice Again"}
                </Button>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full h-12 rounded-xl">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Session Progress Header */}
      <div className="space-y-3">
        {isMistakeMode && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 px-4 py-2 rounded-xl text-center">
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              ⚡ MISTAKE REVIEW MODE
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm font-medium text-slate-500 px-1">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-indigo-600 mr-1">{currentIndex + 1}</span>
              <span>of {totalCards} cards</span>
            </div>
            {/* Streak indicator */}
            {streak > 0 && (
              <div
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300",
                  streak >= 5
                    ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600"
                    : streak >= 3
                      ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600"
                      : "bg-green-100 dark:bg-green-900/20 text-green-600",
                )}
              >
                <Flame
                  className={cn("w-3.5 h-3.5", streak >= 5 && "animate-pulse")}
                />
                {streak} streak
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-green-500 font-bold">{stats.correct}</span>
              <span className="text-slate-300">·</span>
              <span className="text-red-500 font-bold">{stats.incorrect}</span>
            </div>
            <div className="text-indigo-600 font-bold">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Streak celebration popup */}
      {showStreakPop && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="animate-in zoom-in-50 fade-in duration-300 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xl font-black">
            <Zap className="w-7 h-7" />
            {streak} Streak! 🔥
          </div>
        </div>
      )}

      {/* The Flashcard */}
      {currentCard && (
        <div
          className={cn(
            "transition-all duration-300",
            isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100",
          )}
        >
          <Flashcard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
            className="h-112.5"
          />
        </div>
      )}

      {/* Type Your Guess Section */}
      {!isFlipped && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">
            <Keyboard className="w-4 h-4" />
            Type what you see
          </label>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type the word here..."
              className="flex-1 h-14 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-lg font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors placeholder:text-slate-400"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-slate-400">
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] border border-slate-200 dark:border-slate-700">
                Enter
              </kbd>{" "}
              to check your answer
            </p>
            <button
              onClick={() => setIsFlipped(true)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              skip & reveal →
            </button>
          </div>
        </div>
      )}

      {/* Guess Result Feedback */}
      {isFlipped && guessResult && (
        <div
          className={cn(
            "p-4 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 duration-300",
            guessResult === "correct"
              ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
          )}
        >
          <div className="flex items-center gap-3">
            {guessResult === "correct" ? (
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <X className="w-5 h-5 text-red-600" />
              </div>
            )}
            <div className="flex-1">
              <p
                className={cn(
                  "font-bold",
                  guessResult === "correct"
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-red-700 dark:text-red-400",
                )}
              >
                {guessResult === "correct" ? "Correct! 🎉" : "Not quite!"}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {guessResult === "correct" ? (
                  <>
                    You typed{" "}
                    <span className="font-semibold">&ldquo;{guess}&rdquo;</span>{" "}
                    — perfect match!
                  </>
                ) : (
                  <>
                    You typed{" "}
                    <span className="font-semibold">&ldquo;{guess}&rdquo;</span>
                    {" · "}
                    Correct answer:{" "}
                    <span className="font-bold text-slate-900 dark:text-white">
                      &ldquo;{currentCard?.correct_char}&rdquo;
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="space-y-4">
        {isFlipped && (
          <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleResponse(false)}
                variant="outline"
                className={cn(
                  "h-16 text-base font-bold rounded-2xl flex flex-col items-center justify-center transition-all",
                  guessResult === "incorrect"
                    ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 ring-2 ring-red-200 dark:ring-red-800"
                    : "border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10",
                )}
              >
                <X className="w-5 h-5 mb-0.5" />
                <span>It was tricky</span>
              </Button>
              <Button
                onClick={() => handleResponse(true)}
                className={cn(
                  "h-16 text-base font-bold rounded-2xl flex flex-col items-center justify-center transition-all",
                  guessResult === "correct"
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg ring-2 ring-green-300 dark:ring-green-700"
                    : "bg-green-600 hover:bg-green-700 text-white shadow-green-200 dark:shadow-none shadow-lg",
                )}
              >
                <Check className="w-5 h-5 mb-0.5" />
                <span>Got it right!</span>
              </Button>
            </div>
            <p className="text-center text-xs text-slate-400">
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] border border-slate-200 dark:border-slate-700">
                Enter
              </kbd>{" "}
              to continue
              {guessResult && (
                <span className="ml-1 text-slate-500">
                  →{" "}
                  {guessResult === "correct" ? "Got it right" : "It was tricky"}
                </span>
              )}
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              End session early
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
