// client/src/pages/customer/OrderTrackingPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getSessionById, getSocketUrl } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import io from "socket.io-client";
import { Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function OrderTrackingPage() {
  const { sessionId } = useParams();
  const { t, language, getItemName } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await getSessionById(sessionId);
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Real-time updates via Socket.io
    const socketUrl = getSocketUrl();
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    const joinSession = () => {
      if (sessionId) {
        newSocket.emit("join-session", sessionId);
      }
    };

    newSocket.on("connect", joinSession);
    if (newSocket.connected) {
      joinSession();
    }

    newSocket.on("order-update", () => {
      fetchOrders();
    });

    const interval = setInterval(fetchOrders, 8000);

    return () => {
      clearInterval(interval);
      newSocket.disconnect();
    };
  }, [sessionId]);

  const getOverallStatus = (items) => {
    if (!items || items.length === 0) return "PENDING";
    if (items.every((item) => item.status === "SERVED")) return "SERVED";
    return "PENDING";
  };

  if (loading) return <LoadingSpinner label="Loading orders..." />;

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border p-8 max-w-md mx-auto">
        <p className="text-4xl mb-3">🍽️</p>
        <h2 className="text-xl font-bold text-gray-800">No Orders Placed Yet</h2>
        <p className="text-gray-500 text-sm mt-1 mb-6">Choose delicious items from our coastal menu.</p>
        <Link
          to={`/session/${sessionId}/menu`}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-julius-teal text-white rounded-xl font-semibold hover:bg-julius-teal-light shadow-sm transition-colors text-sm"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-12 font-sans space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Link
            to={`/session/${sessionId}/menu`}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📋 {t("liveOrders")}</h1>
            <p className="text-xs text-gray-500">{t("trackOrdersDesc")}</p>
          </div>
        </div>
      </div>

      {orders.map((order) => {
        const overallStatus = getOverallStatus(order.items);
        const isServed = overallStatus === "SERVED";

        return (
          <div
            key={order.id}
            className="bg-white rounded-2xl shadow-sm border border-julius-sand overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-[#FBF9F5] border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-gray-800">
                  #{order.id.slice(-6)}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(order.placedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  isServed
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                <span>{isServed ? "🎉" : "⏳"}</span>
                <span>{isServed ? t("served") : t("pending")}</span>
              </span>
            </div>

            {/* Clean 2-Step Progress Bar (Pending -> Served) */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className={isServed ? "text-emerald-700" : "text-amber-700"}>
                  1. {t("orderReceived")}
                </span>
                <span className={isServed ? "text-emerald-700" : "text-gray-400"}>
                  2. {t("served")}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isServed ? "w-full bg-emerald-500" : "w-1/2 bg-amber-400 animate-pulse"
                  }`}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="px-5 py-2 divide-y divide-gray-100 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-gray-900 w-5">{item.quantity}x</span>
                    <div>
                      <span className="font-medium text-gray-800">{getItemName(item)}</span>
                      {language === "kn" && item.name !== getItemName(item) && (
                        <span className="text-[11px] text-gray-400 block -mt-0.5">{item.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-medium text-gray-600 text-xs">₹{item.price * item.quantity}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === "SERVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status === "SERVED" ? t("served") : t("pending")}
                    </span>
                  </div>
                </div>
              ))}

              {order.specialInstructions && (
                <p className="py-2 text-xs italic text-amber-700 bg-amber-50/60 px-3 rounded-lg my-1">
                  Note: "{order.specialInstructions}"
                </p>
              )}
            </div>

            {/* Footer with Total and Status */}
            <div className="px-5 py-3 bg-[#FBF9F5] border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t("total")}:</span>
                <span className="text-base font-bold text-julius-teal">₹{order.total}</span>
              </div>

              <div>
                {isServed ? (
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 size={13} /> {t("completed")}
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-800 font-bold flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Clock size={13} /> {t("pending")}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}