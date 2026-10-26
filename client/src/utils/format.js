// ============================================================
// CURRENCY FORMATTING
// ============================================================

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================================
// TABLE STATUS STYLES
// ============================================================

export const TABLE_STATUS_STYLES = {
  available: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Available" },
  occupied: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Occupied" },
  reserved: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: "Reserved" },
};

// ============================================================
// ORDER STATUS HELPERS
// ============================================================

export function getOrderStatus(order) {
  if (!order || !order.items || order.items.length === 0) return 'PENDING';
  
  if (order.items.every(item => item.status === 'SERVED')) {
    return 'SERVED';
  }
  return 'PENDING';
}

export const ORDER_STATUS_STYLES = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
  SERVED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Served" },
};

export const ORDER_ITEM_STATUS_STYLES = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Pending" },
  SERVED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Served" },
};

// ============================================================
// DATE/TIME FORMATTING
// ============================================================

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// ============================================================
// STATUS HELPERS
// ============================================================

export function getOrderStatusLabel(status) {
  const styles = ORDER_STATUS_STYLES[status];
  return styles ? styles.label : status;
}

export function getOrderStatusStyles(status) {
  return ORDER_STATUS_STYLES[status] || ORDER_STATUS_STYLES.PENDING;
}

export function getItemStatusStyles(status) {
  return ORDER_ITEM_STATUS_STYLES[status] || ORDER_ITEM_STATUS_STYLES.PENDING;
}

// ============================================================
// BILL CALCULATION
// ============================================================

export function calculateBill(items, taxRate = 0.05, serviceChargeRate = 0.1) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  const serviceCharge = subtotal * serviceChargeRate;
  const grandTotal = subtotal + tax + serviceCharge;
  
  return {
    subtotal,
    tax,
    serviceCharge,
    grandTotal,
  };
}