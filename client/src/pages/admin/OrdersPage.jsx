// client/src/pages/admin/OrdersPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, CheckCircle2, ChefHat, Sparkles, Trash2 } from "lucide-react";
import { getAllOrders, updateOrderItemStatus, cancelOrder, cancelOrderItem, getSocketUrl } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import { formatCurrency, getOrderStatus } from "../../utils/format";
import { io } from "socket.io-client";
import { useLanguage } from "../../context/LanguageContext";

const ITEM_STATUS_OPTIONS = ["PENDING", "SERVED"];

const OrdersPage = () => {
  const navigate = useNavigate();
  const { language, t, getItemName } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const statusFilters = [
    { label: t("allOrders"), value: "all" },
    { label: t("pending"), value: "PENDING" },
    { label: t("served"), value: "SERVED" },
  ];

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const socketUrl = getSocketUrl();
    const socket = io(socketUrl);
    socket.emit("join-admin");

    socket.on("order-notification", () => loadOrders());
    socket.on("order-update", () => loadOrders());
    socket.on("order-cancelled", () => loadOrders());

    return () => socket.disconnect();
  }, []);

  const handleItemStatusChange = async (order, itemId, status) => {
    await updateOrderItemStatus(itemId, status);
    loadOrders();
  };

  const markAllServed = async (order) => {
    await Promise.all(
      order.items
        .filter((i) => i.status !== "SERVED")
        .map((i) => updateOrderItemStatus(i.id, "SERVED"))
    );
    loadOrders();
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this entire order?")) return;
    try {
      await cancelOrder(orderId, true);
      loadOrders();
    } catch (err) {
      alert("Failed to cancel order: " + (err.response?.data?.error || err.message));
    }
  };

  const handleCancelItem = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to cancel ${itemName}?`)) return;
    try {
      await cancelOrderItem(itemId, true);
      loadOrders();
    } catch (err) {
      alert("Failed to cancel item: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <LoadingSpinner label="Loading kitchen orders..." />;

  const filteredOrders = orders.filter((order) => {
    const status = getOrderStatus(order);
    const matchesFilter = activeFilter === "all" || status === activeFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(order.tableNumber).includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("kitchenOrders")}</h1>
          <p className="text-sm text-gray-500">{t("kitchenSubtitle")}</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("searchOrderPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-julius-sand rounded-xl w-full sm:w-64 bg-white focus:outline-none focus:ring-2 focus:ring-julius-teal text-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === filter.value
                ? "bg-julius-teal text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-julius-sand"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders Queue */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const status = getOrderStatus(order);
          const total = order.total || order.items.reduce((s, i) => s + i.price * i.quantity, 0);

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm border border-julius-sand overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="px-6 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-[#FBF9F5]">
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-gray-900 text-sm">#{order.id.slice(-6)}</span>
                  <span className="text-xs font-bold px-2.5 py-1 bg-julius-teal/10 text-julius-teal rounded-lg border border-julius-teal/20">
                    {t("table")} {order.tableNumber}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={13} />
                    {new Date(order.placedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(total)}</span>
                  <OrderStatusBadge status={status} />
                </div>
              </div>

              {/* Items List */}
              <div className="p-5 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-gray-50/70 border border-gray-100 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 w-6">{item.quantity}x</span>
                      <div>
                        <span className="font-semibold text-gray-800">{getItemName(item)}</span>
                        {language === "kn" && item.name !== getItemName(item) && (
                          <span className="text-[11px] text-gray-400 block -mt-0.5">{item.name}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">({formatCurrency(item.price)})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={item.status} />
                      {item.status !== "SERVED" && (
                        <>
                          <select
                            value={item.status}
                            onChange={(e) => handleItemStatusChange(order, item.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white font-medium focus:ring-2 focus:ring-julius-teal outline-none"
                          >
                            {ITEM_STATUS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt === "SERVED" ? t("served") : t("pending")}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleCancelItem(item.id, item.name)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
                            title={t("cancelItem")}
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {order.specialInstructions && (
                  <p className="text-xs italic text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2">
                    {language === "kn" ? "ಅಡುಗೆಯವರ ಸೂಚನೆ:" : "Chef Note:"} "{order.specialInstructions}"
                  </p>
                )}
              </div>

              {/* Action Footer */}
              <div className="px-6 py-3 border-t border-gray-100 bg-[#FBF9F5] flex justify-end items-center gap-2.5 flex-wrap">
                {status !== "SERVED" && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                    title={t("cancelOrder")}
                  >
                    <Trash2 size={13} />
                    {t("cancelOrder")}
                  </button>
                )}
                <button
                  onClick={() => navigate(`/admin/tables/${order.sessionId}`)}
                  className="px-4 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700"
                >
                  {t("tableDetails")}
                </button>
                {status !== "SERVED" && (
                  <button
                    onClick={() => markAllServed(order)}
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    {t("markAsServed")}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400 text-sm">
            {t("noActiveOrders")}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
