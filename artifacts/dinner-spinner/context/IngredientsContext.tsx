import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import React from "react";

const STORAGE_KEY = "@dinner_spinner_ingredients";

interface IngredientsContextType {
  ingredients: string[];
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  clearIngredients: () => void;
}

const IngredientsContext = createContext<IngredientsContextType>({
  ingredients: [],
  addIngredient: () => {},
  removeIngredient: () => {},
  clearIngredients: () => {},
});

export function IngredientsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ingredients, setIngredients] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setIngredients(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  const persist = (next: string[]) => {
    setIngredients(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim();
    if (!trimmed) return;
    const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    setIngredients((prev) => {
      if (prev.includes(normalized)) return prev;
      const next = [...prev, normalized];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeIngredient = (ingredient: string) => {
    persist(ingredients.filter((i) => i !== ingredient));
  };

  const clearIngredients = () => {
    persist([]);
  };

  return (
    <IngredientsContext.Provider
      value={{ ingredients, addIngredient, removeIngredient, clearIngredients }}
    >
      {children}
    </IngredientsContext.Provider>
  );
}

export function useIngredients() {
  return useContext(IngredientsContext);
}
