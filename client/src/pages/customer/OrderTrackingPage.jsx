// client/src/pages/customer/OrderTrackingPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getSessionById } from "../../services/api";
import { getOrderStatusStyles } from "../../utils/format";
import LoadingSpinner from "../../components/LoadingSpinner";
import io from "socket.io-client";

const STATUS_ORDER = ["PENDING", "ACCEPTED", "PREPARING", "READY", "SERVED"];
const STATUS_EMOJIS = {
  PENDING: "⏳",
  ACCEPTED: "✅",
  PREPARING: "👨‍🍳",
  READY: "🍽️",
  SERVED: "🎉"
};

export default function OrderTrackingPage() {
  const { sessionId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

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

    // ✅ Real-time updates via Socket.io
    const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
    newSocket.emit("join-session", sessionId);
    
    newSocket.on("order-update", (data) => {
      setOrders(prev => prev.map(order => {
        if (order.id === data.orderId) {
          return {
            ...order,
            items: order.items.map(item =>
              item.id === data.itemId ? { ...item, status: data.status } : item
            )
          };
        }
        return order;
      }));
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [sessionId]);

  const getOverallStatus = (items) => {
    if (!items || items.length === 0) return "PENDING";
    if (items.every(item => item.status === "SERVED")) return "SERVED";
    if (items.some(item => item.status === "PENDING")) return "PENDING";
    if (items.some(item => item.status === "PREPARING")) return "PREPARING";
    if (items.some(item => item.status === "READY")) return "READY";
    return "PENDING";
  };

  const getStatusIndex = (status) => STATUS_ORDER.indexOf(status);

  if (loading) return <LoadingSpinner label="Loading orders..." />;

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl mb-4">🍽️</p>
        <p className="text-gray-500">No orders placed yet.</p>
        <Link
          to={`/session/${sessionId}/menu`}
          className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📋 Order Status</h1>
      
      {orders.map((order) => {
        const overallStatus = getOverallStatus(order.items);
        const statusStyle = getOrderStatusStyles(overallStatus);
        const currentIndex = getStatusIndex(overallStatus);
        const emoji = STATUS_EMOJIS[overallStatus] || "⏳";
        
        return (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            {/* Order Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-mono text-sm font-medium text-gray-700">
                  Order #{order.id.slice(-6)}
                </span>
                <span className="text-sm text-gray-400 ml-3">
                  {new Date(order.placedAt).toLocaleTimeString()}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
                {emoji} {statusStyle.label}
              </span>
            </div>

            {/* Status Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center gap-1">
                {STATUS_ORDER.map((status, idx) => {
                  const isCompleted = idx <= currentIndex;
                  const isActive = idx === currentIndex;
                  return (
                    <div key={status} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full h-2 rounded ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        } ${idx === 0 ? "rounded-l-full" : ""} ${
                          idx === STATUS_ORDER.length - 1 ? "rounded-r-full" : ""
                        }`}
                      />
                      <span
                        className={`text-[10px] mt-1 text-center ${
                          isActive ? "text-blue-600 font-medium" : "text-gray-400"
                        }`}
                      >
                        {status === "PENDING" ? "⏳" : ""}
                        {status === "ACCEPTED" ? "✅" : ""}
                        {status === "PREPARING" ? "👨‍🍳" : ""}
                        {status === "READY" ? "🍽️" : ""}
                        {status === "SERVED" ? "🎉" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-1.5">
              {order.items.map((item) => {
                const itemStyle = getOrderStatusStyles(item.status);
                return (
                  <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                    <span>
                      <span className="font-medium">{item.quantity}x</span> {item.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">₹{item.price * item.quantity}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${itemStyle.bg} ${itemStyle.text}`}>
                        {itemStyle.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-3 pt-2 border-t flex justify-between font-medium">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}