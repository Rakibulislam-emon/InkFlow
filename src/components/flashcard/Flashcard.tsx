"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Card as CardType } from "@/types";
import { cn } from "@/lib/utils";
import {
  Maximize2,
  RotateCcw,
  Trash2,
  Loader2,
  PenTool,
  X as CloseIcon,
  ArrowLeftRight,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { useFlashcards } from "@/hooks/useFlashcards";
import { PracticeCanvas } from "./PracticeCanvas";
import { getConfusionGroupForChar } from "@/lib/confusion-groups";

interface FlashcardProps {
  card: CardType;
  className?: string;
  isFlipped?: boolean;
  onFlip?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function Flashcard({
  card,
  className,
  isFlipped: controlledIsFlipped,
  onFlip,
  onDelete,
  onEdit,
}: FlashcardProps) {
  const [localIsFlipped, setLocalIsFlipped] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const { deleteCard, loading: isDeleting } = useFlashcards();

  const isFlipped =
    controlledIsFlipped !== undefined ? controlledIsFlipped : localIsFlipped;
  const toggleFlip = () => {
    if (isPracticeMode) return; // Prevent flip while practicing
    if (onFlip) {
      onFlip();
    } else {
      setLocalIsFlipped(!localIsFlipped);
    }
  };

  const togglePracticeMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPracticeMode(!isPracticeMode);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this card?")) {
      const success = await deleteCard(card.id, card.image_url);
      if (success && onDelete) {
        onDelete();
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  return (
    <div
      className={cn(
        "group perspective-1000 w-full h-[320px] md:h-[400px] cursor-pointer",
        className,
      )}
      onClick={toggleFlip}
    >
      <div
        className={cn(
          "relative w-full h-full flashcard-inner",
          isFlipped ? "flashcard-flip" : "",
        )}
      >
        {/* Front Side: Image */}
        <div className="absolute inset-0 flashcard-front">
          <Card className="w-full h-full overflow-hidden border-2 hover:border-indigo-500 transition-colors bg-white dark:bg-slate-900 shadow-lg relative">
            {/* Practice Mode Overlay */}
            {isPracticeMode && (
              <div className="absolute inset-0 z-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-[1px]">
                <PracticeCanvas />
              </div>
            )}

            <CardContent className="p-0 h-full flex flex-col">
              <div className="relative flex-1 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
                {card.image_url ? (
                  <Image
                    src={card.image_url}
                    alt="Flashcard reference"
                    fill
                    className={cn(
                      "object-contain p-6 transition-opacity",
                      isPracticeMode ? "opacity-50" : "opacity-100",
                    )}
                    unoptimized={card.image_url.includes("supabase.co")}
                  />
                ) : (
                  <div className="text-slate-400 italic">
                    No image available
                  </div>
                )}

                {/* Top Controls */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant={isPracticeMode ? "default" : "secondary"}
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-full shadow-lg z-30 transition-all",
                      isPracticeMode
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-white/90 dark:bg-slate-800/90",
                    )}
                    onClick={togglePracticeMode}
                    title={
                      isPracticeMode ? "Exit Practice" : "Practice Tracing"
                    }
                  >
                    {isPracticeMode ? (
                      <CloseIcon className="w-4 h-4 text-white" />
                    ) : (
                      <PenTool className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    )}
                  </Button>

                  {!isPracticeMode && (
                    <div className="text-slate-400 group-hover:text-indigo-500 transition-colors bg-white/90 dark:bg-slate-800/90 p-2 rounded-full shadow-sm">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 z-10">
                  {card.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="h-16 bg-white dark:bg-slate-900 border-t flex items-center justify-center">
                <span className="text-sm font-medium text-slate-500">
                  {isPracticeMode
                    ? "Tracing practice active"
                    : "Tap to reveal transcription"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back Side: Transcription & Details */}
        <div className="absolute inset-0 flashcard-back">
          <Card className="w-full h-full border-2 border-indigo-500 bg-white dark:bg-slate-900 shadow-xl overflow-y-auto relative">
            {/* Delete button on the back */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors rounded-full"
                onClick={handleEdit}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors rounded-full"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>

            <CardContent className="h-full flex flex-col p-8 items-center justify-center text-center space-y-6">
              <div className="space-y-2">
                <div className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
                  Transcription
                </div>
                <div className="text-6xl font-bold italic font-serif">
                  {card.correct_char}
                </div>
              </div>

              {card.confused_with && card.confused_with.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-400">
                    Commonly confused with:
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {card.confused_with.map((char) => (
                      <Badge
                        key={char}
                        variant="destructive"
                        className="text-lg py-1 px-3"
                      >
                        {char}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {card.notes && (
                <div className="max-w-md p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-300 italic">
                  &ldquo;{card.notes}&rdquo;
                </div>
              )}

              {getConfusionGroupForChar(card.correct_char) && (
                <div className="pt-2">
                  <Link href={`/compare?cardId=${card.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      <ArrowLeftRight className="w-4 h-4 mr-2" />
                      Compare with Similar
                    </Button>
                  </Link>
                </div>
              )}

              <div className="pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 transition-colors hover:text-indigo-500"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tap to see image again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
