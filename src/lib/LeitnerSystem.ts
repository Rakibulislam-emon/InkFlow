/**
 * Leitner System Logic for InkFlow
 *
 * Interval Schedule (Days):
 * Box 1: 1 day
 * Box 2: 3 days
 * Box 3: 7 days
 * Box 4: 14 days
 * Box 5: 30 days
 */

const INTERVALS = [0, 1, 3, 7, 14, 30];

export interface LeitnerResult {
  nextBox: number;
  nextReviewDate: Date;
}

export function calculateLeitnerTransition(
  currentBox: number,
  isCorrect: boolean,
): LeitnerResult {
  let nextBox = currentBox;

  if (isCorrect) {
    // Move up, but cap at Box 5
    nextBox = Math.min(currentBox + 1, 5);
  } else {
    // If incorrect, always reset to Box 1
    nextBox = 1;
  }

  // Calculate next review date based on the interval of the NEW box
  const intervalDays = INTERVALS[nextBox];
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  // Set to start of day for cleaner scheduling if needed,
  // or keep precise for a "review now" feel.
  // We'll keep it precise but user can decide.

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
