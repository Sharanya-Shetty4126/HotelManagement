import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ✅ Create axios instance with interceptor
const axiosClient = axios.create({
  baseURL: API_BASE,
});

// ✅ Auto-add token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'||'http://192.168.1.6:5000/api';
// const API_BASE = ;
// const API_BASE = 'http://192.168.1.6:5000/api';
// ============================================================
// MENU API
// ============================================================

export async function getMenu() {
  try {
    const response = await axios.get(`${API_BASE}/menu`);
    return response.data;
  } catch (error) {
    console.error('Get menu error:', error);
    throw error;
  }
}

// ============================================================
// SESSION API
// ============================================================

export async function getSessionEntry(qrToken) {
  try {
    const response = await axios.get(`${API_BASE}/session/entry/${qrToken}`);
    return response.data;
  } catch (error) {
    console.error('Get session entry error:', error);
    throw error;
  }
}

export async function getSessionByToken(qrToken) {
  try {
    const response = await axios.get(`${API_BASE}/session/entry/${qrToken}`);
    return response.data;
  } catch (error) {
    console.error('Get session by token error:', error);
    throw error;
  }
}

export async function createSession(qrToken, guestCount = 1) {
  try {
    const response = await axios.post(`${API_BASE}/session/create`, {
      qrToken,
      guestCount
    });
    return response.data;
  } catch (error) {
    console.error('Create session error:', error);
    throw error;
  }
}

export async function joinSession(qrToken, sessionCode) {
  try {
    const response = await axios.post(`${API_BASE}/session/join`, {
      qrToken,
      sessionCode
    });
    return response.data;
  } catch (error) {
    console.error('Join session error:', error);
    throw error;
  }
}
export async function getSessionById(sessionId) {
  const response = await axiosClient.get(`/session/${sessionId}`);
  return response.data;
}

// ============================================================
// ORDER API
// ============================================================

export async function placeOrder(sessionId, items, specialInstructions = '') {
  try {
    const response = await axios.post(`${API_BASE}/order`, {
      sessionId,
      items,
      specialInstructions
    });
    return response.data;
  } catch (error) {
    console.error('Place order error:', error);
    throw error;
  }
}
export async function getAllOrders() {
  try {
    const response = await axios.get(
      `${API_BASE}/order`,
      adminRequest()
    );
    return response.data;
  } catch (error) {
    console.error("Get orders error:", error);
    throw error;
  }
}

export async function updateOrderItemStatus(itemId, status) {
  try {
    const response = await axios.put(
      `${API_BASE}/order/item/${itemId}/status`,
      { status },
      adminRequest()
    );
    return response.data;
  } catch (error) {
    console.error("Update item status error:", error);
    throw error;
  }
}

// ============================================================
// ADMIN AUTH API
// ============================================================

export async function loginAdmin(username, password) {
  const response = await axiosClient.post('/auth/login', { username, password });
  return response.data;
}


// ============================================================
// TABLE API
// ============================================================

export async function getTables() {
  try {
    const response = await axios.get(`${API_BASE}/tables`);
    return response.data;
  } catch (error) {
    console.error('Get tables error:', error);
    throw error;
  }
}

export async function createTable(number, section, capacity) {
  try {
    const response = await axios.post(`${API_BASE}/tables`, {
      number,
      section,
      capacity
    });
    return response.data;
  } catch (error) {
    console.error('Create table error:', error);
    throw error;
  }
}

export async function updateTable(id, number, section, capacity) {
  try {
    const response = await axios.put(`${API_BASE}/tables/${id}`, {
      number,
      section,
      capacity
    });
    return response.data;
  } catch (error) {
    console.error('Update table error:', error);
    throw error;
  }
}// ============================================================
// BILL API
// ============================================================
export async function confirmPayment(sessionId) {
  const response = await axiosClient.put(`/session/${sessionId}/pay`);
  return response.data;
}

export async function generateBill(sessionId) {
  const response = await axiosClient.post(`/session/${sessionId}/bill`);
  return response.data;
}