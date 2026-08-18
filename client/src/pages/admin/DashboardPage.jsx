// client/src/pages/admin/DashboardPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, ClipboardList, Clock, TrendingUp } from "lucide-react";
import { getAllOrders, getTables } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import { formatCurrency, getOrderStatus } from "../../utils/format";

const DashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllOrders(), getTables()]).then(([o, t]) => {
      setOrders(o);
      setTables(t);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;

  const activeTables = tables.filter((t) => t.status === "occupied").length;
  const pendingOrders = orders.filter((o) => getOrderStatus(o) === "PENDING").length;
  const revenueToday = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0),
    0
  );

  // Tailwind's JIT scanner needs full class strings to appear literally in
  // the source — building them with `bg-${tint}-100` would silently produce
  // no styles, so each stat carries its complete class names instead.
  const stats = [
    { label: "Active Tables", value: activeTables, icon: Users, iconBg: "bg-blue-100", iconText: "text-blue-600" },
    { label: "Today's Orders", value: orders.length, icon: ClipboardList, iconBg: "bg-green-100", iconText: "text-green-600" },
    { label: "Pending Orders", value: pendingOrders, icon: Clock, iconBg: "bg-red-100", iconText: "text-red-600" },
    { label: "Revenue Today", value: formatCurrency(revenueToday), icon: TrendingUp, iconBg: "bg-purple-100", iconText: "text-purple-600" },
  ];

  const recentOrders = [...orders].slice(-5).reverse();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, iconBg, iconText }) => (
          <div key={label} className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
              <div className={`p-2 ${iconBg} rounded-lg`}>
                <Icon className={iconText} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        <div className="divide-y">
          {recentOrders.map((order) => {
            const itemsLabel = order.items.map((i) => i.name).join(", ");
            const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
            return (
              <Link
                to={`/admin/tables/${order.sessionId}`}
                key={order.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium text-gray-700">{order.id}</span>
                    <span className="text-sm">Table {order.tableNumber}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1 truncate">{itemsLabel}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{formatCurrency(total)}</span>
                  <OrderStatusBadge status={getOrderStatus(order)} />
                </div>
              </Link>
            );
          })}
          {recentOrders.length === 0 && (
            <p className="px-6 py-8 text-center text-gray-500 text-sm">No orders yet today.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
