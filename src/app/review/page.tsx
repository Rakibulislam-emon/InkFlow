"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Card as CardType } from "@/types";
import {
  Check,
  X,
  ArrowRight,
  Home,
  RefreshCw,
  Trophy,
  Loader2,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Flashcard } from "@/components/flashcard/Flashcard";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useReviewSession } from "@/hooks/useReviewSession";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ReviewPage() {
  const { getCards, loading: fetchingCards } = useFlashcards();
  const [allCards, setAllCards] = useState<CardType[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [guess, setGuess] = useState("");
  const [guessResult, setGuessResult] = useState<
    "correct" | "incorrect" | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    currentCard,
    totalCards,
    currentIndex,
    sessionCompleted,
    stats,
    progress,
    submitResult,
    resetSession,
  } = useReviewSession(allCards);

  useEffect(() => {
    let cancelled = false;
    getCards().then((data) => {
      if (!cancelled) setAllCards(data);
    });
    return () => {
      cancelled = true;
    };
  }, [getCards]);

  useEffect(() => {
    // Focus the input when the card changes
    inputRef.current?.focus();
  }, [currentIndex]);

  const checkGuess = () => {
    if (!currentCard || !guess.trim()) return;
    const isCorrect =
      guess.trim().toLowerCase() ===
      currentCard.correct_char.trim().toLowerCase();
    setGuessResult(isCorrect ? "correct" : "incorrect");
    setIsFlipped(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && guess.trim()) {
      e.preventDefault();
      if (guessResult === null) {
        checkGuess();
      }
    }
  };

  const handleResponse = async (isCorrect: boolean) => {
    setIsFlipped(false);
    setGuess("");
    setGuessResult(null);
    setTimeout(async () => {
      await submitResult(isCorrect);
    }, 300);
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

  if (allCards.length > 0 && totalCards === 0 && !sessionCompleted) {
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
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
        <Card className="border-none shadow-2xl bg-linear-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <CardTitle className="text-3xl font-bold">
              Session Complete!
            </CardTitle>
            <p className="text-slate-500">
              Your practice is paying off. Here&apos;s how you did today:
            </p>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats.correct}
                </div>
                <div className="text-sm font-medium text-green-600/70 uppercase tracking-wider">
                  Correct
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-center">
                <div className="text-3xl font-bold text-red-600">
                  {stats.incorrect}
                </div>
                <div className="text-sm font-medium text-red-600/70 uppercase tracking-wider">
                  Mistakes
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <h3 className="font-semibold px-1">Concept Mastery</h3>
                <span className="text-xs font-bold text-indigo-500 uppercase">
                  Steady Progress
                </span>
              </div>
              <Progress
                value={
                  (stats.correct / (stats.correct + stats.incorrect)) * 100
                }
                className="h-3"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={resetSession}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Practice Again
              </Button>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full h-12 rounded-xl">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Session Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm font-medium text-slate-500 px-1">
          <div className="flex items-center">
            <span className="text-indigo-600 mr-1">{currentIndex + 1}</span>
            <span>of {totalCards} cards</span>
          </div>
          <div className="text-indigo-600 font-bold">
            {Math.round(progress)}%
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* The Flashcard */}
      {currentCard && (
        <Flashcard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          className="h-112.5"
        />
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
              onKeyDown={handleKeyDown}
              placeholder="Type the word here..."
              className="flex-1 h-14 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-lg font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors placeholder:text-slate-400"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <Button
              onClick={checkGuess}
              disabled={!guess.trim()}
              className="h-14 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base disabled:opacity-40 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <button
            onClick={() => setIsFlipped(true)}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-1"
          >
            or skip and reveal answer
          </button>
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
            <div>
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
      <div className="space-y-6">
        {isFlipped && (
          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
            <Button
              onClick={() => handleResponse(false)}
              variant="outline"
              className={cn(
                "h-20 text-lg font-bold rounded-2xl flex flex-col items-center justify-center space-y-1 transition-all",
                guessResult === "incorrect"
                  ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 ring-2 ring-red-200 dark:ring-red-800"
                  : "border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10",
              )}
            >
              <X className="w-6 h-6" />
              <span>It was tricky</span>
            </Button>
            <Button
              onClick={() => handleResponse(true)}
              className={cn(
                "h-20 text-lg font-bold rounded-2xl flex flex-col items-center justify-center space-y-1 transition-all",
                guessResult === "correct"
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg ring-2 ring-green-300 dark:ring-green-700"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-green-200 dark:shadow-none shadow-lg",
              )}
            >
              <Check className="w-6 h-6" />
              <span>Got it right!</span>
            </Button>
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
