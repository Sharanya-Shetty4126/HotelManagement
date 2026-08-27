import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { CartProvider } from "./context/CartContext";

// Admin Components
import AdminLayout from "./components/layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLogin from "./pages/auth/AdminLogin";  // ← USE THIS ONE
import DashboardPage from "./pages/admin/DashboardPage";
import TablesPage from "./pages/admin/TablesPage";
import OrdersPage from "./pages/admin/OrdersPage";
import TableSessionPage from "./pages/admin/TableSessionPage";

// Customer Components
import CustomerLayout from "./components/layouts/CustomerLayout";
import SessionEntry from "./pages/customer/SessionEntry";
import MenuPage from "./pages/customer/MenuPage";
import CartPage from "./pages/customer/CartPage";
import OrderTrackingPage from "./pages/customer/OrderTrackingPage";
import BillPage from "./pages/customer/BillPage";
import CallWaiterPage from "./pages/customer/CallWaiterPage";

function CustomerRoute({ children }) {
  return (
    <CartProvider>
      <CustomerLayout>{children}</CustomerLayout>
    </CartProvider>
  );
}

function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute><DashboardPage /></AdminRoute>} />
          <Route path="/admin/tables" element={<AdminRoute><TablesPage /></AdminRoute>} />
          <Route path="/admin/tables/:sessionId" element={<AdminRoute><TableSessionPage /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><OrdersPage /></AdminRoute>} />

          {/* Customer */}
          <Route path="/table/:qrToken" element={<CustomerRoute><SessionEntry /></CustomerRoute>} />
          <Route path="/session/:sessionId/menu" element={<CustomerRoute><MenuPage /></CustomerRoute>} />
          <Route path="/session/:sessionId/cart" element={<CustomerRoute><CartPage /></CustomerRoute>} />
          <Route path="/session/:sessionId/orders" element={<CustomerRoute><OrderTrackingPage /></CustomerRoute>} />
          <Route path="/session/:sessionId/bill" element={<CustomerRoute><BillPage /></CustomerRoute>} />
          <Route path="/session/:sessionId/waiter" element={<CustomerRoute><CallWaiterPage /></CustomerRoute>} />

          <Route path="*" element={<h1 className="text-2xl font-bold p-8">404 - Page Not Found</h1>} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}