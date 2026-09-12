import axios from 'axios';

// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Change this line temporarily:
const API_BASE = 'http://192.168.0.144:5000/api';
// ✅ Create axios instance with token interceptor
const axiosClient = axios.create({
  baseURL: API_BASE,
});

// ✅ Auto-add JWT token to every request (if it exists)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// AUTH
// ============================================================
export async function loginAdmin(username, password) {
  const response = await axiosClient.post('/auth/login', { username, password });
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