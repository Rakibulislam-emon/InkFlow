"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  ArrowLeftRight,
  RotateCcw,
  Save,
  CheckCircle2,
  Search,
  ArrowLeft,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Card as CardType } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import Image from "next/image";

function CompareContent() {
  const searchParams = useSearchParams();
  const initialCardId = searchParams.get("cardId");

  const { getCards, updateCard, loading: actionLoading } = useFlashcards();
  const { getPreferences, updatePreferences } = useUserPreferences();
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  const [leftCard, setLeftCardRaw] = useState<CardType | null>(null);
  const [rightCard, setRightCardRaw] = useState<CardType | null>(null);

  const [leftNotes, setLeftNotes] = useState("");
  const [rightNotes, setRightNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const [searchQuery, setSearchQuery] = useState("");

  // Wrapper functions that also sync notes + persist to Supabase
  const setLeftCard = useCallback(
    (card: CardType | null) => {
      setLeftCardRaw(card);
      setLeftNotes(card?.notes || "");
      updatePreferences({ last_compare_left_id: card?.id || null });
    },
    [updatePreferences],
  );

  const setRightCard = useCallback(
    (card: CardType | null) => {
      setRightCardRaw(card);
      setRightNotes(card?.notes || "");
      updatePreferences({ last_compare_right_id: card?.id || null });
    },
    [updatePreferences],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      const [data, prefs] = await Promise.all([getCards(), getPreferences()]);
      if (cancelled) return;
      setCards(data);
      setLoading(false);

      // URL parameter takes precedence
      if (initialCardId && data.length > 0) {
        const initial = data.find((c) => c.id === initialCardId);
        if (initial) {
          setLeftCardRaw(initial);
          setLeftNotes(initial.notes || "");
        }
      }
      // Otherwise restore from Supabase
      else if (prefs && data.length > 0) {
        if (prefs.last_compare_left_id) {
          const left = data.find((c) => c.id === prefs.last_compare_left_id);
          if (left) {
            setLeftCardRaw(left);
            setLeftNotes(left.notes || "");
          }
        }
        if (prefs.last_compare_right_id) {
          const right = data.find((c) => c.id === prefs.last_compare_right_id);
          if (right) {
            setRightCardRaw(right);
            setRightNotes(right.notes || "");
          }
        }
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [getCards, getPreferences, initialCardId]);

  const filteredCards = useMemo(() => {
    return cards.filter(
      (card) =>
        card.correct_char.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
  }, [cards, searchQuery]);

  const fetchCards = useCallback(async () => {
    const data = await getCards();
    setCards(data);
  }, [getCards]);

  const handleSaveNotes = async () => {
    setSaveStatus("saving");
    try {
      if (leftCard) await updateCard(leftCard.id, { notes: leftNotes });
      if (rightCard) await updateCard(rightCard.id, { notes: rightNotes });

      await fetchCards();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  };

  const swapCards = () => {
    const temp = leftCard;
    setLeftCard(rightCard);
    setRightCard(temp);
  };

  const clearSlots = async () => {
    setLeftCard(null);
    setRightCard(null);
    await updatePreferences({
      last_compare_left_id: null,
      last_compare_right_id: null,
    });
  };

  if (loading && cards.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manual Comparison
          </h1>
          <p className="text-slate-500">
            Pick any two cards to compare them side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={clearSlots}
            className="rounded-2xl border-slate-200 dark:border-slate-800 h-9"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button
            onClick={swapCards}
            disabled={!leftCard && !rightCard}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 h-9"
          >
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Swap
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Browser */}
        <div className="w-full lg:w-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shrink-0 h-80 lg:h-[700px]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Select Cards
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search letter or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {filteredCards.length > 0 ? (
              filteredCards.map((card) => (
                <div
                  key={card.id}
                  className={cn(
                    "group p-3 rounded-2xl border border-transparent transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    (leftCard?.id === card.id || rightCard?.id === card.id) &&
                      "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30",
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 relative overflow-hidden flex items-center justify-center shrink-0">
                      <Image
                        src={card.image_url}
                        alt={card.correct_char}
                        fill
                        className="object-contain p-2 grayscale dark:invert"
                        unoptimized={card.image_url.includes("supabase.co")}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest">
                        {card.correct_char}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        #{card.tags?.[0] || "untagged"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLeftCard(card)}
                      className="text-[10px] h-7 rounded-xl flex items-center gap-1 border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    >
                      <ArrowLeft className="w-3 h-3" /> Left
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRightCard(card)}
                      className="text-[10px] h-7 rounded-xl flex items-center gap-1 border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    >
                      Right <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No cards matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>

        {/* Comparison Area */}
        <div className="flex-1 flex flex-col gap-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Slot */}
            <div className="flex flex-col gap-4">
              {leftCard ? (
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-indigo-500/30 dark:border-indigo-500/20 flex flex-col overflow-hidden shadow-sm relative">
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold text-white z-10 shadow-lg">
                    LEFT
                  </div>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <span className="text-sm font-bold uppercase text-slate-400 tracking-widest ml-12">
                      {leftCard.correct_char}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setLeftCard(null)}
                    >
                      <PlusCircle className="w-4 h-4 text-slate-400 rotate-45" />
                    </Button>
                  </div>
                  <div className="relative bg-slate-50/30 dark:bg-[#020617]/30 flex items-center justify-center p-6 h-64 md:h-80 lg:h-96">
                    <Image
                      src={leftCard.image_url}
                      alt={leftCard.correct_char}
                      fill
                      className="object-contain pointer-events-none drop-shadow-2xl grayscale brightness-110 dark:invert p-6"
                      unoptimized={leftCard.image_url.includes("supabase.co")}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-64 md:h-80 lg:h-96 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/10 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium">
                    Select a card for the Left Slot
                  </p>
                </div>
              )}
            </div>

            {/* Right Slot */}
            <div className="flex flex-col gap-4">
              {rightCard ? (
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-indigo-500/30 dark:border-indigo-500/20 flex flex-col overflow-hidden shadow-sm relative">
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold text-white z-10 shadow-lg">
                    RIGHT
                  </div>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <span className="text-sm font-bold uppercase text-slate-400 tracking-widest">
                      {rightCard.correct_char}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setRightCard(null)}
                    >
                      <PlusCircle className="w-4 h-4 text-slate-400 rotate-45" />
                    </Button>
                  </div>
                  <div className="relative bg-slate-50/30 dark:bg-[#020617]/30 flex items-center justify-center p-6 h-64 md:h-80 lg:h-96">
                    <Image
                      src={rightCard.image_url}
                      alt={rightCard.correct_char}
                      fill
                      className="object-contain pointer-events-none drop-shadow-2xl grayscale brightness-110 dark:invert p-6"
                      unoptimized={rightCard.image_url.includes("supabase.co")}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-64 md:h-80 lg:h-96 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/10 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium">
                    Select a card for the Right Slot
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-lg font-bold">Comparison Notes</h3>
                <p className="text-xs text-slate-500">
                  Document the differences to help your recognition.
                </p>
              </div>
              <Button
                onClick={handleSaveNotes}
                disabled={
                  actionLoading ||
                  saveStatus !== "idle" ||
                  (!leftCard && !rightCard)
                }
                className={cn(
                  "rounded-2xl px-6 transition-all w-full sm:w-auto",
                  saveStatus === "saved"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-indigo-600 hover:bg-indigo-700",
                )}
              >
                {saveStatus === "saving" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : saveStatus === "saved" ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "saved"
                    ? "Saved!"
                    : "Save Differences"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Notes for {leftCard?.correct_char || "Left"}
                </label>
                <Textarea
                  value={leftNotes}
                  onChange={(e) => setLeftNotes(e.target.value)}
                  placeholder="Describe the unique features of this letter..."
                  className="min-h-32 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Notes for {rightCard?.correct_char || "Right"}
                </label>
                <Textarea
                  value={rightNotes}
                  onChange={(e) => setRightNotes(e.target.value)}
                  placeholder="Describe how this differs from the other..."
                  className="min-h-32 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
