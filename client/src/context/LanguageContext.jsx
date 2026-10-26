// client/src/context/LanguageContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from "react";

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    appName: "Julius",
    coastalBar: "Coastal · Bar",
    table: "Table",
    menu: "Menu",
    orders: "Orders",
    service: "Service",
    bill: "Bill",
    cart: "Cart",
    items: "items",
    viewCart: "View Cart",
    searchPlaceholder: "Search menu or tap mic...",
    voiceSearch: "Voice Search",
    listening: "Listening in English... (e.g. Fish Fry, Prawns)",
    listeningPrompt: "Speak dish name or service request...",
    all: "All",
    veg: "Veg",
    nonVeg: "Non-Veg",
    add: "Add",
    noItemsFound: "No items match your search.",
    emptyCartTitle: "Your cart is empty",
    emptyCartDesc: "Add some delicious coastal items!",
    browseMenu: "Browse Menu",
    clearAll: "Clear All",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    tax: "GST (5%)",
    serviceCharge: "Service Charge (10%)",
    total: "Total",
    grandTotal: "Grand Total",
    placeOrder: "Place Order",
    placingOrder: "Placing Order...",
    liveOrders: "Live Orders",
    trackOrdersDesc: "Track preparation and table delivery in real-time.",
    orderReceived: "Order Received",
    pending: "Pending",
    served: "Served",
    cancelItem: "Cancel",
    cancelOrder: "Cancel Order",
    cancelling: "Cancelling...",
    cancelWindowClosed: "Preparation started · Cancel window closed",
    completed: "Completed",
    needService: "Need Service?",
    serviceDesc: "Tap an option below to alert your table server instantly.",
    water: "Drinking Water",
    waterDesc: "Fresh drinking water",
    cutlery: "Cutlery",
    cutleryDesc: "Forks, spoons & knives",
    tissue: "Tissue Paper",
    tissueDesc: "Extra napkins",
    extraPlates: "Extra Plates",
    extraPlatesDesc: "Plates or bowls",
    assistance: "Call Waiter",
    assistanceDesc: "Staff assistance needed",
    complaint: "Report Issue",
    complaintDesc: "Food or service feedback",
    specificNotes: "Add specific instructions (Optional)",
    billSummary: "Bill Summary",
    payWithGateway: "Pay with UPI / Cards",
    payCashCounter: "Pay Cash at Counter Instead",
    billRequestedCounter: "Bill Requested at Counter",
    counterNote: "Admin notified. You can pay online above or complete payment at the cashier.",
    paymentConfirmed: "Payment Confirmed!",
    paymentConfirmedDesc: "Thank you for dining with us! Staff has received confirmation and your table is settled.",
    printInvoice: "Print / Save Invoice",
    cancelConfirmPrompt: "Are you sure you want to cancel this item? This cannot be undone.",
    cancelOrderConfirmPrompt: "Are you sure you want to cancel this entire order? This cannot be undone.",
    dashboard: "Dashboard",
    tables: "Tables",
    adminOrders: "Kitchen & Bar Orders",
    liveSystemActive: "Live System Active",
    staffVerified: "Staff Verified",
    logout: "Logout",
    kitchenOrders: "Kitchen & Bar Orders",
    kitchenSubtitle: "Live order queue for chefs & bartenders.",
    allOrders: "All Orders",
    searchOrderPlaceholder: "Search order ID or table...",
    markAsServed: "Mark as Served",
    tableDetails: "Table Details",
    noActiveOrders: "No active orders matching this filter.",
    activeTables: "Active Tables",
    todaysOrders: "Today's Orders",
    pendingOrders: "Pending Orders",
    waiterCalls: "Waiter Calls",
    revenueToday: "Revenue Today",
    revenueThisMonth: "Revenue This Month",
    overviewSubtitle: "Real-time overview of hotel tables, orders & revenue.",
    refresh: "Refresh",
    urgent: "Urgent",
    recentOrders: "Recent Orders",
    addTable: "Add Table",
    available: "Available",
    occupied: "Occupied",
    billRequested: "Bill Requested",
    seatGuests: "Seat Walk-in Guests",
    viewSession: "View Session",
    guestCount: "Guests",
    generateBill: "Generate Bill",
    confirmPayment: "Confirm Payment",
    sessionPaidClosed: "Session Paid & Closed",
    financialBreakdown: "Financial Breakdown",
    itemsSubtotal: "Items Subtotal",
    paymentStatus: "Payment Status",
    code: "Code",
    notifications: "Notifications",
    markAllRead: "Mark all as read",
    noNotifications: "No new notifications",
    orderFromTable: "Order from Table",
    billFromTable: "Bill Requested for Table",
    paymentFromTable: "Payment Received for Table",
    serviceFromTable: "Service Call from Table",
    cancelledFromTable: "Order Cancelled for Table",
    filterSection: "Section",
    dining: "Dining",
  },
  kn: {
    appName: "ಜ್ಯೂಲಿಯಸ್",
    coastalBar: "ಕೋಸ್ಟಲ್ · ಬಾರ್",
    table: "ಟೇಬಲ್",
    menu: "ಮೆನು",
    orders: "ಆರ್ಡರ್‌ಗಳು",
    service: "ಸೇವೆ",
    bill: "ಬಿಲ್",
    cart: "ಕಾರ್ಟ್",
    items: "ಐಟಂಗಳು",
    viewCart: "ಕಾರ್ಟ್ ನೋಡಿ",
    searchPlaceholder: "ಮೆನು ಹುಡುಕಿ ಅಥವಾ ಮೈಕ್ ಒತ್ತಿ...",
    voiceSearch: "ಧ್ವನಿ ಹುಡುಕಾಟ",
    listening: "ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ... (ಉದಾ: ಮೀನು ಫ್ರೈ, ಪ್ರಾನ್ಸ್, ನೀರು)",
    listeningPrompt: "ಖಾದ್ಯದ ಹೆಸರು ಅಥವಾ ಸೇವೆಯನ್ನು ಹೇಳಿ...",
    all: "ಎಲ್ಲವೂ",
    veg: "ಸಸ್ಯಾಹಾರಿ",
    nonVeg: "ಮಾಂಸಾಹಾರಿ",
    add: "ಸೇರಿಸಿ",
    noItemsFound: "ಯಾವುದೇ ಐಟಂ ದೊರೆತಿಲ್ಲ.",
    emptyCartTitle: "ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ",
    emptyCartDesc: "ಸ್ವಾದಿಷ್ಟಕರ ಕರಾವಳಿ ಖಾದ್ಯಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ!",
    browseMenu: "ಮೆನು ನೋಡಿ",
    clearAll: "ಎಲ್ಲ ತೆರವುಗೊಳಿಸಿ",
    orderSummary: "ಆರ್ಡರ್ ಸಾರಾಂಶ",
    subtotal: "ಉಪಮೊತ್ತ",
    tax: "ಜಿಎಸ್ಟಿ (5%)",
    serviceCharge: "ಸೇವಾ ಶುಲ್ಕ (10%)",
    total: "ಒಟ್ಟು",
    grandTotal: "ಒಟ್ಟು ಮೊತ್ತ",
    placeOrder: "ಆರ್ಡರ್ ನೀಡಿ",
    placingOrder: "ಆರ್ಡರ್ ಆಗುತ್ತಿದೆ...",
    liveOrders: "ಲೈವ್ ಆರ್ಡರ್‌ಗಳು",
    trackOrdersDesc: "ಅಡುಗೆ ಮತ್ತು ಟೇಬಲ್ ವಿತರಣೆಯನ್ನು ನೇರವಾಗಿ ವೀಕ್ಷಿಸಿ.",
    orderReceived: "ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    pending: "ಬಾಕಿ ಇದೆ",
    served: "ಸರ್ವ್ ಮಾಡಲಾಗಿದೆ",
    cancelItem: "ರದ್ದುಮಾಡಿ",
    cancelOrder: "ಪೂರ್ಣ ಆರ್ಡರ್ ರದ್ದುಮಾಡಿ",
    cancelling: "ರದ್ದುಮಾಡಲಾಗುತ್ತಿದೆ...",
    cancelWindowClosed: "ಅಡುಗೆ ಆರಂಭವಾಗಿದೆ · ರದ್ದುಗೊಳಿಸುವ ಸಮಯ ಮುಗಿದಿದೆ",
    completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    needService: "ಸಹಾಯ ಬೇಕೇ?",
    serviceDesc: "ನಿಮ್ಮ ಟೇಬಲ್ ಸರ್ವರ್‌ಗೆ ತಕ್ಷಣ ತಿಳಿಸಲು ಕೆಳಗಿನ ಆಯ್ಕೆಯನ್ನು ಒತ್ತಿರಿ.",
    water: "ಕುಡಿಯುವ ನೀರು",
    waterDesc: "ಶುದ್ಧ ಕುಡಿಯುವ ನೀರು",
    cutlery: "ಚಮಚ / ಫೋರ್ಕ್",
    cutleryDesc: "ಚಮಚ, ಫೋರ್ಕ್ ಮತ್ತು ಚಾಕು",
    tissue: "ಟಿಶ್ಯೂ ಪೇಪರ್",
    tissueDesc: "ಹೆಚ್ಚುವರಿ ಕರವಸ್ತ್ರಗಳು",
    extraPlates: "ಹೆಚ್ಚುವರಿ ಪ್ಲೇಟ್",
    extraPlatesDesc: "ಊಟದ ಪ್ಲೇಟ್‌ಗಳು",
    assistance: "ವೇಟರ್ ಕರೆ",
    assistanceDesc: "ಸಿಬ್ಬಂದಿ ಸಹಾಯ ಬೇಕು",
    complaint: "ದೂರು / ಸಲಹೆ",
    complaintDesc: "ಆಹಾರ ಅಥವಾ ಸೇವಾ ಪ್ರತಿಕ್ರಿಯೆ",
    specificNotes: "ವಿಶೇಷ ಸೂಚನೆಗಳು (ಐಚ್ಛಿಕ)",
    billSummary: "ಬಿಲ್ ಸಾರಾಂಶ",
    payWithGateway: "ಯುಪಿಐ / ಕಾರ್ಡ್ ಮೂಲಕ ಪಾವತಿಸಿ",
    payCashCounter: "ಕೌಂಟರ್‌ನಲ್ಲಿ ನಗದು ಪಾವತಿಸಿ",
    billRequestedCounter: "ಕೌಂಟರ್‌ನಲ್ಲಿ ಬಿಲ್ ಕೋರಲಾಗಿದೆ",
    counterNote: "ಸಿಬ್ಬಂದಿಗೆ ತಿಳಿಸಲಾಗಿದೆ. ನೀವು ಮೇಲೆ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಅಥವಾ ಕ್ಯಾಷಿಯರ್ ಬಳಿ ಪಾವತಿಸಬಹುದು.",
    paymentConfirmed: "ಪಾವತಿ ದೃಢಪಟ್ಟಿದೆ!",
    paymentConfirmedDesc: "ನಮ್ಮಲ್ಲಿ ಊಟ ಮಾಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು! ಸಿಬ್ಬಂದಿಗೆ ಮಾಹಿತಿ ತಲುಪಿದೆ ಮತ್ತು ನಿಮ್ಮ ಟೇಬಲ್ ಪಾವತಿ ಪೂರ್ಣಗೊಂಡಿದೆ.",
    printInvoice: "ಇನ್‌ವಾಯ್ಸ್ ಪ್ರಿಂಟ್ ಮಾಡಿ",
    cancelConfirmPrompt: "ನೀವು ಈ ಐಟಂ ಅನ್ನು ರದ್ದುಗೊಳಿಸಲು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?",
    cancelOrderConfirmPrompt: "ನೀವು ಈ ಪೂರ್ಣ ಆರ್ಡರ್ ಅನ್ನು ರದ್ದುಗೊಳಿಸಲು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    tables: "ಟೇಬಲ್‌ಗಳು",
    adminOrders: "ಅಡುಗೆ ಮನೆ & ಬಾರ್ ಆರ್ಡರ್‌ಗಳು",
    liveSystemActive: "ಲೈವ್ ಸಿಸ್ಟಮ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    staffVerified: "ಸಿಬ್ಬಂದಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ",
    logout: "ಲಾಗ್ ಔಟ್",
    kitchenOrders: "ಅಡುಗೆ ಮನೆ ಮತ್ತು ಬಾರ್ ಆರ್ಡರ್‌ಗಳು",
    kitchenSubtitle: "ಅಡುಗೆಯವರು ಮತ್ತು ಬಾರ್‌ಟೆಂಡರ್‌ಗಳ ನೇರ ಆರ್ಡರ್ ಸರತಿ.",
    allOrders: "ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳು",
    searchOrderPlaceholder: "ಆರ್ಡರ್ ಐಡಿ ಅಥವಾ ಟೇಬಲ್ ಹುಡುಕಿ...",
    markAsServed: "ಸರ್ವ್ ಮಾಡಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
    tableDetails: "ಟೇಬಲ್ ವಿವರಗಳು →",
    noActiveOrders: "ಯಾವುದೇ ಸಕ್ರಿಯ ಆರ್ಡರ್‌ಗಳು ಲಭ್ಯವಿಲ್ಲ.",
    activeTables: "ಸಕ್ರಿಯ ಟೇಬಲ್‌ಗಳು",
    todaysOrders: "ಇಂದಿನ ಆರ್ಡರ್‌ಗಳು",
    pendingOrders: "ಬಾಕಿ ಆರ್ಡರ್‌ಗಳು",
    waiterCalls: "ವೇಟರ್ ಕರೆಗಳು",
    revenueToday: "ಇಂದಿನ ಆದಾಯ",
    revenueThisMonth: "ಈ ತಿಂಗಳ ಆದಾಯ",
    overviewSubtitle: "ಟೇಬಲ್‌ಗಳು, ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ಆದಾಯದ ನೇರ ಸಾರಾಂಶ.",
    refresh: "ನವೀಕರಿಸಿ",
    urgent: "ತುರ್ತು",
    recentOrders: "ಇತ್ತೀಚಿನ ಆರ್ಡರ್‌ಗಳು",
    addTable: "ಹೊಸ ಟೇಬಲ್ ಸೇರಿಸಿ",
    available: "ಲಭ್ಯವಿದೆ",
    occupied: "ಗ್ರಾಹಕರಿದ್ದಾರೆ",
    billRequested: "ಬಿಲ್ ಕೋರಲಾಗಿದೆ",
    seatGuests: "ಗ್ರಾಹಕರನ್ನು ಕೂರಿಸಿ",
    viewSession: "ಸೆಷನ್ ನೋಡಿ",
    guestCount: "ಜನರು",
    generateBill: "ಬಿಲ್ ರಚಿಸಿ",
    confirmPayment: "ಪಾವತಿ ದೃಢೀಕರಿಸಿ",
    sessionPaidClosed: "ಪಾವತಿ ಪೂರ್ಣಗೊಂಡಿದೆ & ಮುಕ್ತಾಯವಾಗಿದೆ",
    financialBreakdown: "ಹಣಕಾಸು ವಿವರಣೆ",
    itemsSubtotal: "ಐಟಂಗಳ ಮೊತ್ತ",
    paymentStatus: "ಪಾವತಿ ಸ್ಥಿತಿ",
    code: "ಕೋಡ್",
    notifications: "ಸೂಚನೆಗಳು",
    markAllRead: "ಎಲ್ಲ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
    noNotifications: "ಯಾವುದೇ ಹೊಸ ಸೂಚನೆಗಳಿಲ್ಲ",
    orderFromTable: "ಟೇಬಲ್‌ನಿಂದ ಹೊಸ ಆರ್ಡರ್ ಬಂದಿದೆ",
    billFromTable: "ಟೇಬಲ್‌ನಿಂದ ಬಿಲ್ ಕೋರಲಾಗಿದೆ",
    paymentFromTable: "ಟೇಬಲ್ ಪಾವತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    serviceFromTable: "ಟೇಬಲ್‌ನಿಂದ ಸಹಾಯದ ಕರೆ",
    cancelledFromTable: "ಟೇಬಲ್ ಆರ್ಡರ್ ರದ್ದುಮಾಡಲಾಗಿದೆ",
    filterSection: "ವಿಭಾಗ",
    dining: "ಊಟದ ಕೊಠಡಿ",
  }
};

