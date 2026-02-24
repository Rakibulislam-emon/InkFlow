"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/types";

export function useFlashcards() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (sbError) throw sbError;
      return data as Card[];
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createCard = useCallback(
    async (
      cardData: Omit<
        Card,
        | "id"
        | "created_at"
        | "updated_at"
        | "user_id"
        | "box"
        | "next_review"
        | "correct_count"
        | "incorrect_count"
      >,
      imageFile?: File,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        let imageUrl = cardData.image_url;

        if (imageFile) {
          const fileExt = imageFile.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("cards")
            .upload(filePath, imageFile);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("cards").getPublicUrl(filePath);

          imageUrl = publicUrl;
        }

        const { data, error: sbError } = await supabase
          .from("cards")
          .insert([
            {
              ...cardData,
              image_url: imageUrl,
              user_id: user.id,
              box: 1,
              next_review: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (sbError) throw sbError;
        return data as Card;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateCard = useCallback(
    async (id: string, updates: Partial<Card>, imageFile?: File) => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        let imageUrl = updates.image_url;

        if (imageFile) {
          const fileExt = imageFile.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("cards")
            .upload(filePath, imageFile);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("cards").getPublicUrl(filePath);

          imageUrl = publicUrl;
        }

        const { data, error: sbError } = await supabase
          .from("cards")
          .update({
            ...updates,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (sbError) throw sbError;
        return data as Card;
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

  const deleteCard = useCallback(async (id: string, imageUrl?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: sbError } = await supabase
        .from("cards")
        .delete()
        .eq("id", id);

      if (sbError) throw sbError;

      // Optional: Delete from storage if it's a Supabase storage URL
      if (
        imageUrl &&
        imageUrl.includes("supabase.co/storage/v1/object/public/cards/")
      ) {
        const path = imageUrl.split("cards/").pop();
        if (path) {
          await supabase.storage.from("cards").remove([path]);
        }
      }

      return true;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getCards,
    createCard,
    updateCard,
    deleteCard,
  };
}
