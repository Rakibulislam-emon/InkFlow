"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Loader2, Library } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Flashcard } from "@/components/flashcard/Flashcard";
import { FlashcardEditor } from "@/components/flashcard/FlashcardEditor";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useFlashcards } from "@/hooks/useFlashcards";
import { Card as CardType } from "@/types";
import { cn } from "@/lib/utils";

export default function CardsPage() {
  const { getCards, loading, error } = useFlashcards();
  const [cards, setCards] = useState<CardType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [filterBox, setFilterBox] = useState<number | null>(null);

  const fetchCards = async () => {
    const data = await getCards();
    setCards(data);
  };

  useEffect(() => {
    const fetchCards = async () => {
      const data = await getCards();
      setCards(data);
    };
    fetchCards();
  }, [getCards]);

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.correct_char.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      card.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBox = filterBox === null || card.box === filterBox;

    return matchesSearch && matchesBox;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight">My Cards</h1>
          <p className="text-sm md:text-base text-slate-500">
            Manage your cursive library and track your mastery.
          </p>
        </div>

        <Dialog
          open={isEditorOpen}
          onOpenChange={(open) => {
            setIsEditorOpen(open);
            if (!open) setEditingCard(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 md:h-12 px-6">
              <Plus className="w-5 h-5 mr-2" />
              Add New Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-none shadow-2xl">
            <DialogHeader className="sr-only">
              <DialogTitle>
                {editingCard ? "Edit Card" : "Add Card"}
              </DialogTitle>
            </DialogHeader>
            <FlashcardEditor
              initialData={editingCard || undefined}
              onSuccess={() => {
                setIsEditorOpen(false);
                setEditingCard(null);
                fetchCards();
              }}
              onCancel={() => {
                setIsEditorOpen(false);
                setEditingCard(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search cards..."
            className="pl-10 h-11 md:h-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl overflow-x-auto whitespace-nowrap scrollbar-hide no-scrollbar w-full sm:w-auto shrink-0">
          <Button
            variant={filterBox === null ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterBox(null)}
            className={cn(
              "rounded-xl px-4 h-9",
              filterBox === null
                ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-indigo-600",
            )}
          >
            All
          </Button>
          {[1, 2, 3, 4, 5].map((box) => (
            <Button
              key={box}
              variant={filterBox === box ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterBox(box)}
              className={cn(
                "rounded-xl px-4 h-9",
                filterBox === box
                  ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm transition-all"
                  : "text-slate-500 hover:text-indigo-600",
              )}
            >
              Box {box}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-medium">
            Loading your collection...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-center">
          <p className="text-red-600 font-medium">
            Error loading cards: {error}
          </p>
          <Button variant="outline" className="mt-4" onClick={fetchCards}>
            Try Again
          </Button>
        </div>
      ) : filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <Flashcard
              key={card.id}
              card={card}
              onDelete={fetchCards}
              onEdit={() => {
                setEditingCard(card);
                setIsEditorOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
            <Library className="w-12 h-12 text-slate-400" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold">No cards found</h3>
            <p className="text-slate-500">
              {searchQuery
                ? "We couldn't find any cards matching your search."
                : "Your collection is empty. Start by adding your first cursive flashcard!"}
            </p>
          </div>
          {searchQuery ? (
            <Button variant="ghost" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditorOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Create First Card
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
