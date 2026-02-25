import { BoxConfig } from "@/hooks/useSettings";

export interface LeitnerResult {
  nextBox: number;
  nextReviewDate: Date;
}

export function calculateLeitnerTransition(
  currentBox: number,
  isCorrect: boolean,
  boxes: BoxConfig[],
): LeitnerResult {
  if (boxes.length === 0) {
    return {
      nextBox: currentBox,
      nextReviewDate: new Date(),
    };
  }

  let nextBox = currentBox;
  const boxIds = boxes.map((b) => b.id).sort((a, b) => a - b);
  const currentIndex = boxIds.indexOf(currentBox);

  if (isCorrect) {
    // Move to next box in the sequence, or stay at the last one
    if (currentIndex < boxIds.length - 1) {
      nextBox = boxIds[currentIndex + 1];
    } else {
      nextBox = boxIds[boxIds.length - 1];
    }
  } else {
    // If incorrect, always reset to the FIRST box
    nextBox = boxIds[0];
  }

  // Calculate next review date based on the interval of the NEW box
  const targetBox = boxes.find((b) => b.id === nextBox) || boxes[0];
  const intervalDays = targetBox.intervalDays;
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return {
    nextBox,
    nextReviewDate,
  };
}

/**
 * Checks if a card is due for review.
 * @param nextReviewDate ISO string or Date object
 */
export function isCardDue(nextReviewDate: string | Date): boolean {
  const now = new Date();
  const due = new Date(nextReviewDate);
  return now >= due;
}
