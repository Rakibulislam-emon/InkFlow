"use client";

import { useState, useCallback, useMemo } from "react";
import { Card as CardType } from "@/types";
import { useFlashcards } from "@/hooks/useFlashcards";
import { calculateLeitnerTransition, isCardDue } from "@/lib/LeitnerSystem";

export function useReviewSession(allCards: CardType[]) {
  const { updateCard } = useFlashcards();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });

  // Filter cards that are due for review
  const queue = useMemo(() => {
    const due = allCards.filter((card) => isCardDue(card.next_review));
    // Shuffle the queue
    return [...due].sort(() => Math.random() - 0.5);
  }, [allCards]);

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
      );

      // Update the card in Supabase
      await updateCard(currentCard.id, {
        box: nextBox,
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

      // Move to next card or finish
      if (isLastCard) {
        setSessionCompleted(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [currentCard, isLastCard, updateCard],
  );

  return {
    queue,
    currentCard,
    currentIndex,
    totalCards: queue.length,
    sessionCompleted,
    stats,
    progress,
    submitResult,
    resetSession: () => {
      setCurrentIndex(0);
      setSessionCompleted(false);
      setStats({ correct: 0, incorrect: 0 });
    },
  };
}
