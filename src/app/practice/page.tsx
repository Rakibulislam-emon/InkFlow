"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { useFlashcards } from "@/hooks/useFlashcards";
import { Card as CardType } from "@/types";
import { PracticeCanvas } from "@/components/flashcard/PracticeCanvas";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export default function PracticePage() {
  const { getCards } = useFlashcards();
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [practiceMode, setPracticeMode] = useState<"cards" | "free">("cards");

  useEffect(() => {
    getCards().then((data) => {
      setCards(data);
      setLoading(false);
      if (data.length > 0) {
        setSelectedCard(data[0]);
      }
    });
  }, [getCards]);

  const filteredCards = cards.filter(
    (c) =>
      c.correct_char.toLowerCase().includes(search.toLowerCase()) ||
      c.notes?.toLowerCase().includes(search.toLowerCase()) ||
      c.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  const nextCard = () => {
    if (!selectedCard) return;
    const currentIndex = filteredCards.findIndex(
      (c) => c.id === selectedCard.id,
    );
    if (currentIndex < filteredCards.length - 1) {
      setSelectedCard(filteredCards[currentIndex + 1]);
    }
  };

  const prevCard = () => {
    if (!selectedCard) return;
    const currentIndex = filteredCards.findIndex(
      (c) => c.id === selectedCard.id,
    );
    if (currentIndex > 0) {
      setSelectedCard(filteredCards[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practice Zone</h1>
          <p className="text-slate-500">
            {practiceMode === "cards"
              ? "Trace characters from your collection."
              : "Direct practice board for free-writing."}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Button
            variant={practiceMode === "cards" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPracticeMode("cards")}
            className="rounded-xl h-9 px-4"
          >
            My Cards
          </Button>
          <Button
            variant={practiceMode === "free" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPracticeMode("free")}
            className="rounded-xl h-9 px-4"
          >
            Free Board
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Sidebar Selector */}
        <div className="w-full lg:w-72 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          {practiceMode === "cards" ? (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Select a character
                </p>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 h-9 text-xs rounded-xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group",
                      selectedCard?.id === card.id
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border flex-shrink-0 flex items-center justify-center",
                        selectedCard?.id === card.id
                          ? "border-white/20"
                          : "border-slate-200 dark:border-slate-700",
                      )}
                    >
                      {card.image_url ? (
                        <img
                          src={card.image_url}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xl font-cursive">
                          {card.correct_char}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{card.correct_char}</p>
                      <p
                        className={cn(
                          "text-xs truncate",
                          selectedCard?.id === card.id
                            ? "text-indigo-100"
                            : "text-slate-500",
                        )}
                      >
                        Box {card.box}
                      </p>
                    </div>
                  </button>
                ))}

                {filteredCards.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No characters found.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-6 space-y-6">
              <div className="p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">
                  Free Style
                </p>
                <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed mt-2 italic">
                  "Write anything you want here. Perfect for signatures, full
                  words, or just doodling your flow."
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Board Features
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    Ruled notebook lines
                  </div>
                  <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    Infinite drawing space
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Practice Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative shadow-sm">
          {practiceMode === "cards" && selectedCard ? (
            <>
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 z-10">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevCard}
                    disabled={filteredCards.indexOf(selectedCard) === 0}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="px-3">
                    <span className="text-sm font-medium">Practice: </span>
                    <span className="text-xl font-bold font-cursive">
                      {selectedCard.correct_char}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextCard}
                    disabled={
                      filteredCards.indexOf(selectedCard) ===
                      filteredCards.length - 1
                    }
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Focus Mode
                  </Button>
                </div>
              </div>

              {/* Canvas Container */}
              <div className="flex-1 relative bg-slate-50 dark:bg-[#020617] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                  <div className="w-full h-full max-w-2xl p-12">
                    {selectedCard.image_url ? (
                      <img
                        src={selectedCard.image_url}
                        alt=""
                        className="w-full h-full object-contain grayscale brightness-125 dark:invert"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-[20rem] font-cursive select-none">
                        {selectedCard.correct_char}
                      </div>
                    )}
                  </div>
                </div>

                <PracticeCanvas
                  key={selectedCard.id}
                  className="w-full h-full"
                />
              </div>
            </>
          ) : (
            <>
              {/* Toolbar Free */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 z-10">
                <div className="px-3">
                  <span className="text-sm font-medium">Free Board: </span>
                  <span className="text-lg font-bold text-slate-400">
                    Direct Handwriting
                  </span>
                </div>
              </div>

              {/* Canvas Container Free */}
              <div className="flex-1 relative bg-white dark:bg-[#020617] overflow-hidden">
                {/* Rule lines */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.1]">
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage:
                        "linear-gradient(#000 1px, transparent 1px)",
                      backgroundSize: "100% 40px",
                    }}
                  />
                </div>

                <PracticeCanvas key="free-board" className="w-full h-full" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
