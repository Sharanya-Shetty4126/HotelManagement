// client/src/services/api.js
//
// Every page/component talks to the backend through the functions in this
// file — never through mockData.js directly. Right now these functions
// just resolve mock data after a short fake delay (so loading states are
// real and visible). Once server/ has real endpoints, replace the body of
// each function with an axios call and nothing else in the app has to change.
//
// Example of what this will look like later:
//   export function getMenu() {
//     return axiosClient.get("/api/menu").then((res) => res.data);
//   }

import {
  MENU_ITEMS,
  MENU_CATEGORIES,
  TABLES,
  SESSIONS,
  resolveTokenToSession,
} from "../data/mockData";

const FAKE_LATENCY_MS = 300;

function resolveAfter(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), FAKE_LATENCY_MS));
}

// ---------- Customer-facing ----------

export function getMenu() {
  return resolveAfter({ items: MENU_ITEMS, categories: MENU_CATEGORIES });
}

export function getSessionByToken(token) {
  return resolveAfter(resolveTokenToSession(token));
}

export function placeOrder(token, cartItems) {
  // In the real backend this creates an Order + OrderItems tied to the
  // session the backend resolves from the token — never a session id the
  // browser supplies directly (see the spec's security section).
  const orderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
  return resolveAfter({ orderId, status: "PLACED" });
}

// ---------- Admin-facing ----------

export function getTables() {
  return resolveAfter(TABLES);
}

export function getAllOrders() {
  const orders = Object.values(SESSIONS).flatMap((session) =>
    session.orders.map((order) => ({
      ...order,
      sessionId: session.id,
      tableNumber: session.tableNumber,
    }))
  );
  return resolveAfter(orders);
}

export function getSessionById(sessionId) {
  return resolveAfter(SESSIONS[sessionId] || null);
}

export function updateOrderItemStatus(sessionId, orderId, itemId, status) {
  const session = SESSIONS[sessionId];
  const order = session?.orders.find((o) => o.id === orderId);
  const item = order?.items.find((i) => i.id === itemId);
  if (item) item.status = status;
  return resolveAfter({ ok: true });
}

// ---------- Admin auth ----------

export function loginAdmin(username, password) {
  // Mock check only. The real backend issues a signed JWT after verifying
  // credentials against the Admin table — never trust a frontend-only check.
  if (username && password) {
    return resolveAfter({ token: "mock-admin-jwt", name: username });
  }
  return Promise.reject(new Error("Username and password are required"));
}
