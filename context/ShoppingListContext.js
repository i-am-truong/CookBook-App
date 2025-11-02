// context/ShoppingListContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ShoppingListContext = createContext();
const STORAGE_KEY = "shoppingList";

export function ShoppingListProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setItems(JSON.parse(stored));
      } catch (e) {
        console.warn("Failed to load shopping list:", e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch((e) =>
      console.warn("Failed to save shopping list:", e)
    );
  }, [items]);

  const addItem = (item) => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setItems((prev) => [...prev, { id: uniqueId, bought: false, ...item }]);
  };

  const toggleBought = (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, bought: !i.bought } : i)));
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearBought = () => {
    setItems((prev) => prev.filter((i) => !i.bought));
  };

  // NEW: remove all items that belong to a recipe title
  const removeByRecipeTitle = (recipeTitle) => {
    setItems((prev) => prev.filter((i) => i.recipeTitle !== recipeTitle));
  };

  // Optionally expose a replaceAll / setItems function if you really need direct set
  const replaceAll = (newItems) => setItems(newItems);

  return (
    <ShoppingListContext.Provider
      value={{
        items,
        addItem,
        toggleBought,
        removeItem,
        clearBought,
        removeByRecipeTitle,
        replaceAll,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  return useContext(ShoppingListContext);
}
