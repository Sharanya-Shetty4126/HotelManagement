import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";

// Admin Components
import AdminLayout from "./components/layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLogin from "./pages/auth/AdminLogin";
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

function CustomerRoute() {
  return (
    <CartProvider>
      <CustomerLayout>
        <Outlet />
      </CustomerLayout>
    </CartProvider>
  );
}

function AdminRoute() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AdminAuthProvider>
          <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path="tables" element={<TablesPage />} />
            <Route path="tables/:sessionId" element={<TableSessionPage />} />
            <Route path="orders" element={<OrdersPage />} />
          </Route>

          {/* Customer Entry (Scan QR) */}
          <Route path="/table/:qrToken" element={<SessionEntry />} />

          {/* Customer Active Session (Cart & Layout stay mounted) */}
          <Route path="/session/:sessionId" element={<CustomerRoute />}>
            <Route index element={<Navigate to="menu" replace />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="orders" element={<OrderTrackingPage />} />
            <Route path="bill" element={<BillPage />} />
            <Route path="waiter" element={<CallWaiterPage />} />
          </Route>

          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <span className="text-5xl mb-4">🌊</span>
                <h1 className="text-2xl font-bold text-gray-800">404 - Page Not Found</h1>
                <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
                <a
                  href="/admin"
                  className="mt-6 px-6 py-2.5 bg-julius-teal text-white rounded-xl font-medium hover:bg-julius-teal-light"
                >
                  Return to Dashboard
                </a>
              </div>
            }
          />
        </Routes>
      </AdminAuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}