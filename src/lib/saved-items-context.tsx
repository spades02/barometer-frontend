"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type ItemType = "skill" | "trend" | "source" | "funding";

interface SavedItem {
  id: string;
  item_type: ItemType;
  item_id: string;
}

interface SavedItemsContextValue {
  savedItems: SavedItem[];
  savedCount: number;
  isSaved: (itemType: ItemType, itemId: string) => boolean;
  toggleSave: (itemType: ItemType, itemId: string) => Promise<void>;
  getSavedByType: (itemType: ItemType) => string[];
}

const SavedItemsContext = createContext<SavedItemsContextValue | null>(null);

export function SavedItemsProvider({ children }: { children: React.ReactNode }) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("saved_items")
        .select("id, item_type, item_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setSavedItems(data);
    }
    fetch();
  }, [supabase]);

  const isSaved = useCallback(
    (itemType: ItemType, itemId: string) =>
      savedItems.some(s => s.item_type === itemType && s.item_id === itemId),
    [savedItems],
  );

  const getSavedByType = useCallback(
    (itemType: ItemType) =>
      savedItems.filter(s => s.item_type === itemType).map(s => s.item_id),
    [savedItems],
  );

  const toggleSave = useCallback(async (itemType: ItemType, itemId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existing = savedItems.find(s => s.item_type === itemType && s.item_id === itemId);
    if (existing) {
      await supabase.from("saved_items").delete().eq("id", existing.id);
      setSavedItems(prev => prev.filter(s => s.id !== existing.id));
    } else {
      const { data } = await supabase
        .from("saved_items")
        .insert({ user_id: user.id, item_type: itemType, item_id: itemId })
        .select("id, item_type, item_id")
        .single();
      if (data) setSavedItems(prev => [data, ...prev]);
    }
  }, [savedItems, supabase]);

  return (
    <SavedItemsContext.Provider value={{
      savedItems,
      savedCount: savedItems.length,
      isSaved,
      toggleSave,
      getSavedByType,
    }}>
      {children}
    </SavedItemsContext.Provider>
  );
}

export function useSavedItems() {
  const ctx = useContext(SavedItemsContext);
  if (!ctx) throw new Error("useSavedItems must be used within SavedItemsProvider");
  return ctx;
}
