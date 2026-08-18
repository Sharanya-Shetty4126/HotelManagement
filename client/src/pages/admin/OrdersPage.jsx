// client/src/pages/admin/OrdersPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { getAllOrders, updateOrderItemStatus } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import { formatCurrency, getOrderStatus } from "../../utils/format";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Served", value: "SERVED" },
];

const ITEM_STATUS_OPTIONS = ["PENDING", "PREPARING", "READY", "SERVED"];

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadOrders = () => {
    getAllOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  };

  useEffect(loadOrders, []);

  const handleItemStatusChange = async (order, itemId, status) => {
    await updateOrderItemStatus(order.sessionId, order.id, itemId, status);
    loadOrders();
  };

  const markAllReady = async (order) => {
    await Promise.all(
      order.items
        .filter((i) => i.status !== "SERVED")
        .map((i) => updateOrderItemStatus(order.sessionId, order.id, i.id, "READY"))
    );
    loadOrders();
  };

  if (loading) return <LoadingSpinner label="Loading orders..." />;

  const filteredOrders = orders.filter((order) => {
    const status = getOrderStatus(order);
    const matchesFilter = activeFilter === "all" || status === activeFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(order.tableNumber).includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage incoming orders</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order id or table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === filter.value ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const status = getOrderStatus(order);
          const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
          return (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 bg-gray-50">
                <div className="flex items-center gap-6">
                  <span className="font-mono font-semibold text-gray-800">{order.id}</span>
                  <span className="text-sm text-gray-600">Table {order.tableNumber}</span>
                  <span className="text-sm text-gray-400">{order.placedAt}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{formatCurrency(total)}</span>
                  <OrderStatusBadge status={status} />
                </div>
              </div>

              <div className="px-6 py-4 space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">{item.quantity}x</span>
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm text-gray-500">{formatCurrency(item.price)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={item.status} />
                      {item.status !== "SERVED" && (
                        <select
                          value={item.status}
                          onChange={(e) => handleItemStatusChange(order, item.id, e.target.value)}
                          className="text-xs border rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {ITEM_STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt.charAt(0) + opt.slice(1).toLowerCase()}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-3 border-t bg-gray-50 flex justify-end gap-2">
                <button
                  onClick={() => navigate(`/admin/tables/${order.sessionId}`)}
                  className="px-4 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50"
                >
                  View Details
                </button>
                {status !== "SERVED" && (
                  <button
                    onClick={() => markAllReady(order)}
                    className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Mark All Ready
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filteredOrders.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-12">No orders match your filters.</p>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
