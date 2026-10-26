// client/src/pages/admin/DashboardPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, ClipboardList, Clock, TrendingUp, Bell, Calendar } from "lucide-react";
import { getDashboardStats, getSocketUrl } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import { formatCurrency } from "../../utils/format";
import { io } from "socket.io-client";
import { useLanguage } from "../../context/LanguageContext";

const DashboardPage = () => {
  const { language, t, getItemName } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
      setError("");
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Real-time updates via Socket.io
    const socketUrl = getSocketUrl();
    const socket = io(socketUrl);
    socket.emit("join-admin");

    socket.on("order-notification", () => loadStats());
    socket.on("order-update", () => loadStats());
    socket.on("bill-notification", () => loadStats());
    socket.on("payment-confirmed", () => loadStats());
    socket.on("session-started", () => loadStats());
    socket.on("customer-request", () => loadStats());
    socket.on("request-resolved", () => loadStats());

    return () => socket.disconnect();
  }, []);

  if (loading) return <LoadingSpinner label={language === "kn" ? "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ..." : "Loading dashboard..."} />;

  const statCards = [
    {
      label: t("activeTables"),
      value: stats?.activeTables ?? 0,
      icon: Users,
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      link: "/admin/tables"
    },
    {
      label: t("todaysOrders"),
      value: stats?.todaysOrders ?? 0,
      icon: ClipboardList,
      iconBg: "bg-green-100",
      iconText: "text-green-600",
      link: "/admin/orders"
    },
    {
      label: t("pendingOrders"),
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      link: "/admin/orders"
    },
    {
      label: t("waiterCalls"),
      value: stats?.unresolvedRequests ?? 0,
      icon: Bell,
      iconBg: "bg-red-100",
      iconText: "text-red-600",
      badge: stats?.unresolvedRequests > 0 ? t("urgent") : null
    },
    {
      label: t("revenueToday"),
      value: formatCurrency(stats?.revenueToday ?? 0),
      icon: TrendingUp,
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
    },
    {
      label: t("revenueThisMonth"),
      value: formatCurrency(stats?.revenueThisMonth ?? 0),
      icon: Calendar,
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-600",
    },
  ];

  const recentOrders = stats?.recentOrders || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("dashboard")}</h1>
          <p className="text-gray-600">{t("overviewSubtitle")}</p>
        </div>
        <button
          onClick={loadStats}
          className="self-start text-xs font-medium px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
        >
          {language === "kn" ? "🔄 ನವೀಕರಿಸಿ" : "🔄 Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconText, link, badge }) => {
          const Content = (
            <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-2.5 ${iconBg} rounded-xl`}>
                  <Icon className={iconText} size={22} />
                </div>
              </div>
              {badge && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  {badge}
                </span>
              )}
            </div>
          );

          return link ? (
            <Link key={label} to={link}>
              {Content}
            </Link>
          ) : (
            <div key={label}>{Content}</div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">{t("recentOrders")}</h2>
          </div>
          <Link to="/admin/orders" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            {language === "kn" ? "ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ →" : "View All Orders →"}
          </Link>
        </div>

        <div className="divide-y">
          {recentOrders.map((order) => {
            const itemsLabel = (order.items || []).map((i) => `${i.quantity}x ${getItemName(i)}`).join(", ");
            const total = order.total || (order.items || []).reduce((s, i) => s + i.price * i.quantity, 0);

            return (
              <Link
                to={`/admin/tables/${order.sessionId}`}
                key={order.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-gray-800">
                      {t("order")} #{order.id.slice(-6)}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-medium">
                      {t("table")} {order.tableNumber}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.placedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1 truncate">{itemsLabel}</div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(total)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            );
          })}

          {recentOrders.length === 0 && (
            <p className="px-6 py-12 text-center text-gray-400 text-sm">
              {language === "kn" ? "ಇಂದು ಯಾವುದೇ ಆರ್ಡರ್‌ಗಳು ದಾಖಲಾಗಿಲ್ಲ." : "No orders recorded yet today."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
