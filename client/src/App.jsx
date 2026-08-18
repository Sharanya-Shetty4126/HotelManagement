import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import AdminLayout from "./components/AdminLayout";

import DashboardPage from "./pages/admin/DashboardPage";
import TablesPage from "./pages/admin/TablesPage";
import OrdersPage from "./pages/admin/OrdersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/admin" replace />}
        />

        <Route
          path="/admin"
          element={
            <AdminLayout>
              <DashboardPage />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/tables"
          element={
            <AdminLayout>
              <TablesPage />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminLayout>
              <OrdersPage />
            </AdminLayout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;