"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { useFlashcards } from "@/hooks/useFlashcards";
import { Card as CardType } from "@/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface FlashcardEditorProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<CardType>;
}

export function FlashcardEditor({
  onSuccess,
  onCancel,
  initialData,
}: FlashcardEditorProps) {
  const { createCard, updateCard, loading, error } = useFlashcards();
  const [correctChar, setCorrectChar] = useState(
    initialData?.correct_char || "",
  );
  const [notes, setNotes] = useState(initialData?.notes || "");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_url || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = useCallback(async () => {
    if (!correctChar || (!imageFile && !initialData?.image_url)) {
      alert("Please provide at least the correct character and an image.");
      return;
    }

    const cardData = {
      correct_char: correctChar,
      confused_with: [] as string[],
      tags: [] as string[],
      notes,
      image_url: initialData?.image_url || "",
      box: initialData?.box ?? 1,
    };

    let result;
    if (initialData?.id) {
      result = await updateCard(
        initialData.id,
        cardData,
        imageFile || undefined,
      );
    } else {
      result = await createCard(cardData, imageFile || undefined);
    }

    if (result && onSuccess) {
      onSuccess();
    }
  }, [
    correctChar,
    notes,
    imageFile,
    initialData,
    createCard,
    updateCard,
    onSuccess,
  ]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setImageFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  }, []);

  // Double-Enter to save
  const lastEnterRef = useRef<number>(0);
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      // Don't intercept Enter in textarea (notes field)
      if ((e.target as HTMLElement)?.tagName === "TEXTAREA") return;

      const now = Date.now();
      if (now - lastEnterRef.current < 400) {
        e.preventDefault();
        handleSave();
      }
      lastEnterRef.current = now;
    },
    [handleSave],
  );

  React.useEffect(() => {
    window.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePaste, handleKeyDown]);

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-none bg-transparent lg:bg-white lg:dark:bg-slate-900 lg:border lg:shadow-sm">
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Flashcard" : "Create New Flashcard"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Upload Area */}
        <div className="space-y-2">
          <Label>Reference Image</Label>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden",
              imagePreview
                ? "border-indigo-500 bg-indigo-50/10"
                : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50",
            )}
          >
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-contain p-4"
                  unoptimized={imagePreview.startsWith("http")}
                />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 rounded-full shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-2 text-slate-500">
                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-950 dark:text-white">
                    Click, drag, or paste image
                  </p>
                  <p className="text-sm">
                    PNG, JPG or SVG from your practice sheets
                  </p>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="correct-char">Correct Character / Word</Label>
            <Input
              id="correct-char"
              placeholder="e.g. 'f' or 'Butler'"
              value={correctChar}
              onChange={(e) => setCorrectChar(e.target.value)}
              className="text-lg font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Observations</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this entry..."
              className="h-24 resize-none"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNotes(e.target.value)
              }
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-medium">
            Error: {error}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6 mt-6">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Card
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
