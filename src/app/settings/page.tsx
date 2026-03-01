"use client";

import React, { useState } from "react";
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/Card";
import { useFlashcards } from "@/hooks/useFlashcards";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { getCards } = useFlashcards();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const cards = await getCards();
      const dataStr = JSON.stringify(cards, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `scriptclear-backup-${new Date().toISOString().split("T")[0]}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      setMessage({
        type: "success",
        text: "Export successful! Your backup is downloading.",
      });
    } catch (err) {
      console.error("Export failed:", err);
      setMessage({ type: "error", text: "Failed to export data." });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const importedCards = JSON.parse(content);

          if (!Array.isArray(importedCards)) {
            throw new Error("Invalid format: Expected an array of cards.");
          }

          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error("Authentication required for import.");

          let successCount = 0;
          for (const cardData of importedCards) {
            if (!cardData.correct_char) continue;

            const { error } = await supabase.from("cards").insert({
              correct_char: cardData.correct_char,
              confused_with: cardData.confused_with || [],
              image_url: cardData.image_url,
              notes: cardData.notes || "",
              tags: cardData.tags || [],
              user_id: user.id,
              box: cardData.box || 1,
              next_review: cardData.next_review || new Date().toISOString(),
              correct_count: cardData.correct_count || 0,
              incorrect_count: cardData.incorrect_count || 0,
            });

            if (!error) successCount++;
          }

          setMessage({
            type: "success",
            text: `Import complete! Successfully added ${successCount} cards.`,
          });
        } catch (err) {
          console.error("Import parsing error:", err);
          setMessage({
            type: "error",
            text: "Failed to parse import file. Ensure it's a valid JSON.",
          });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error("File reading error:", err);
      setMessage({ type: "error", text: "Failed to read the file." });
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "CRITICAL: This will permanently delete ALL your cards and progress. This cannot be undone. Are you sure?",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required.");

      const { error } = await supabase
        .from("cards")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Application reset successful. All data cleared.",
      });
    } catch (err) {
      console.error("Reset failed:", err);
      setMessage({ type: "error", text: "Failed to reset application data." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500">
          Manage your data and application preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              <CardTitle>Data Portability</CardTitle>
            </div>
            <CardDescription>
              Export your cards to a JSON file for backup, or import cards from
              a previous backup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleExport}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export JSON Backup
              </Button>

              <div className="flex-1 relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={loading}
                />
                <Button variant="outline" disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Import from JSON
                </Button>
              </div>
            </div>

            {message && (
              <div
                className={cn(
                  "p-4 rounded-xl flex items-start gap-3 text-sm animate-in zoom-in-95 duration-200",
                  message.type === "success"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                )}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                )}
                <p>{message.text}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-100 dark:border-red-900/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Permanent actions focused on your data. Use with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
              <div>
                <p className="font-semibold text-red-950 dark:text-red-400 text-sm">
                  Clear All Practice Data
                </p>
                <p className="text-xs text-red-700 dark:text-red-500 mt-1">
                  This will remove all your flashcards and progress permanently.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Reset App"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
