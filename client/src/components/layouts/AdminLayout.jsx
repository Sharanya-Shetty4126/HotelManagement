import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { LayoutDashboard, Table2, ClipboardList, LogOut, Menu, X, ShieldCheck, Globe } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useLanguage } from "../../context/LanguageContext";
import AdminNotifications from "../AdminNotifications";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { adminName, logout } = useAdminAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const NAV_ITEMS = [
    { path: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { path: "/admin/tables", label: t("tables"), icon: Table2 },
    { path: "/admin/orders", label: t("orders"), icon: ClipboardList },
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-[#FBF9F5] overflow-hidden font-sans text-julius-charcoal">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-sm border-r border-julius-sand transition-all duration-300 flex flex-col z-20`}
      >
        <div className="p-4 border-b border-julius-sand flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="text-2xl flex-shrink-0">🐚</span>
            {sidebarOpen && (
              <div>
                <span className="font-serif font-bold text-lg text-julius-teal block leading-tight">Julius</span>
                <span className="text-[10px] text-julius-gold font-bold tracking-wider uppercase">
                  {language === "kn" ? "ಕರಾವಳಿ · ಬಾರ್ ನಿರ್ವಹಣೆ" : "Coastal · Bar Admin"}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-julius-teal text-white shadow-sm shadow-julius-teal/20"
                    : "text-gray-600 hover:bg-julius-sand/50 hover:text-julius-teal"
                }`}
              >
                <Icon size={19} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="border-t border-julius-sand p-3.5 bg-julius-cream">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-julius-teal text-julius-gold flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0 border border-julius-gold/30">
              {(adminName || "A").charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-800 truncate">{adminName || "Julius Staff"}</div>
                <div className="text-[11px] text-gray-400 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  {t("staffVerified")}
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
              title={t("logout")}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-julius-sand flex items-center justify-between px-6 z-10 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("liveSystemActive")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* 🌐 Language Switch Toggle (English / ಕನ್ನಡ) */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl border border-julius-sand bg-julius-cream hover:bg-julius-sand/50 text-julius-teal text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
              title={language === "kn" ? "Switch to English" : "ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿ"}
            >
              <Globe size={14} className="text-julius-teal" />
              <span>{language === "kn" ? "ಕನ್ನಡ" : "English"}</span>
            </button>

            <AdminNotifications />
          </div>
        </header>

        {/* Scrollable page body */}
        <main className="flex-1 overflow-auto p-6 md:p-8 bg-[#FBF9F5]">
          <div className="max-w-7xl mx-auto">{children || <Outlet />}</div>
        </main>
      </div>
    </div>
  );
}
