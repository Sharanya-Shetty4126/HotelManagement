// client/src/services/api.js
import axios from 'axios';

export function getSocketUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined") {
    if (window.location.hostname.includes("onrender.com")) {
      return window.location.origin;
    }
    if (window.location.hostname.includes("pages.dev") || window.location.protocol === "https:") {
      return "https://hotelmanagement-2qak.onrender.com";
    }
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return `http://${window.location.hostname}:5000`;
    }
  }
  return "http://localhost:5000";
}

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`;
  }
  if (typeof window !== "undefined") {
    if (window.location.hostname.includes("onrender.com")) {
      return `${window.location.origin}/api`;
    }
    if (window.location.hostname.includes("pages.dev") || window.location.protocol === "https:") {
      return "https://hotelmanagement-2qak.onrender.com/api";
    }
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return `http://${window.location.hostname}:5000/api`;
    }
  }
  return "http://localhost:5000/api";
};

const axiosClient = axios.create({
  baseURL: getApiBase(),
  timeout: 25000,
});

// Auto-add JWT token to every request (if it exists)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to format errors nicely
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminName');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// AUTH
// ============================================================
export async function loginAdmin(username, password) {
  const response = await axiosClient.post('/auth/login', { username, password });
  return response.data;
}

// ============================================================
// DASHBOARD
// ============================================================
export async function getDashboardStats() {
  const response = await axiosClient.get('/dashboard/stats');
  return response.data;
}

export async function getDailyRevenue(days = 7) {
  const response = await axiosClient.get(`/dashboard/revenue/daily?days=${days}`);
  return response.data;
}

// ============================================================
// MENU
// ============================================================
export async function getMenu() {
  const response = await axiosClient.get('/menu');
  return response.data;
}

// ============================================================
// SESSION
// ============================================================
export async function getSessionEntry(qrToken) {
  const response = await axiosClient.get(`/session/entry/${qrToken}`);
  return response.data;
}

export async function createSession(qrToken, guestCount = 1) {
  const response = await axiosClient.post('/session/create', { qrToken, guestCount });
  return response.data;
}

export async function joinSession(qrToken, sessionCode) {
  const response = await axiosClient.post('/session/join', { qrToken, sessionCode });
  return response.data;
}

export async function getSessionById(sessionId) {
  const response = await axiosClient.get(`/session/${sessionId}`);
  return response.data;
}

export async function generateBill(sessionId) {
  const response = await axiosClient.post(`/session/${sessionId}/bill`);
  return response.data;
}

export async function confirmPayment(sessionId) {
  const response = await axiosClient.put(`/session/${sessionId}/pay`);
  return response.data;
}

export async function payBillOnline(sessionId, paymentData = {}) {
  const response = await axiosClient.post(`/session/${sessionId}/pay-online`, paymentData);
  return response.data;
}

// ============================================================
// ORDER
// ============================================================
export async function placeOrder(sessionId, items, specialInstructions = '') {
  const response = await axiosClient.post('/order', {
    sessionId,
    items,
    specialInstructions
  });
  return response.data;
}

export async function getAllOrders() {
  const response = await axiosClient.get('/order');
  return response.data;
}

export async function updateOrderItemStatus(itemId, status) {
  const response = await axiosClient.put(`/order/item/${itemId}/status`, { status });
  return response.data;
}

export async function cancelOrder(orderId, isAdmin = false) {
  const response = await axiosClient.delete(`/order/${orderId}${isAdmin ? '?admin=true' : ''}`);
  return response.data;
}

export async function cancelOrderItem(itemId, isAdmin = false) {
  const response = await axiosClient.delete(`/order/item/${itemId}${isAdmin ? '?admin=true' : ''}`);
  return response.data;
}

// ============================================================
// TABLES
// ============================================================
export async function getTables() {
  const response = await axiosClient.get('/tables');
  return response.data;
}

export async function createTable(number, section, capacity) {
  const response = await axiosClient.post('/tables', { number, section, capacity });
  return response.data;
}

export async function updateTable(id, number, section, capacity) {
  const response = await axiosClient.put(`/tables/${id}`, { number, section, capacity });
  return response.data;
}

export async function deleteTable(id) {
  const response = await axiosClient.delete(`/tables/${id}`);
  return response.data;
}

export async function startTableSession(tableId, guestCount = 2) {
  const response = await axiosClient.post(`/tables/${tableId}/session`, { guestCount });
  return response.data;
}

// ============================================================
// SERVICE REQUESTS / CALL WAITER
// ============================================================
export async function createCustomerRequest(sessionId, type, description = '') {
  const response = await axiosClient.post('/requests', { sessionId, type, description });
  return response.data;
}

export async function getSessionRequests(sessionId) {
  const response = await axiosClient.get(`/requests/session/${sessionId}`);
  return response.data;
}

export async function getAllRequests() {
  const response = await axiosClient.get('/requests');
  return response.data;
}

export async function resolveCustomerRequest(requestId) {
  const response = await axiosClient.put(`/requests/${requestId}/resolve`);
  return response.data;
}