// client/src/data/mockData.js
//
// TEMPORARY mock data. The real backend (server/ + prisma/) is not built yet,
// so every page pulls from this single file instead of each page inventing
// its own copy of "menu items" or "tables".
//
// When the API is ready, only src/services/api.js needs to change — the
// pages and components already call functions from that file, not this one
// directly (see services/api.js).

export const MENU_CATEGORIES = ["Starters", "Main Course", "Breads", "Beverages", "Desserts"];

export const MENU_ITEMS = [
  {
    id: 1,
    name: "Chicken Biryani",
    category: "Main Course",
    price: 350,
    description: "Hyderabadi style biryani with aromatic spices",
    emoji: "🍛",
    isVeg: false,
    rating: 4.5,
  },
  {
    id: 2,
    name: "Paneer Butter Masala",
    category: "Main Course",
    price: 280,
    description: "Creamy tomato gravy with paneer",
    emoji: "🧀",
    isVeg: true,
    rating: 4.3,
  },
  {
    id: 3,
    name: "Garlic Naan",
    category: "Breads",
    price: 60,
    description: "Fresh tandoor naan with garlic butter",
    emoji: "🥖",
    isVeg: true,
    rating: 4.4,
  },
  {
    id: 4,
    name: "Chicken 65",
    category: "Starters",
    price: 220,
    description: "Spicy deep-fried chicken tossed in curry leaves",
    emoji: "🍗",
    isVeg: false,
    rating: 4.6,
  },
  {
    id: 5,
    name: "Veg Spring Rolls",
    category: "Starters",
    price: 160,
    description: "Crispy rolls stuffed with mixed vegetables",
    emoji: "🥟",
    isVeg: true,
    rating: 4.1,
  },
  {
    id: 6,
    name: "Masala Chaas",
    category: "Beverages",
    price: 50,
    description: "Spiced buttermilk, served chilled",
    emoji: "🥛",
    isVeg: true,
    rating: 4.2,
  },
  {
    id: 7,
    name: "Gulab Jamun",
    category: "Desserts",
    price: 90,
    description: "Warm milk dumplings in sugar syrup",
    emoji: "🍮",
    isVeg: true,
    rating: 4.7,
  },
  {
    id: 8,
    name: "Jeera Rice",
    category: "Main Course",
    price: 150,
    description: "Basmati rice tempered with cumin",
    emoji: "🍚",
    isVeg: true,
    rating: 4.0,
  },
];

export const TABLES = [
  { id: 1, number: 1, section: "AC", capacity: 4, status: "available", sessionId: null },
  { id: 2, number: 2, section: "AC", capacity: 2, status: "occupied", sessionId: "S-101" },
  { id: 3, number: 3, section: "AC", capacity: 6, status: "occupied", sessionId: "S-102" },
  { id: 4, number: 4, section: "AC", capacity: 4, status: "available", sessionId: null },
  { id: 5, number: 5, section: "Non-AC", capacity: 8, status: "occupied", sessionId: "S-103" },
  { id: 6, number: 6, section: "Non-AC", capacity: 4, status: "available", sessionId: null },
  { id: 7, number: 7, section: "Non-AC", capacity: 2, status: "reserved", sessionId: null },
  { id: 8, number: 8, section: "Non-AC", capacity: 6, status: "occupied", sessionId: "S-104" },
];

// A "session" groups every order placed by one table visit — mirrors the
// Table -> TableSession -> Order -> OrderItem design in the spec.
export const SESSIONS = {
  "S-101": {
    id: "S-101",
    tableNumber: 2,
    startedAt: "7:40 PM",
    guestCount: 2,
    requests: [{ id: "R-1", type: "Water", raisedAt: "7:52 PM", resolved: false }],
    orders: [
      {
        id: "ORD-101",
        placedAt: "7:45 PM",
        items: [
          { id: "OI-1", menuItemId: 1, name: "Chicken Biryani", quantity: 1, price: 350, status: "PREPARING" },
          { id: "OI-2", menuItemId: 3, name: "Garlic Naan", quantity: 2, price: 60, status: "READY" },
        ],
      },
    ],
  },
  "S-102": {
    id: "S-102",
    tableNumber: 3,
    startedAt: "8:05 PM",
    guestCount: 6,
    requests: [],
    orders: [
      {
        id: "ORD-102",
        placedAt: "8:10 PM",
        items: [
          { id: "OI-3", menuItemId: 2, name: "Paneer Butter Masala", quantity: 2, price: 280, status: "SERVED" },
          { id: "OI-4", menuItemId: 8, name: "Jeera Rice", quantity: 2, price: 150, status: "SERVED" },
        ],
      },
      {
        id: "ORD-103",
        placedAt: "8:30 PM",
        items: [
          { id: "OI-5", menuItemId: 7, name: "Gulab Jamun", quantity: 4, price: 90, status: "PENDING" },
        ],
      },
    ],
  },
  "S-103": {
    id: "S-103",
    tableNumber: 5,
    startedAt: "8:20 PM",
    guestCount: 8,
    requests: [{ id: "R-2", type: "Bill request", raisedAt: "9:05 PM", resolved: false }],
    orders: [
      {
        id: "ORD-104",
        placedAt: "8:25 PM",
        items: [
          { id: "OI-6", menuItemId: 4, name: "Chicken 65", quantity: 2, price: 220, status: "SERVED" },
          { id: "OI-7", menuItemId: 1, name: "Chicken Biryani", quantity: 3, price: 350, status: "SERVED" },
        ],
      },
    ],
  },
  "S-104": {
    id: "S-104",
    tableNumber: 8,
    startedAt: "8:50 PM",
    guestCount: 5,
    requests: [],
    orders: [
      {
        id: "ORD-105",
        placedAt: "8:55 PM",
        items: [
          { id: "OI-8", menuItemId: 5, name: "Veg Spring Rolls", quantity: 2, price: 160, status: "PENDING" },
          { id: "OI-9", menuItemId: 6, name: "Masala Chaas", quantity: 5, price: 50, status: "PENDING" },
        ],
      },
    ],
  },
};

// Every table QR code eventually resolves to a session token. Until the
// backend exists, we just treat the URL token itself as the session id it
// maps to, defaulting to S-101 so the customer flow has something to show.
export function resolveTokenToSession(token) {
  if (token && SESSIONS[token]) return SESSIONS[token];
  return SESSIONS["S-101"];
}

export const TAX_RATE = 0.05;
export const SERVICE_CHARGE_RATE = 0.1;
