// client/src/context/CartContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const CartContext = createContext(null);

function storageKey(sessionId) {
  return `cart:${sessionId || "unknown"}`;
}

export function CartProvider({ children }) {
  const { sessionId } = useParams(); // ✅ FIXED: use sessionId, not token
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey(sessionId));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist per session
  useEffect(() => {
    try {
      localStorage.setItem(storageKey(sessionId), JSON.stringify(items));
    } catch {
      // Storage can fail
    }
  }, [items, sessionId]);

  // ✅ Reset cart when session changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(sessionId));
      setItems(saved ? JSON.parse(saved) : []);
    } catch {
      setItems([]);
    }
  }, [sessionId]);

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