import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface IngredientsContextType {
  ingredients: string[];
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  clearIngredients: () => void;
}

const IngredientsContext = createContext<IngredientsContextType | undefined>(undefined);

const STORAGE_KEY = "dinner-spinner-ingredients";

export function IngredientsProvider({ children }: { children: ReactNode }) {
  const [ingredients, setIngredients] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
  }, [ingredients]);

  const addIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients((prev) => prev.filter((i) => i !== ingredient));
  };

  const clearIngredients = () => {
    setIngredients([]);
  };

  return (
    <IngredientsContext.Provider value={{ ingredients, addIngredient, removeIngredient, clearIngredients }}>
      {children}
    </IngredientsContext.Provider>
  );
}

export function useIngredients() {
  const ctx = useContext(IngredientsContext);
  if (!ctx) throw new Error("useIngredients must be used within IngredientsProvider");
  return ctx;
}
