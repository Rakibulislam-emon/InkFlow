"use client";

import { useState, useCallback } from "react";
import { Card as CardType } from "@/types";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useSettings } from "@/hooks/useSettings";
import { calculateLeitnerTransition } from "@/lib/LeitnerSystem";

export function useReviewSession(queue: CardType[]) {
  const { updateCard } = useFlashcards();
  const { boxes } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [missedCards, setMissedCards] = useState<CardType[]>([]);

  const currentCard = queue[currentIndex] || null;
  const isLastCard = currentIndex === queue.length - 1;
  const progress = queue.length > 0 ? (currentIndex / queue.length) * 100 : 0;

  const submitResult = useCallback(
    async (isCorrect: boolean) => {
      if (!currentCard) return;

      // Calculate new Leitner values
      const { nextBox, nextReviewDate } = calculateLeitnerTransition(
        currentCard.box,
        isCorrect,
        boxes,
      );

      // Calculate updated tags
      const currentTags = currentCard.tags || [];
      const updatedTags = isCorrect
        ? currentTags.filter((t) => t !== "mistake")
        : currentTags.includes("mistake")
          ? currentTags
          : [...currentTags, "mistake"];

      // Update the card in Supabase
      await updateCard(currentCard.id, {
        box: nextBox,
        tags: updatedTags,
        next_review: nextReviewDate.toISOString(),
        correct_count: (currentCard.correct_count || 0) + (isCorrect ? 1 : 0),
        incorrect_count:
          (currentCard.incorrect_count || 0) + (isCorrect ? 0 : 1),
      });

      // Update local session stats
      setStats((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      }));

      if (!isCorrect) {
        setMissedCards((prev) => {
          if (prev.find((c) => c.id === currentCard.id)) return prev;
          return [...prev, currentCard];
        });
      }

      // Move to next card or finish
      if (isLastCard) {
        setSessionCompleted(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [currentCard, isLastCard, updateCard, boxes],
  );

  return {
    queue,
    currentCard,
    currentIndex,
    totalCards: queue.length,
    sessionCompleted,
    stats,
    missedCards,
    progress,
    submitResult,
    resetSession: () => {
      setCurrentIndex(0);
      setSessionCompleted(false);
      setStats({ correct: 0, incorrect: 0 });
      setMissedCards([]);
    },
  };
}
