"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface BoxConfig {
  id: number;
  name: string;
  intervalDays: number;
}

const DEFAULT_BOXES: BoxConfig[] = [
  { id: 1, name: "Box 1", intervalDays: 1 },
  { id: 2, name: "Box 2", intervalDays: 3 },
  { id: 3, name: "Box 3", intervalDays: 7 },
  { id: 4, name: "Box 4", intervalDays: 14 },
  { id: 5, name: "Box 5", intervalDays: 30 },
];

export function useSettings() {
  const [boxes, setBoxes] = useState<BoxConfig[]>(DEFAULT_BOXES);
  const [loading, setLoading] = useState(true);

  // Load boxes from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    async function loadBoxes() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const { data, error } = await supabase
          .from("user_preferences")
          .select("leitner_boxes")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Failed to load box settings:", error);
          return;
        }

        if (
          data?.leitner_boxes &&
          Array.isArray(data.leitner_boxes) &&
          data.leitner_boxes.length > 0
        ) {
          if (!cancelled) setBoxes(data.leitner_boxes as BoxConfig[]);
        }
        // If no data or empty array, keep DEFAULT_BOXES
      } catch (err) {
        console.error("Error loading box settings:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBoxes();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist boxes to Supabase
  const saveBoxes = useCallback(async (newBoxes: BoxConfig[]) => {
    setBoxes(newBoxes);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("user_preferences").upsert(
        {
          user_id: user.id,
          leitner_boxes: newBoxes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (error) {
        console.error("Failed to save box settings:", error);
      }
    } catch (err) {
      console.error("Error saving box settings:", err);
    }
  }, []);

  const addBox = useCallback(() => {
    const nextId =
      boxes.length > 0 ? Math.max(...boxes.map((b) => b.id)) + 1 : 1;
    const lastInterval =
      boxes.length > 0 ? boxes[boxes.length - 1].intervalDays : 1;
    const newBoxes = [
      ...boxes,
      { id: nextId, name: `Box ${nextId}`, intervalDays: lastInterval * 2 },
    ];
    saveBoxes(newBoxes);
  }, [boxes, saveBoxes]);

  const updateBox = useCallback(
    (id: number, updates: Partial<BoxConfig>) => {
      const newBoxes = boxes.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      );
      saveBoxes(newBoxes);
    },
    [boxes, saveBoxes],
  );

  const removeBox = useCallback(
    (id: number) => {
      if (boxes.length <= 1) return;
      const newBoxes = boxes.filter((b) => b.id !== id);
      saveBoxes(newBoxes);
    },
    [boxes, saveBoxes],
  );

  return {
    boxes,
    loading,
    addBox,
    updateBox,
    removeBox,
    setBoxes: saveBoxes,
  };
}