export const ITEM_TRANSLATIONS = {
  "Anjal (Kingfish) Rava Fry": {
    knName: "ಅಂಜಲ್ (ಮೀನು) ರವಾ ಫ್ರೈ",
    knDesc: "ಗರಿಗರಿಯಾದ ರವಾ ಲೇಪಿತ ಕರಾವಳಿ ಅಂಜಲ್ ಮೀನು ಫ್ರೈ",
    keywords: ["ಮೀನು", "ಅಂಜಲ್", "ರವ", "ಫ್ರೈ", "fish", "rava"]
  },
  "Prawns Ghee Roast": {
    knName: "ಪ್ರಾನ್ಸ್ ಘೀ ರೋಸ್ಟ್ (ತುಪ್ಪ ರೋಸ್ಟ್)",
    knDesc: "ಕುಂದಾಪುರ ಶೈಲಿಯ ಶುದ್ಧ ತುಪ್ಪದಲ್ಲಿ ಹುರಿದ ತಾಜಾ ಸಿಗಡಿ/ಪ್ರಾನ್ಸ್",
    keywords: ["ಪ್ರಾನ್ಸ್", "ಸಿಗಡಿ", "ತುಪ್ಪ", "ಘೀ", "ರೋಸ್ಟ್", "prawns"]
  },
  "Squid Pepper Garlic": {
    knName: "ಸ್ಕ್ವಿಡ್ ಪೆಪ್ಪರ್ ಗಾರ್ಲಿಕ್",
    knDesc: "ಅರಬ್ಬಿ ಸಮುದ್ರದ ಬೊಂಡಾಸ್ / ಸ್ಕ್ವಿಡ್ ಕಾಳುಮೆಣಸು ಮತ್ತು ಬೆಳ್ಳುಳ್ಳಿ ಫ್ರೈ",
    keywords: ["ಸ್ಕ್ವಿಡ್", "ಬೊಂಡಾಸ್", "ಪೆಪ್ಪರ್", "squid"]
  },
  "Surmai Tawa Fry": {
    knName: "ಸುರ್ಮಾಯಿ ತವಾ ಫ್ರೈ",
    knDesc: "ಕರಾವಳಿ ಮಸಾಲೆಯಲ್ಲಿ ಕಾದ ತವಾ ಮೇಲೆ ಹುರಿದ ಸುರ್ಮಾಯಿ ಮೀನು",
    keywords: ["ಸುರ್ಮಾಯಿ", "ಮೀನು", "ತವ", "surmai"]
  },
  "Paneer Ghee Roast": {
    knName: "ಪನೀರ್ ಘೀ ರೋಸ್ಟ್",
    knDesc: "ಬ್ಯಾಡಗಿ ಮೆಣಸು ಮತ್ತು ಶುದ್ಧ ತುಪ್ಪದಲ್ಲಿ ರೋಸ್ಟ್ ಮಾಡಿದ ಪನೀರ್",
    keywords: ["ಪನೀರ್", "ತುಪ್ಪ", "ಘೀ", "paneer"]
  },
  "Cashew / Kaju Pakoda": {
    knName: "ಗೋಡಂಬಿ / ಕಾಜು ಪಕೋಡಾ",
    knDesc: "ಕರಿಬೇವು ಮತ್ತು ಉಪ್ಪಿನೊಂದಿಗೆ ಕರಿದ ಗರಿಗರಿ ಗೋಡಂಬಿ",
    keywords: ["ಗೋಡಂಬಿ", "ಕಾಜು", "ಪಕೋಡ", "cashew"]
  },
  "Mangalorean Fish Curry": {
    knName: "ಮಂಗಳೂರು ಮೀನಿನ ಸಾರು (ಕರಿ)",
    knDesc: "ತೆಂಗಿನಕಾಯಿ ಮತ್ತು ಹುಣಸೆಹಣ್ಣಿನ ಸಾಂಪ್ರದಾಯಿಕ ಕರಾವಳಿ ಮೀನಿನ ಸಾರು",
    keywords: ["ಮೀನು", "ಮೀನಿನ ಸಾರು", "ಕರಿ", "fish curry"]
  },
  "Kori Rotti & Kori Gassi": {
    knName: "ಕೋರಿ ರೊಟ್ಟಿ ಮತ್ತು ಕೋರಿ ಗಸ್ಸಿ",
    knDesc: "ಗರಿಗರಿ ಅಕ್ಕಿ ರೊಟ್ಟಿಯೊಂದಿಗೆ ರುಚಿಕರ ಕರಾವಳಿ ಕೋಳಿ ಸಾರು",
    keywords: ["ಕೋರಿ", "ರೊಟ್ಟಿ", "ಚಿಕನ್", "ಕೋಳಿ", "chicken", "kori"]
  },
  "Prawns Biryani": {
    knName: "ಪ್ರಾನ್ಸ್ ಬಿರಿಯಾನಿ",
    knDesc: "ಸುವಾಸನೆಯುಕ್ತ ಜೀರಕಸಾಲ ಅಕ್ಕಿಯ ರುಚಿಕರ ಸಿಗಡಿ ಬಿರಿಯಾನಿ",
    keywords: ["ಬಿರಿಯಾನಿ", "ಪ್ರಾನ್ಸ್", "ಸಿಗಡಿ", "biryani"]
  },
  "Mud Crab Sukka": {
    knName: "ಏಡಿ ಸುಕ್ಕ (ಕ್ರಾಬ್ ಸುಕ್ಕ)",
    knDesc: "ಹುರಿದ ತೆಂಗಿನಕಾಯಿ ಮಸಾಲೆಯಲ್ಲಿ ಮಾಡಿದ ತಾಜಾ ಏಡಿ ಸುಕ್ಕ",
    keywords: ["ಏಡಿ", "ಕ್ರಾಬ್", "ಸುಕ್ಕ", "crab"]
  },
  "Chicken Sukka": {
    knName: "ಕೋಳಿ ಸುಕ್ಕ (ಚಿಕನ್ ಸುಕ್ಕ)",
    knDesc: "ಕರಾವಳಿ ಸಾಂಪ್ರದಾಯಿಕ ತೆಂಗಿನಕಾಯಿ ಮಸಾಲೆಯ ಚಿಕನ್ ಸುಕ್ಕ",
    keywords: ["ಕೋಳಿ", "ಚಿಕನ್", "ಸುಕ್ಕ", "chicken sukka"]
  },
  "Paneer Kundapura Curry": {
    knName: "ಕುಂದಾಪುರ ಪನೀರ್ ಕರಿ",
    knDesc: "ತೆಂಗಿನಕಾಯಿ ಹಾಲು ಮತ್ತು ಕೊತ್ತಂಬರಿ ಮಸಾಲೆಯ ಪನೀರ್ ಗ್ರೇವಿ",
    keywords: ["ಪನೀರ್", "ಕುಂದಾಪುರ", "ಕರಿ", "paneer"]
  },
  "Neer Dosa (3 pcs)": {
    knName: "ನೀರು ದೋಸೆ (3 ಪೀಸ್)",
    knDesc: "ಬಾಯಲ್ಲಿ ಕರಗುವ ಮೃದುವಾದ ಕರಾವಳಿ ಅಕ್ಕಿ ನೀರು ದೋಸೆ",
    keywords: ["ನೀರು ದೋಸೆ", "ದೋಸೆ", "neer dosa"]
  },
  "Appam (2 pcs)": {
    knName: "ಆಪ್ಪಂ (2 ಪೀಸ್)",
    knDesc: "ಮೃದುವಾದ ಮಧ್ಯಭಾಗ ಮತ್ತು ಗರಿಗರಿ ಅಂಚುಳ್ಳ ಆಪ್ಪಂ",
    keywords: ["ಆಪ್ಪಂ", "ಅಪ್ಪಂ", "appam"]
  },
  "Coastal Boiled Rice (Kaje Rice)": {
    knName: "ಕರಾವಳಿ ಕುಚಲಕ್ಕಿ ಅನ್ನ (ಕಜೆ ಅನ್ನ)",
    knDesc: "ಆರೋಗ್ಯಕರ ಸಾಂಪ್ರದಾಯಿಕ ಕರಾವಳಿ ಕೆಂಪು ಕುಚಲಕ್ಕಿ ಅನ್ನ",
    keywords: ["ಅನ್ನ", "ಕುಚಲಕ್ಕಿ", "ಕಜೆ", "rice"]
  },
  "Butter Garlic Naan": {
    knName: "ಬಟರ್ ಗಾರ್ಲಿಕ್ ನಾನ್",
    knDesc: "ಬೆಣ್ಣೆ ಮತ್ತು ಬೆಳ್ಳುಳ್ಳಿ ಸುವಾಸನೆಯ ತಂದೂರ್ ನಾನ್",
    keywords: ["ನಾನ್", "ಬಟರ್", "naan"]
  },
  "Honnavar Toddy Punch": {
    knName: "ಹೊನ್ನಾವರ ಟಾಡಿ ಪಂಚ್",
    knDesc: "ಎಳನೀರು, ನಿಂಬೆ ಮತ್ತು ಕರಾವಳಿ ಗಿಡಮೂಲಿಕೆಗಳ ವಿಶೇಷ ಪಂಚ್",
    keywords: ["ಟಾಡಿ", "ಪಂಚ್", "ಹೊನ್ನಾವರ", "punch"]
  },
  "Kokum Sol Kadi Fizz": {
    knName: "ಕೋಕುಮ್ ಸೋಲ್ ಕಡಿ ಫಿಜ್ಜ್",
    knDesc: "ಜೀರ್ಣಕಾರಿ ಕೋಕುಮ್ ಹಣ್ಣು ಮತ್ತು ತೆಂಗಿನ ಹಾಲಿನ ಸೋಲ್ ಕಡಿ",
    keywords: ["ಸೋಲ್ ಕಡಿ", "ಕೋಕುಮ್", "sol kadi"]
  },
  "Alphonso Mango Mule": {
    knName: "ಅಲ್ಫಾನ್ಸೋ ಮ್ಯಾಂಗೋ ಮ್ಯೂಲ್",
    knDesc: "ಕರಾವಳಿ ಮಾವಿನಹಣ್ಣು ಮತ್ತು ಶುಂಠಿ ರಸದ ಪಾನೀಯ",
    keywords: ["ಮಾವಿನಹಣ್ಣು", "ಮ್ಯಾಂಗೋ", "mango"]
  },
  "Fresh Tender Coconut (Elaneer)": {
    knName: "ತಾಜಾ ಎಳನೀರು",
    knDesc: "ಕರಾವಳಿಯ ಸಿಹಿಯಾದ ತಂಪಾದ ನೈಸರ್ಗಿಕ ಎಳನೀರು",
    keywords: ["ಎಳನೀರು", "ತೆಂಗಿನಕಾಯಿ", "tender coconut", "coconut"]
  },
  "Honnavar Gadbad": {
    knName: "ಹೊನ್ನಾವರ ಗಡ್‌ಬಡ್",
    knDesc: "ಜೆಲ್ಲಿ, ಡ್ರೈ ಫ್ರೂಟ್ಸ್ ಮತ್ತು ಮೂರು ಸ್ಕೂಪ್ ಐಸ್‌ಕ್ರೀಮ್ ಗಡ್‌ಬಡ್",
    keywords: ["ಗಡ್ಬಡ್", "ಗಡ್ ಬಡ್", "ಐಸ್ ಕ್ರೀಮ್", "gadbad"]
  },
  "Elaneer Payasam": {
    knName: "ಎಳನೀರು ಪಾಯಸ",
    knDesc: "ತಾಜಾ ಎಳನೀರಿನ ಗಂಜಿ, ಏಲಕ್ಕಿ ಮತ್ತು ಹಾಲಿನ ಪಾಯಸ",
    keywords: ["ಪಾಯಸ", "ಎಳನೀರು", "payasam"]
  }
};

