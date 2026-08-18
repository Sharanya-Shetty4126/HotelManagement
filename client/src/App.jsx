import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/layouts/AdminLayout";
import CustomerLayout from "./components/layouts/CustomerLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import { CartProvider } from "./context/CartContext";

// Admin Pages
import LoginPage from "./pages/admin/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import TablesPage from "./pages/admin/TablesPage";
import TableSessionPage from "./pages/admin/TableSessionPage";
import OrdersPage from "./pages/admin/OrdersPage";

// Customer Pages
import MenuPage from "./pages/customer/MenuPage";
import CartPage from "./pages/customer/CartPage";
import OrderTrackingPage from "./pages/customer/OrderTrackingPage";
import BillPage from "./pages/customer/BillPage";

// The customer-facing routes all live under /table/:token. CartProvider
// reads that :token param itself, so it has to render *inside* the Route
// (not wrap the whole app) — this small wrapper keeps that pairing in one
// place instead of repeating it on every customer route below.
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
      <Routes>
        {/* Root redirects to admin for now. Once a real landing/entry page
            exists this should probably become that instead. */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Admin */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminRoute><DashboardPage /></AdminRoute>} />
        <Route path="/admin/tables" element={<AdminRoute><TablesPage /></AdminRoute>} />
        <Route path="/admin/tables/:sessionId" element={<AdminRoute><TableSessionPage /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><OrdersPage /></AdminRoute>} />

        {/* Customer — reached by scanning the QR code on a table, which
            encodes a secure token, never a raw table id (see spec). */}
        <Route path="/table/:token" element={<CustomerRoute><MenuPage /></CustomerRoute>} />
        <Route path="/table/:token/cart" element={<CustomerRoute><CartPage /></CustomerRoute>} />
        <Route path="/table/:token/orders" element={<CustomerRoute><OrderTrackingPage /></CustomerRoute>} />
        <Route path="/table/:token/bill" element={<CustomerRoute><BillPage /></CustomerRoute>} />

        {/* Fallback */}
        <Route path="*" element={<h1 className="text-2xl font-bold p-8">404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
