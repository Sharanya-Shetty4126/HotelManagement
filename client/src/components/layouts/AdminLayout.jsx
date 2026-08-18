import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Table2, ClipboardList, LogOut, Menu, X } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

const NAV_ITEMS = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/tables", label: "Tables", icon: Table2 },
  { path: "/admin/orders", label: "Orders", icon: ClipboardList },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { adminName, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏨</span>
            {sidebarOpen && <span className="font-bold text-lg">Hotel Admin</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-gray-100">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {(adminName || "A").charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <div className="text-sm font-medium">{adminName || "Admin"}</div>
                <div className="text-xs text-gray-500">Restaurant Admin</div>
              </div>
            )}
            <button onClick={handleLogout} className="p-1.5 rounded hover:bg-gray-100" title="Logout">
              <LogOut size={18} className="text-red-500" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
