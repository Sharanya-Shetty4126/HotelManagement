// client/src/context/CartContext.jsx
//
// MenuPage and CartPage need to share one cart. Previously each page had
// its own separate mock array, so adding an item on the menu never showed
// up in the cart. This context is the single source of truth for "what's
// in the cart right now", scoped to the current table token.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const CartContext = createContext(null);

function storageKey(token) {
  return `cart:${token || "unknown"}`;
}

export function CartProvider({ children }) {
  const { token } = useParams();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey(token));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist per-table so a customer refreshing the page doesn't lose their cart.
  useEffect(() => {
    try {
      localStorage.setItem(storageKey(token), JSON.stringify(items));
    } catch {
      // Storage can fail (private browsing, quota) — losing cart persistence
      // isn't fatal, so we just skip saving rather than crash the page.
    }
  }, [items, token]);

  const addItem = useCallback((menuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === menuItem.id);
      if (existing) {
        return prev.map((i) => (i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...menuItem, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((itemId, delta) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (!item) return prev;
      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) return prev.filter((i) => i.id !== itemId);
      return prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i));
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  const value = { items, addItem, updateQuantity, removeItem, clearCart, itemCount, subtotal };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside a <CartProvider>");
  return ctx;
}