export const CATEGORY_TRANSLATIONS = {
  "Coastal Starters & Fries": "ಕರಾವಳಿ ಸ್ಟಾರ್ಟರ್ಸ್ & ಫ್ರೈಸ್",
  "Coastal Mains & Curries": "ಕರಾವಳಿ ಮುಖ್ಯ ಊಟ & ಸಾರು",
  "Coastal Breads & Rice": "ದೋಸೆ, ರೊಟ್ಟಿ & ಅನ್ನ",
  "Julius Bar & Beverages": "ಜ್ಯೂಲಿಯಸ್ ಬಾರ್ & ಪಾನೀಯಗಳು",
  "Desserts": "ಸಿಹಿ ತಿನಿಸುಗಳು / ಡೆಸರ್ಟ್ಸ್"
};

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    if (window.location.hostname.includes("onrender.com")) {
      return `${window.location.origin}/api`;
    }
    if (window.location.hostname.includes("pages.dev") || (window.location.protocol === "https:" && !window.location.hostname.includes("localhost"))) {
      return "https://hotelmanagement-2qak.onrender.com/api";
    }
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return `http://${window.location.hostname}:5000/api`;
    }
  }

  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes("localhost")) {
    return `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`;
  }
  return "http://localhost:5000/api";
}

const KANNADA_PHONETIC_MAP = {
  "ಕನ್ನಡ ಭಾಷೆ ಆಯ್ಕೆಯಾಗಿದೆ": "Kannada bhaashe aaykeyaagide",
  "English language selected": "English language selected",
  "ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ನೀಡಲಾಗಿದೆ!": "Order yashasviyaagi needalaagide",
};

