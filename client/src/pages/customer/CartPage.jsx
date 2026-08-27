// client/src/pages/customer/CartPage.jsx
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { placeOrder } from "../../services/api";

export default function CartPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    setPlacing(true);
    setError("");

    try {
      const orderItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const response = await placeOrder(sessionId, orderItems);
      clearCart();
      navigate(`/session/${sessionId}/orders`);
    } catch (err) {
      console.error("Order error:", err);
      setError(err.response?.data?.error || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Add some delicious items!</p>
        <Link
          to={`/session/${sessionId}/menu`}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/session/${sessionId}/menu`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <button onClick={clearCart} className="ml-auto text-sm text-red-600 hover:text-red-800">
          Clear All
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm border p-4 flex items-center gap-4"
          >
            <span className="text-2xl">{item.emoji}</span>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500">₹{item.price} each</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1.5 hover:bg-gray-200 rounded-l-lg transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1.5 hover:bg-gray-200 rounded-r-lg transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({itemCount} items)</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (5%)</span>
            <span>₹{Math.round(subtotal * 0.05)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Service Charge (10%)</span>
            <span>₹{Math.round(subtotal * 0.1)}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-blue-600">₹{Math.round(subtotal * 1.15)}</span>
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-red-600 text-sm text-center">{error}</p>}

        <button
          onClick={handlePlaceOrder}
          disabled={placing || items.length === 0}
          className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}