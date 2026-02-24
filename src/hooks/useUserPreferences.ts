"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useUserPreferences() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error: sbError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (sbError) throw sbError;
      return data;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(
    async (updates: {
      last_compare_left_id?: string | null;
      last_compare_right_id?: string | null;
      comparison_workbench?: Record<string, unknown>[] | null;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error: sbError } = await supabase
          .from("user_preferences")
          .upsert(
            {
              user_id: user.id,
              ...updates,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          )
          .select()
          .single();

        if (sbError) throw sbError;
        return data;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    getPreferences,
    updatePreferences,
  };
}