function transliterateKannada(text) {
  if (!text) return "";
  if (KANNADA_PHONETIC_MAP[text]) return KANNADA_PHONETIC_MAP[text];

  let str = text;
  str = str.replace(/ಟೇಬಲ್\s*(\d+)\s*ರಿಂದ ಹೊಸ ಆರ್ಡರ್ ಬಂದಿದೆ/g, "Table $1 rinda hosa order bandide");
  str = str.replace(/ಟೇಬಲ್\s*(\d+)\s*ರವರು ಬಿಲ್ ಕೋರಿದ್ದಾರೆ/g, "Table $1 ravru bill koriddaare");
  str = str.replace(/ಟೇಬಲ್\s*(\d+)\s*ರ ಪಾವತಿ ದೃಢಪಟ್ಟಿದೆ/g, "Table $1 ra payment confirm aagide");
  str = str.replace(/ಟೇಬಲ್\s*(\d+)\s*ರ ಆರ್ಡರ್ ರದ್ದುಮಾಡಲಾಗಿದೆ/g, "Table $1 ra order cancel aagide");
  str = str.replace(/ಟೇಬಲ್\s*(\d+)\s*ಗೆ ಸಹಾಯ ಅಥವಾ ಸೇವೆ ಬೇಕಾಗಿದೆ/g, "Table $1 ge service bekaagide");
  str = str.replace(/ಟೇಬಲ್\s*(\d+)/g, "Table $1");
  str = str.replace(/ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ/g, "request kaluhisalagide");
  str = str.replace(/ಸಿಬ್ಬಂದಿಗೆ ಮಾಹಿತಿ ತಲುಪಿದೆ/g, "staff ge info talupide");

  return str;
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("preferredLanguage") || "en";
  });
  const [voices, setVoices] = useState([]);
  const currentAudioRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) setVoices(v);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "kn" : "en";
    setLanguage(nextLang);
  };

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en?.[key] || key;
  };

  const getItemName = (item) => {
    if (language === "kn" && ITEM_TRANSLATIONS[item?.name]?.knName) {
      return ITEM_TRANSLATIONS[item.name].knName;
    }
    return item?.name || "";
  };

  const getItemDesc = (item) => {
    if (language === "kn" && ITEM_TRANSLATIONS[item?.name]?.knDesc) {
      return ITEM_TRANSLATIONS[item.name].knDesc;
    }
    return item?.description || "";
  };

  const getCategoryName = (category) => {
    if (language === "kn" && CATEGORY_TRANSLATIONS[category]) {
      return CATEGORY_TRANSLATIONS[category];
    }
    return category;
  };

  const matchSearchQuery = (query, item) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    const itemName = (item.name || "").toLowerCase();
    const itemDesc = (item.description || "").toLowerCase();
    const trans = ITEM_TRANSLATIONS[item.name];

    if (itemName.includes(q) || itemDesc.includes(q)) return true;
    if (trans) {
      if (trans.knName.toLowerCase().includes(q)) return true;
      if (trans.knDesc.toLowerCase().includes(q)) return true;
      if (trans.keywords && trans.keywords.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()))) {
        return true;
      }
    }
    return false;
  };

  // Web Speech API Voice Text-To-Speech synthesizer with high-fidelity server-backed Kannada fallback
  const speakText = (text, targetLang) => {
    try {
      if (!text || typeof window === "undefined") return;
      const langToUse = targetLang || language;

      // Stop any existing playing audio
      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
        } catch (_) {}
      }

      const availVoices = voices.length > 0 ? voices : (window.speechSynthesis ? window.speechSynthesis.getVoices() : []);

      if (langToUse === "kn") {
        // Step 1: Check if browser has a native Kannada voice installed (e.g. Gagana / Sapna in Windows)
        const knVoice = availVoices.find((v) => 
          v.lang.toLowerCase().includes("kn") || 
          v.name.toLowerCase().includes("kannada") ||
          v.name.toLowerCase().includes("gagana") ||
          v.name.toLowerCase().includes("sapna")
        );

        if (knVoice && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.voice = knVoice;
          utterance.lang = "kn-IN";
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
          return;
        }

        // Step 2: High-fidelity natural Kannada speech audio streamed from backend TTS
        const streamUrl = `${getApiBaseUrl()}/tts?lang=kn&text=${encodeURIComponent(text)}`;
        const audio = new Audio(streamUrl);
        currentAudioRef.current = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Direct Kannada audio playback error, using phonetic speech:", err);
            // Step 3: Offline / Autoplay fallback - speaks transliterated Kannada so English TTS doesn't drop words
            if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const transliterated = transliterateKannada(text);
              const utterance = new SpeechSynthesisUtterance(transliterated);
              utterance.lang = "en-IN";
              utterance.rate = 0.92;
              const enVoice = availVoices.find((v) => 
                v.lang.toLowerCase().startsWith("en-in") || 
                v.name.toLowerCase().includes("india")
              ) || availVoices.find((v) => v.lang.toLowerCase().startsWith("en"));
              if (enVoice) utterance.voice = enVoice;
              window.speechSynthesis.speak(utterance);
            }
          });
        }
        return;
      }

      // English Voice
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-IN";
        utterance.rate = 0.95;

        const enVoice = availVoices.find((v) => 
          v.lang.toLowerCase().startsWith("en-in") || 
          v.name.toLowerCase().includes("india") ||
          v.name.toLowerCase().includes("ravi") ||
          v.name.toLowerCase().includes("heera")
        ) || availVoices.find((v) => v.lang.toLowerCase().startsWith("en"));

        if (enVoice) utterance.voice = enVoice;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("TTS error:", e);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        speakText,
        getItemName,
        getItemDesc,
        getCategoryName,
        matchSearchQuery
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
