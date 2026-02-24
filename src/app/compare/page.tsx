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
  X,
  BarChart3,
} from "lucide-react";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Card as CardType } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ComparisonPair {
  id: string;
  title: string;
  leftCard: CardType | null;
  rightCard: CardType | null;
  leftNotes: string;
  rightNotes: string;
  showNotes: boolean;
}

interface WorkbenchPair {
  id: string;
  title: string;
  leftCardId: string | null;
  rightCardId: string | null;
  leftNotes: string;
  rightNotes: string;
  showNotes: boolean;
}

function CompareContent() {
  const searchParams = useSearchParams();
  const initialCardId = searchParams.get("cardId");

  const { getCards, updateCard, loading: actionLoading } = useFlashcards();
  const { getPreferences, updatePreferences } = useUserPreferences();
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  const [pairs, setPairs] = useState<ComparisonPair[]>([
    {
      id: crypto.randomUUID(),
      title: "",
      leftCard: null,
      rightCard: null,
      leftNotes: "",
      rightNotes: "",
      showNotes: false,
    },
  ]);
  const [activeTarget, setActiveTarget] = useState<{
    pairId: string;
    slot: "left" | "right";
  } | null>(null);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const updatePair = useCallback(
    (pairId: string, updates: Partial<ComparisonPair>) => {
      setPairs((prev) =>
        prev.map((p) => (p.id === pairId ? { ...p, ...updates } : p)),
      );
    },
    [],
  );

  const addPair = () => {
    setPairs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "",
        leftCard: null,
        rightCard: null,
        leftNotes: "",
        rightNotes: "",
        showNotes: false,
      },
    ]);
  };

  const removePair = (pairId: string) => {
    if (pairs.length <= 1) return;
    setPairs((prev) => prev.filter((p) => p.id !== pairId));
  };

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      const [data, prefs] = await Promise.all([getCards(), getPreferences()]);
      if (cancelled) return;
      setCards(data);
      setLoading(false);

      if (initialCardId && data.length > 0) {
        const initial = data.find((c) => c.id === initialCardId);
        if (initial) {
          setPairs((prev) => [
            {
              ...prev[0],
              leftCard: initial,
              leftNotes: initial.notes || "",
            },
          ]);
        }
      } else if (prefs && data.length > 0) {
        // Restore Workbench State
        if (
          prefs.comparison_workbench &&
          Array.isArray(prefs.comparison_workbench) &&
          prefs.comparison_workbench.length > 0
        ) {
          const restoredPairs = (
            prefs.comparison_workbench as WorkbenchPair[]
          ).map((p) => ({
            id: p.id || crypto.randomUUID(),
            title: p.title || "",
            leftCard: data.find((c) => c.id === p.leftCardId) || null,
            rightCard: data.find((c) => c.id === p.rightCardId) || null,
            leftNotes: p.leftNotes || "",
            rightNotes: p.rightNotes || "",
            showNotes: p.showNotes || false,
          }));
          setPairs(restoredPairs);
        } else {
          // Fallback to legacy single-pair prefs
          let left = null,
            right = null;
          if (prefs.last_compare_left_id) {
            left =
              data.find((c) => c.id === prefs.last_compare_left_id) || null;
          }
          if (prefs.last_compare_right_id) {
            right =
              data.find((c) => c.id === prefs.last_compare_right_id) || null;
          }

          if (left || right) {
            setPairs((prev) => [
              {
                ...prev[0],
                leftCard: left,
                leftNotes: left?.notes || "",
                rightCard: right,
                rightNotes: right?.notes || "",
              },
            ]);
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

  // Persistent Workbench Sync
  useEffect(() => {
    if (loading) return;

    const timeoutId = setTimeout(() => {
      const workbenchState = pairs.map((p) => ({
        id: p.id,
        title: p.title,
        leftCardId: p.leftCard?.id || null,
        rightCardId: p.rightCard?.id || null,
        leftNotes: p.leftNotes,
        rightNotes: p.rightNotes,
        showNotes: p.showNotes,
      }));

      updatePreferences({
        comparison_workbench: workbenchState,
        // Keep legacy fields in sync for the first pair
        last_compare_left_id: pairs[0]?.leftCard?.id || null,
        last_compare_right_id: pairs[0]?.rightCard?.id || null,
      });
    }, 1000); // 1s debounce

    return () => clearTimeout(timeoutId);
  }, [pairs, loading, updatePreferences]);

  const fetchCards = useCallback(async () => {
    const data = await getCards();
    setCards(data);
  }, [getCards]);

  const handleSaveNotes = async (pairId: string) => {
    const pair = pairs.find((p) => p.id === pairId);
    if (!pair) return;

    setSaveStatus("saving");
    try {
      if (pair.leftCard)
        await updateCard(pair.leftCard.id, { notes: pair.leftNotes });
      if (pair.rightCard)
        await updateCard(pair.rightCard.id, { notes: pair.rightNotes });

      await fetchCards();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  };

  const swapCards = (pairId: string) => {
    setPairs((prev) =>
      prev.map((p) =>
        p.id === pairId
          ? {
              ...p,
              leftCard: p.rightCard,
              rightCard: p.leftCard,
              leftNotes: p.rightNotes,
              rightNotes: p.leftNotes,
            }
          : p,
      ),
    );
  };

  const clearSlots = async (pairId: string) => {
    updatePair(pairId, {
      leftCard: null,
      rightCard: null,
      leftNotes: "",
      rightNotes: "",
    });
    // For now we only persist for the first pair or just clear global prefs
    if (pairs[0].id === pairId) {
      await updatePreferences({
        last_compare_left_id: null,
        last_compare_right_id: null,
      });
    }
  };

  const setCardAtTarget = useCallback(
    (card: CardType | null) => {
      if (!activeTarget) return;
      const { pairId, slot } = activeTarget;
      setPairs((prev) =>
        prev.map((p) => {
          if (p.id === pairId) {
            if (slot === "left") {
              return {
                ...p,
                leftCard: card,
                leftNotes: card?.notes || "",
                showNotes: card?.notes ? true : p.showNotes,
              };
            } else {
              return {
                ...p,
                rightCard: card,
                rightNotes: card?.notes || "",
                showNotes: card?.notes ? true : p.showNotes,
              };
            }
          }
          return p;
        }),
      );
      // Persist to global prefs only for the first pair (or we could store all)
      if (activeTarget.pairId === pairs[0].id) {
        updatePreferences({
          [slot === "left" ? "last_compare_left_id" : "last_compare_right_id"]:
            card?.id || null,
        });
      }
      setActiveTarget(null);
    },
    [activeTarget, pairs, updatePreferences],
  );

  const scrollToPair = (pairId: string) => {
    const element = document.getElementById(`pair-${pairId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("pulse-highlight");
      setTimeout(() => element.classList.remove("pulse-highlight"), 2000);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Comparison Lab</h1>
          <p className="text-slate-500">
            Compare multiple pairs side-by-side to master subtle differences.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={addPair}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 h-9"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Pair
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Browser */}
        <div className="w-full lg:w-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shrink-0 h-80 lg:h-[700px]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/50">
            {activeTarget ? (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 animate-pulse">
                <p className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                  Targeting {activeTarget.slot.toUpperCase()} Slot
                </p>
                <p className="text-[11px] text-indigo-500">Pick a card below</p>
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Select Cards
              </p>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {filteredCards.length > 0 ? (
              filteredCards.map((card) => {
                const usageCount = pairs.filter(
                  (p) =>
                    p.leftCard?.id === card.id || p.rightCard?.id === card.id,
                ).length;

                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      if (activeTarget) {
                        setCardAtTarget(card);
                      } else if (usageCount > 0) {
                        const firstPair = pairs.find(
                          (p) =>
                            p.leftCard?.id === card.id ||
                            p.rightCard?.id === card.id,
                        );
                        if (firstPair) scrollToPair(firstPair.id);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-2xl cursor-pointer transition-all border",
                      activeTarget
                        ? "hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                        : usageCount > 0
                          ? "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent",
                    )}
                  >
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
                      <Image
                        src={card.image_url}
                        alt={card.correct_char}
                        fill
                        className="object-cover"
                      />
                      {usageCount > 0 && (
                        <div className="absolute top-0 right-0 p-0.5 bg-indigo-600 rounded-bl-lg shadow-sm">
                          <PlusCircle className="w-2.5 h-2.5 text-white transform rotate-45" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-bold truncate tracking-tight dark:text-slate-200 capitalize">
                          {card.correct_char}
                        </p>
                        {usageCount > 0 && (
                          <span className="text-[9px] font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full shrink-0">
                            IN {usageCount}{" "}
                            {usageCount === 1 ? "PAIR" : "PAIRS"}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {card.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-slate-400 truncate max-w-15"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No matches found
              </div>
            )}
          </div>
        </div>

        {/* Comparison Area */}
        <div className="flex-1">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 items-start">
            {pairs.map((pair, index) => (
              <div
                key={pair.id}
                id={`pair-${pair.id}`}
                className={cn(
                  "space-y-4 animate-in zoom-in-95 duration-300 p-6 rounded-[2.5rem] border bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all",
                  pair.id === activeTarget?.pairId
                    ? "border-indigo-500/50 shadow-2xl shadow-indigo-500/10"
                    : "border-slate-200 dark:border-slate-800 shadow-sm",
                )}
              >
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={pair.title}
                      onChange={(e) =>
                        updatePair(pair.id, { title: e.target.value })
                      }
                      placeholder="Comparison Set Name..."
                      className="bg-transparent border-none focus:ring-0 outline-none p-0 px-1 -ml-1 text-sm font-bold tracking-tight uppercase text-slate-600 dark:text-slate-400 placeholder:text-slate-300 dark:placeholder:text-slate-700 w-full transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => swapCards(pair.id)}
                      className="h-8 w-8 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      title="Swap Sides"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => clearSlots(pair.id)}
                      className="h-8 w-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Reset Pair"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updatePair(pair.id, { showNotes: !pair.showNotes })
                      }
                      className={cn(
                        "h-8 w-8 rounded-full transition-colors",
                        pair.showNotes
                          ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
                          : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
                      )}
                      title="Toggle Insights"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                    </Button>
                    {pairs.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePair(pair.id)}
                        className="h-8 w-8 rounded-full text-slate-400 hover:text-red-600"
                        title="Remove Pair"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Left Slot */}
                  <div
                    className={cn(
                      "flex flex-col gap-2 group cursor-pointer transition-all",
                      activeTarget?.pairId === pair.id &&
                        activeTarget?.slot === "left" &&
                        "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#020617] rounded-3xl",
                    )}
                    onClick={() =>
                      setActiveTarget({ pairId: pair.id, slot: "left" })
                    }
                  >
                    {pair.leftCard ? (
                      <div className="aspect-square bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm relative group-hover:border-indigo-500/50 group-hover:shadow-md transition-all">
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-indigo-600 text-[8px] font-black text-white z-10 shadow-sm leading-none">
                          L
                        </div>
                        <div className="absolute top-2 right-2 text-[10px] font-black uppercase text-slate-300">
                          {pair.leftCard.correct_char}
                        </div>
                        <div className="flex-1 relative bg-slate-50/5 dark:bg-slate-900/5 flex items-center justify-center p-4">
                          <Image
                            src={pair.leftCard.image_url}
                            alt={pair.leftCard.correct_char}
                            fill
                            className="object-contain pointer-events-none grayscale dark:invert p-4 drop-shadow-lg"
                            unoptimized={pair.leftCard.image_url.includes(
                              "supabase.co",
                            )}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/10 flex flex-col items-center justify-center text-slate-400 gap-2 group-hover:bg-indigo-50/5 dark:group-hover:bg-indigo-900/5 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                        <p className="text-[10px] font-bold uppercase tracking-tighter">
                          Pick Left
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Slot */}
                  <div
                    className={cn(
                      "flex flex-col gap-2 group cursor-pointer transition-all",
                      activeTarget?.pairId === pair.id &&
                        activeTarget?.slot === "right" &&
                        "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#020617] rounded-3xl",
                    )}
                    onClick={() =>
                      setActiveTarget({ pairId: pair.id, slot: "right" })
                    }
                  >
                    {pair.rightCard ? (
                      <div className="aspect-square bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm relative group-hover:border-indigo-500/50 group-hover:shadow-md transition-all">
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-indigo-600 text-[8px] font-black text-white z-10 shadow-sm leading-none">
                          R
                        </div>
                        <div className="absolute top-2 left-2 text-[10px] font-black uppercase text-slate-300">
                          {pair.rightCard.correct_char}
                        </div>
                        <div className="flex-1 relative bg-slate-50/5 dark:bg-slate-900/5 flex items-center justify-center p-4">
                          <Image
                            src={pair.rightCard.image_url}
                            alt={pair.rightCard.correct_char}
                            fill
                            className="object-contain pointer-events-none grayscale dark:invert p-4 drop-shadow-lg"
                            unoptimized={pair.rightCard.image_url.includes(
                              "supabase.co",
                            )}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/10 flex flex-col items-center justify-center text-slate-400 gap-2 group-hover:bg-indigo-50/5 dark:group-hover:bg-indigo-900/5 transition-all">
                        <ArrowRight className="w-4 h-4" />
                        <p className="text-[10px] font-bold uppercase tracking-tighter">
                          Pick Right
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Collapsible Notes Area */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    pair.showNotes
                      ? "max-h-96 opacity-100 mt-2"
                      : "max-h-0 opacity-0",
                  )}
                >
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500/70">
                        Contrast Insights
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveNotes(pair.id)}
                        disabled={actionLoading || saveStatus !== "idle"}
                        className="h-6 px-3 rounded-lg text-[9px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                      >
                        {saveStatus === "saving" ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin mr-1.5" />
                        ) : saveStatus === "saved" ? (
                          <CheckCircle2 className="w-2.5 h-2.5 mr-1.5" />
                        ) : (
                          <Save className="w-2.5 h-2.5 mr-1.5" />
                        )}
                        {saveStatus === "saving"
                          ? "Saving"
                          : saveStatus === "saved"
                            ? "Saved"
                            : "Save Changes"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 ml-1">
                          Notes for {pair.leftCard?.correct_char || "Left"}
                        </p>
                        <Textarea
                          value={pair.leftNotes}
                          onChange={(e) =>
                            updatePair(pair.id, { leftNotes: e.target.value })
                          }
                          placeholder="Unique traits..."
                          className="min-h-20 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[11px] leading-relaxed p-3 focus:ring-1 ring-indigo-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 ml-1">
                          Notes for {pair.rightCard?.correct_char || "Right"}
                        </p>
                        <Textarea
                          value={pair.rightNotes}
                          onChange={(e) =>
                            updatePair(pair.id, { rightNotes: e.target.value })
                          }
                          placeholder="Differentiating cues..."
                          className="min-h-20 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[11px] leading-relaxed p-3 focus:ring-1 ring-indigo-500/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
