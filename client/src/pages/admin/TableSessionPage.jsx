// client/src/pages/admin/TableSessionPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSessionById, updateOrderItemStatus, confirmPayment, generateBill, cancelOrder, cancelOrderItem, getSocketUrl } from "../../services/api";
import { formatCurrency } from "../../utils/format";
import LoadingSpinner from "../../components/LoadingSpinner";
import { ArrowLeft, CheckCircle2, Clock, Receipt, UserCheck, Trash2 } from "lucide-react";
import { io } from "socket.io-client";
import { useLanguage } from "../../context/LanguageContext";

export default function TableSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { language, t, getItemName } = useLanguage();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [generatingBill, setGeneratingBill] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState("");

  const fetchSession = async () => {
    try {
      setError("");
      const data = await getSessionById(sessionId);
      setSession(data);
    } catch (err) {
      console.error("Failed to fetch session:", err);
      setError(err.response?.data?.error || "Failed to load session details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSession();

    const socketUrl = getSocketUrl();
    const socket = io(socketUrl);
    socket.emit("join-admin");
    socket.emit("join-session", sessionId);

    socket.on("order-notification", () => fetchSession());
    socket.on("order-update", () => fetchSession());
    socket.on("order-cancelled", () => fetchSession());
    socket.on("bill-notification", () => fetchSession());
    socket.on("payment-confirmed", () => fetchSession());

    return () => socket.disconnect();
  }, [sessionId]);

  const handleUpdateStatus = async (itemId, status) => {
    setUpdating(true);
    // Optimistic local update
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        orders: (prev.orders || []).map((order) => ({
          ...order,
          items: (order.items || []).map((item) =>
            item.id === itemId ? { ...item, status } : item
          )
        }))
      };
    });

    try {
      await updateOrderItemStatus(itemId, status);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update item status: " + (err.response?.data?.error || err.message));
      fetchSession();
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this entire order?")) return;
    // Optimistic local update
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        orders: (prev.orders || []).filter((order) => order.id !== orderId)
      };
    });

    try {
      await cancelOrder(orderId, true);
    } catch (err) {
      alert("Failed to cancel order: " + (err.response?.data?.error || err.message));
      fetchSession();
    }
  };

  const handleCancelItem = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to cancel ${itemName}?`)) return;
    // Optimistic local update
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        orders: (prev.orders || []).map((order) => ({
          ...order,
          items: (order.items || []).filter((item) => item.id !== itemId)
        }))
      };
    });

    try {
      await cancelOrderItem(itemId, true);
    } catch (err) {
      alert("Failed to cancel item: " + (err.response?.data?.error || err.message));
      fetchSession();
    }
  };

  const handleAdminGenerateBill = async () => {
    setGeneratingBill(true);
    try {
      await generateBill(sessionId);
      await fetchSession();
    } catch (err) {
      console.error("Generate bill error:", err);
      alert("Failed to generate bill: " + (err.response?.data?.error || err.message));
    } finally {
      setGeneratingBill(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!session?.bill) {
      alert("No bill to pay.");
      return;
    }
    if (session.bill.paymentConfirmed) {
      alert("Payment already confirmed.");
      return;
    }
    if (!window.confirm(`Confirm payment of ₹${session.bill.grandTotal} and close Table ${session.tableNumber}?`)) {
      return;
    }

    setProcessingPayment(true);
    try {
      const response = await confirmPayment(sessionId);
      if (response.success) {
        alert("✅ Payment confirmed! Table is now free.");
        navigate("/admin/tables");
      } else {
        alert("Payment failed: " + response.message);
      }
    } catch (err) {
      console.error("Payment error:", err);
      const msg = err.response?.data?.error || "Failed to confirm payment";
      alert("❌ " + msg);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label={language === "kn" ? "ಸೆಷನ್ ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." : "Loading session..."} />;
  }

  if (error || !session) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border p-8 max-w-md mx-auto">
        <p className="text-rose-600 font-semibold mb-4">
          {error || (language === "kn" ? "ಸೆಷನ್ ಕಂಡುಬಂದಿಲ್ಲ" : "Session not found")}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              fetchSession();
            }}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors text-sm"
          >
            {language === "kn" ? "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" : "Try Again"}
          </button>
          <button
            onClick={() => navigate("/admin/tables")}
            className="px-5 py-2 bg-julius-teal text-white rounded-xl font-medium hover:bg-julius-teal-light text-sm"
          >
            {language === "kn" ? "← ಟೇಬಲ್‌ಗಳಿಗೆ ಹಿಂತಿರುಗಿ" : "← Back to Tables"}
          </button>
        </div>
      </div>
    );
  }

  const isPaid = session.bill?.paymentConfirmed || false;
  const isClosed = session.status === "CLOSED";

  const calculateTotals = () => {
    const subtotal =
      (session.orders || []).reduce((sum, order) => {
        return sum + (order.items || []).reduce((s, item) => s + item.price * item.quantity, 0);
      }, 0) || 0;

    const tax = Math.round(subtotal * 0.05);
    const serviceCharge = Math.round(subtotal * 0.1);
    const grandTotal = subtotal + tax + serviceCharge;
    return { subtotal, tax, serviceCharge, grandTotal };
  };

  const totals = session.bill
    ? {
        subtotal: session.bill.total ?? session.bill.subtotal ?? 0,
        tax: session.bill.tax ?? 0,
        serviceCharge: session.bill.serviceCharge ?? 0,
        grandTotal: session.bill.grandTotal ?? 0,
      }
    : calculateTotals();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-julius-sand">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/tables")}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{t("table")} {session.tableNumber}</h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {t("code")}: {session.sessionCode}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
              <span>{language === "kn" ? "ಆಸೀನರಾದ ಸಮಯ:" : "Seated:"} {new Date(session.startedAt).toLocaleTimeString()}</span>
              <span>·</span>
              <span>{session.guestCount} {t("guestCount")}</span>
              <span>·</span>
              <span>{t("filterSection")}: {language === "kn" ? (session.table?.section === "AC" ? "ಎಸಿ" : "ನಾನ್-ಎಸಿ") : session.table?.section || "Dining"}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {!session.bill && !isClosed && (
            <button
              onClick={handleAdminGenerateBill}
              disabled={generatingBill || session.orders?.length === 0}
              className="px-4 py-2 bg-julius-teal text-white rounded-xl text-sm font-semibold hover:bg-julius-teal-light shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Receipt size={16} />
              {generatingBill ? (language === "kn" ? "ರಚಿಸಲಾಗುತ್ತಿದೆ..." : "Generating...") : t("generateBill")}
            </button>
          )}

          {!isClosed && session.bill && !isPaid && (
            <button
              onClick={handleConfirmPayment}
              disabled={processingPayment}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              {processingPayment ? (language === "kn" ? "ಪಾವತಿಸಲಾಗುತ್ತಿದೆ..." : "Closing...") : `${t("confirmPayment")} (₹${totals.grandTotal})`}
            </button>
          )}

          {isPaid && (
            <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 size={16} /> {t("sessionPaidClosed")}
            </span>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">{t("orders")} ({session.orders?.length || 0})</h2>
        </div>

        {session.orders?.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-julius-sand overflow-hidden">
            <div className="px-5 py-3.5 bg-gray-50/80 border-b flex items-center justify-between text-xs font-semibold text-gray-500 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-gray-800">#{order.id.slice(-6)}</span>
                <span>{new Date(order.placedAt).toLocaleTimeString()}</span>
              </div>
              {!isClosed && order.items?.some((i) => i.status !== "SERVED") && (
                <button
                  onClick={() => handleCancelOrder(order.id)}
                  className="px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 active:scale-95"
                  title={t("cancelOrder")}
                >
                  <Trash2 size={12} />
                  {t("cancelOrder")}
                </button>
              )}
            </div>

            <div className="p-4 space-y-2">
              {(order.items || []).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#FBF9F5] rounded-xl border border-julius-sand/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-gray-900 w-7">{item.quantity}x</span>
                    <span className="text-sm font-semibold text-gray-800">{getItemName(item)}</span>
                    <span className="text-xs text-gray-400">₹{item.price} each</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.status === "SERVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status === "SERVED" ? t("served") : t("pending")}
                    </span>

                    {!isClosed && item.status !== "SERVED" && (
                      <>
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          disabled={updating}
                          className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white font-medium focus:ring-2 focus:ring-julius-teal outline-none"
                        >
                          <option value="PENDING">{t("pending")}</option>
                          <option value="SERVED">{t("served")}</option>
                        </select>
                        <button
                          onClick={() => handleCancelItem(item.id, item.name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
                          title={t("cancelOrder")}
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {order.specialInstructions && (
                <p className="text-xs italic text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  {t("specialInstructions")}: "{order.specialInstructions}"
                </p>
              )}
            </div>
          </div>
        ))}

        {session.orders?.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400 text-sm">
            {t("noOrders")}
          </div>
        )}
      </div>

      {/* Bill Calculation Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-julius-sand p-6">
        <h3 className="font-serif font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Receipt size={18} className="text-julius-teal" />
          {t("financialBreakdown")}
        </h3>
        <div className="space-y-2.5 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>{t("itemsSubtotal")}</span>
            <span className="font-medium text-gray-900">{formatCurrency(totals.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span className="font-medium text-gray-900">{formatCurrency(totals.tax || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Charge (10%)</span>
            <span className="font-medium text-gray-900">{formatCurrency(totals.serviceCharge || 0)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-xl text-gray-900">
            <span>{t("grandTotal")}</span>
            <span className="text-julius-teal">{formatCurrency(totals.grandTotal || 0)}</span>
          </div>
          <div className="pt-2 text-xs flex items-center gap-2">
            <span className="text-gray-400">{t("paymentStatus")}:</span>
            <span className={`font-bold ${isPaid ? "text-emerald-600" : "text-amber-600"}`}>
              {isPaid
                ? (language === "kn" ? "✅ ಪಾವತಿಸಲಾಗಿದೆ ಮತ್ತು ದೃಢೀಕರಿಸಲಾಗಿದೆ" : "✅ Paid & Confirmed")
                : session.bill
                ? (language === "kn" ? "⏳ ಬಿಲ್ ಸಿದ್ಧವಾಗಿದೆ (ಪಾವತಿಯಾಗಿಲ್ಲ)" : "⏳ Bill Generated (Unpaid)")
                : (language === "kn" ? "📝 ಪ್ರಗತಿಯಲ್ಲಿದೆ" : "📝 In Progress")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}