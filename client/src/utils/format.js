// client/src/utils/format.js

export function formatCurrency(amount) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

// The spec calls for a simple 3-color system: RED = new/unaccepted,
// YELLOW = in progress, GREEN = fully served. These maps translate the
// finer-grained per-item statuses into that same 3-color language
// everywhere in the admin UI, so the meaning stays consistent.
export const ORDER_ITEM_STATUS_STYLES = {
  PENDING: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Pending" },
  PREPARING: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: "Preparing" },
  READY: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: "Ready" },
  SERVED: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Served" },
};

export const TABLE_STATUS_STYLES = {
  available: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Available" },
  occupied: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Occupied" },
  reserved: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: "Reserved" },
};

// An order is only "fully served" once every item in it is — this rolls
// per-item status up to a single order-level status, per the spec.
export function getOrderStatus(order) {
  if (!order?.items?.length) return "PENDING";
  if (order.items.every((i) => i.status === "SERVED")) return "SERVED";
  if (order.items.some((i) => i.status === "PENDING")) return "PENDING";
  return "PREPARING";
}

export function calculateBill(cartItems) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const serviceCharge = subtotal * 0.1;
  const total = subtotal + tax + serviceCharge;
  return { subtotal, tax, serviceCharge, total };
}
