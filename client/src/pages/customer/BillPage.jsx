// client/src/pages/customer/BillPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSessionById, generateBill } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatCurrency } from "../../utils/format";

export default function BillPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [session, setSession] = useState(null);
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getSessionById(sessionId);
        setSession(data);
        if (data.bill) {
          setBill(data.bill);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setError("Failed to load session details");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleGenerateBill = async () => {
    setGenerating(true);
    setError("");
    try {
      const response = await generateBill(sessionId);
      setBill(response.bill);
    } catch (error) {
      console.error("Failed to generate bill:", error);
      setError(error.response?.data?.error || "Failed to generate bill. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading bill..." />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Calculate totals from orders if no bill exists
  const calculateTotals = () => {
    if (!session || !session.orders) return null;
    
    const subtotal = session.orders.reduce((sum, order) => {
      return sum + (order.items || []).reduce((s, item) => s + item.price * item.quantity, 0);
    }, 0);
    
    const tax = Math.round(subtotal * 0.05);
    const serviceCharge = Math.round(subtotal * 0.1);
    const grandTotal = subtotal + tax + serviceCharge;
    
    return { subtotal, tax, serviceCharge, grandTotal };
  };

  const totals = bill ? {
    subtotal: bill.total,
    tax: bill.tax,
    serviceCharge: bill.serviceCharge,
    grandTotal: bill.grandTotal
  } : calculateTotals();

  // Get all order items for display
  const allItems = session?.orders?.flatMap(order => 
    (order.items || []).map(item => ({
      ...item,
      orderId: order.id,
      placedAt: order.placedAt
    }))
  ) || [];

  const hasItems = allItems.length > 0;
  const hasBill = !!bill;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧾 Bill</h1>
      <p className="text-gray-600 mb-6">Table {session?.tableNumber}</p>

      {!hasItems ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <p className="text-gray-500">No items ordered yet.</p>
          <button
            onClick={() => navigate(`/session/${sessionId}/menu`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Bill Items */}
          <div className="p-4 divide-y">
            {allItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="py-3 flex justify-between">
                <div>
                  <span className="font-medium">{item.quantity}x</span>
                  <span className="ml-2">{item.name}</span>
                </div>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          {totals && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{totals.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span>₹{totals.tax}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Charge (10%)</span>
                  <span>₹{totals.serviceCharge}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Grand Total</span>
                  <span className="text-blue-600">₹{totals.grandTotal}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 border-t">
            {hasBill ? (
              <div className="text-center">
                <p className="text-green-600 font-medium mb-2">✅ Bill Generated</p>
                <p className="text-sm text-gray-500">Please pay at the counter</p>
                {bill?.paymentConfirmed && (
                  <p className="text-sm text-green-600 mt-2">✅ Payment Confirmed</p>
                )}
              </div>
            ) : (
              <button
                onClick={handleGenerateBill}
                disabled={generating}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Bill"}
              </button>
            )}
            {error && <p className="text-red-600 text-sm text-center mt-2">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}