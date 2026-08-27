// client/src/pages/admin/TableSessionPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSessionById, updateOrderItemStatus } from "../../services/api";
import { formatCurrency } from "../../utils/format";
import LoadingSpinner from "../../components/LoadingSpinner";
import axios from "axios";

export default function TableSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchSession = async () => {
    try {
      const data = await getSessionById(sessionId);
      setSession(data);
    } catch (error) {
      console.error("Failed to fetch session:", error);
      setError("Failed to load session details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const handleUpdateStatus = async (itemId, status) => {
    setUpdating(true);
    try {
      await updateOrderItemStatus(itemId, status);
      await fetchSession(); // Refresh
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update item status");
    } finally {
      setUpdating(false);
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
    if (!window.confirm("Confirm payment and close this session?")) return;

    setProcessingPayment(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/session/${sessionId}/pay`
      );
      console.log("Payment response:", response.data);
      if (response.data.success) {
        alert("✅ Payment confirmed! Session closed.");
        navigate("/admin/tables");
      } else {
        alert("Payment failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Payment error:", error);
      const msg = error.response?.data?.error || "Failed to confirm payment";
      alert("❌ " + msg);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleViewBill = () => {
    if (session?.bill) {
      const bill = session.bill;
      alert(
        `🧾 Bill Details:\n` +
        `Subtotal: ₹${bill.total}\n` +
        `Tax (5%): ₹${bill.tax}\n` +
        `Service Charge (10%): ₹${bill.serviceCharge}\n` +
        `Grand Total: ₹${bill.grandTotal}\n` +
        `Status: ${bill.paymentConfirmed ? '✅ Paid' : '⏳ Pending'}`
      );
    } else {
      alert("No bill generated yet.");
    }
  };

  if (loading) return <LoadingSpinner label="Loading session..." />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button onClick={() => navigate("/admin/tables")} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Back to Tables
        </button>
      </div>
    );
  }

  if (!session) {
    return <div>Session not found</div>;
  }

  const isPaid = session.bill?.paymentConfirmed || false;
  const isClosed = session.status === 'CLOSED';

  // Calculate totals from session orders if no bill exists
  const calculateTotals = () => {
    const subtotal = session.orders?.reduce((sum, order) => {
      return sum + (order.items || []).reduce((s, item) => s + item.price * item.quantity, 0);
    }, 0) || 0;

    const tax = Math.round(subtotal * 0.05);
    const serviceCharge = Math.round(subtotal * 0.1);
    const grandTotal = subtotal + tax + serviceCharge;
    return { subtotal, tax, serviceCharge, grandTotal };
  };

  const totals = session.bill || calculateTotals();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Table {session.tableNumber} - Session</h1>
          <p className="text-sm text-gray-500">
            Started: {new Date(session.startedAt).toLocaleString()} · {session.guestCount} guests
          </p>
        </div>
        <div className="flex gap-2">
          {session.bill && (
            <button
              onClick={handleViewBill}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Bill
            </button>
          )}
          {!isClosed && session.bill && !isPaid && (
            <button
              onClick={handleConfirmPayment}
              disabled={processingPayment}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {processingPayment ? "Processing..." : "✅ Confirm Payment & Close"}
            </button>
          )}
          {isPaid && (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
              ✅ Paid & Closed
            </span>
          )}
        </div>
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {session.orders?.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-medium text-gray-700">
                Order #{order.id.slice(-6)}
              </span>
              <span className="text-sm text-gray-400">
                {new Date(order.placedAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{item.quantity}x</span>
                    <span className="ml-2">{item.name}</span>
                    <span className="ml-2 text-sm text-gray-500">₹{item.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${item.status === 'SERVED' ? 'bg-green-100 text-green-700' : ''}
                      ${item.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${item.status === 'READY' ? 'bg-blue-100 text-blue-700' : ''}
                      ${item.status === 'PENDING' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {item.status}
                    </span>
                    {!isClosed && item.status !== 'SERVED' && (
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        disabled={updating}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="READY">Ready</option>
                        <option value="SERVED">Served</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {session.orders?.length === 0 && (
          <p className="text-center text-gray-500 py-8">No orders placed yet.</p>
        )}
      </div>

      {/* Bill Summary */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Bill Summary</h2>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{totals.subtotal || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (5%)</span>
            <span>₹{totals.tax || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service Charge (10%)</span>
            <span>₹{totals.serviceCharge || 0}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
            <span>Grand Total</span>
            <span className="text-blue-600">₹{totals.grandTotal || 0}</span>
          </div>
          {session.bill && (
            <div className="mt-2 text-sm">
              <span className={`font-medium ${isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                Status: {isPaid ? '✅ Paid' : '⏳ Pending Payment'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}