"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { Card as CardType } from "@/types";

interface ConfusionMatrixProps {
  cards: CardType[];
  className?: string;
}

export function ConfusionMatrix({ cards, className }: ConfusionMatrixProps) {
  const matrixData = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    const chars = new Set<string>();

    // Filter cards with confusion data and errors
    const troubledCards = cards.filter(
      (c) =>
        (c.incorrect_count || 0) > 0 &&
        c.confused_with &&
        c.confused_with.length > 0,
    );

    troubledCards.forEach((card) => {
      const actual = card.correct_char;
      chars.add(actual);

      if (!matrix[actual]) matrix[actual] = {};

      card.confused_with!.forEach((confused) => {
        chars.add(confused);
        matrix[actual][confused] =
          (matrix[actual][confused] || 0) + (card.incorrect_count || 0);
      });
    });

    const sortedChars = Array.from(chars).sort();
    return { matrix, chars: sortedChars };
  }, [cards]);

  const { matrix, chars } = matrixData;

  // Find max value for normalization
  const maxValue = useMemo(() => {
    let max = 0;
    Object.values(matrix).forEach((row) => {
      Object.values(row).forEach((val) => {
        if (val > max) max = val;
      });
    });
    return max || 1;
  }, [matrix]);

  if (chars.length === 0) {
    return null;
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Confusion Matrix</CardTitle>
        <CardDescription>
          Letters you frequently mix up during practice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-100">
            {/* Header row */}
            <div className="flex">
              <div className="w-10 h-10 shrink-0" /> {/* Spacer */}
              {chars.map((char) => (
                <div
                  key={char}
                  className="w-10 h-10 flex items-center justify-center font-bold text-xs text-slate-400"
                >
                  {char}
                </div>
              ))}
            </div>

            {/* Matrix rows */}
            {chars.map((actual) => (
              <div key={actual} className="flex">
                <div className="w-10 h-10 flex items-center justify-center font-bold text-xs text-slate-400">
                  {actual}
                </div>
                {chars.map((confused) => {
                  const val = matrix[actual]?.[confused] || 0;
                  const intensity = val / maxValue;

                  return (
                    <div
                      key={confused}
                      className={cn(
                        "w-10 h-10 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[10px] transition-colors",
                        actual === confused
                          ? "bg-slate-50 dark:bg-slate-900"
                          : "",
                      )}
                      style={{
                        backgroundColor:
                          val > 0
                            ? `rgba(99, 102, 241, ${0.1 + intensity * 0.9})`
                            : undefined,
                        color: intensity > 0.5 ? "white" : undefined,
                      }}
                      title={
                        val > 0
                          ? `Confused '${actual}' with '${confused}' ${val} times`
                          : undefined
                      }
                    >
                      {val > 0 ? val : ""}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Low Confusion</span>
            <div className="w-24 h-2 bg-linear-to-r from-indigo-50 to-indigo-600 rounded-full" />
            <span>High Confusion</span>
          </div>
          <div className="italic">Rows: Actual | Cols: Confused with</div>
        </div>
      </CardContent>
    </Card>
  );
}
