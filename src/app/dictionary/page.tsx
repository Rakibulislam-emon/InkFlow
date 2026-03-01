"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Loader2, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Flashcard } from "@/components/flashcard/Flashcard";
import { Pagination } from "@/components/ui/Pagination";
import { useFlashcards } from "@/hooks/useFlashcards";
import { Card as CardType } from "@/types";
import { cn } from "@/lib/utils";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const CARDS_PER_PAGE = 12;

export default function DictionaryPage() {
  const { getCards, loading, error } = useFlashcards();
  const [cards, setCards] = useState<CardType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCards = async () => {
      const data = await getCards();
      setCards(data);
    };
    fetchCards();
  }, [getCards]);

  // Group all cards by first letter (for showing counts on the A-Z bar)
  const allGroupedCards = useMemo(() => {
    const searchFiltered = cards.filter((card) => {
      if (!searchQuery) return true;
      return card.correct_char
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    });

    const groups: Record<string, CardType[]> = {};
    for (const letter of ALPHABET) {
      groups[letter] = [];
    }
    groups["#"] = [];

    for (const card of searchFiltered) {
      const firstChar = card.correct_char.charAt(0).toUpperCase();
      if (ALPHABET.includes(firstChar)) {
        groups[firstChar].push(card);
      } else {
        groups["#"].push(card);
      }
    }

    return groups;
  }, [cards, searchQuery]);

  // Letters that have cards
  const lettersWithCards = useMemo(() => {
    const set = new Set<string>();
    for (const [letter, letterCards] of Object.entries(allGroupedCards)) {
      if (letterCards.length > 0) set.add(letter);
    }
    return set;
  }, [allGroupedCards]);

  // Filtered cards based on active letter selection
  const displayCards = useMemo(() => {
    if (activeLetter) {
      return allGroupedCards[activeLetter] || [];
    }
    // When no letter is selected, show all cards that match the search
    return Object.values(allGroupedCards).flat();
  }, [allGroupedCards, activeLetter]);

  const totalPages = Math.ceil(displayCards.length / CARDS_PER_PAGE);
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    return displayCards.slice(start, start + CARDS_PER_PAGE);
  }, [displayCards, currentPage]);

  const handleLetterClick = (letter: string) => {
    if (activeLetter === letter) {
      // Clicking the same letter again deselects it (show all)
      setActiveLetter(null);
    } else {
      setActiveLetter(letter);
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-1 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Dictionary</h1>
        <p className="text-sm md:text-base text-slate-500">
          Browse your cursive reference library from A to Z.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by character, tag, or notes..."
          className="pl-10 h-11 md:h-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* A-Z Navigation Strip */}
      <div className="sticky top-0 md:top-0 z-20 bg-slate-50/95 dark:bg-[#020617]/95 backdrop-blur-sm py-3 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex flex-wrap gap-1 justify-center">
          {/* "All" button */}
          <button
            onClick={() => {
              setActiveLetter(null);
              setCurrentPage(1);
            }}
            className={cn(
              "h-9 px-3 rounded-lg text-sm font-bold transition-all duration-200",
              activeLetter === null
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 shadow-sm hover:shadow-md hover:scale-105",
            )}
          >
            All
          </button>

          {ALPHABET.map((letter) => {
            const hasCards = lettersWithCards.has(letter);
            const count = allGroupedCards[letter]?.length || 0;
            return (
              <button
                key={letter}
                onClick={() => hasCards && handleLetterClick(letter)}
                disabled={!hasCards}
                className={cn(
                  "w-9 h-9 rounded-lg text-sm font-bold transition-all duration-200 relative",
                  hasCards
                    ? activeLetter === letter
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm hover:shadow-md hover:scale-105"
                    : "bg-slate-100 dark:bg-slate-800/30 text-slate-300 dark:text-slate-700 cursor-not-allowed",
                )}
                title={
                  hasCards
                    ? `${letter} — ${count} cards`
                    : `${letter} — no cards`
                }
              >
                {letter}
                {hasCards && count > 0 && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center",
                      activeLetter === letter
                        ? "bg-white text-indigo-600"
                        : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400",
                    )}
                  >
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>
            );
          })}
          {lettersWithCards.has("#") && (
            <button
              onClick={() => handleLetterClick("#")}
              className={cn(
                "w-9 h-9 rounded-lg text-sm font-bold transition-all duration-200",
                activeLetter === "#"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 shadow-sm hover:shadow-md hover:scale-105",
              )}
            >
              #
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-medium">
            Loading your dictionary...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-center">
          <p className="text-red-600 font-medium">
            Error loading cards: {error}
          </p>
        </div>
      ) : displayCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
            <BookOpen className="w-12 h-12 text-slate-400" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold">No entries found</h3>
            <p className="text-slate-500">
              {searchQuery
                ? "No cards match your search. Try a different query."
                : activeLetter
                  ? `No cards starting with "${activeLetter}". Try another letter.`
                  : "Your dictionary is empty. Add cards from the My Cards page to get started!"}
            </p>
          </div>
          {(searchQuery || activeLetter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveLetter(null);
                setCurrentPage(1);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Results Header */}
          <div className="flex items-center gap-4">
            {activeLetter && (
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-2xl font-black text-white">
                  {activeLetter}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-500">
                {activeLetter
                  ? `Showing ${displayCards.length} ${displayCards.length === 1 ? "card" : "cards"} starting with "${activeLetter}"`
                  : `Showing all ${displayCards.length} ${displayCards.length === 1 ? "card" : "cards"}`}
              </p>
            </div>
            {activeLetter && (
              <div className="flex-1 h-px bg-linear-to-r from-slate-200 dark:from-slate-800 to-transparent" />
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCards.map((card) => (
              <Flashcard key={card.id} card={card} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}
    </div>
  );
}
