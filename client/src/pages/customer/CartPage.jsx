// client/src/pages/customer/CartPage.jsx
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext";
import { placeOrder } from "../../services/api";

export default function CartPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();
  const { language, t, getItemName, speakText } = useLanguage();
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

      await placeOrder(sessionId, orderItems);
      clearCart();
      const confirmSpeech = language === "kn" ? "ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ನೀಡಲಾಗಿದೆ!" : "Order placed successfully!";
      speakText(confirmSpeech);
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-julius-cream flex items-center justify-center mb-4">
          <ShoppingBag size={40} className="text-julius-teal/60" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">{t("emptyCartTitle")}</h2>
        <p className="text-gray-500 text-sm mt-1 mb-6">{t("emptyCartDesc")}</p>
        <Link
          to={`/session/${sessionId}/menu`}
          className="px-6 py-2.5 bg-julius-teal text-white rounded-xl font-semibold hover:bg-julius-teal-light shadow-sm transition-colors text-sm"
        >
          {t("browseMenu")}
        </Link>
      </div>
    );
  }

  const tax = Math.round(subtotal * 0.05);
  const serviceCharge = Math.round(subtotal * 0.1);
  const total = subtotal + tax + serviceCharge;

  return (
    <div className="pb-24 font-sans max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={`/session/${sessionId}/menu`}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">🛍️ {t("cart")}</h1>
        <button
          onClick={clearCart}
          className="ml-auto text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
        >
          {t("clearAll")}
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-sm border border-julius-sand p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm truncate">{getItemName(item)}</h3>
              {language === "kn" && item.name !== getItemName(item) && (
                <p className="text-[11px] text-gray-400 truncate">{item.name}</p>
              )}
              <p className="text-xs text-gray-500 font-medium mt-0.5">₹{item.price} each</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-0.5">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                title="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-julius-sand p-6">
        <h2 className="font-bold text-gray-900 mb-4 text-base">{t("orderSummary")}</h2>
        <div className="space-y-2.5 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>{t("subtotal")} ({itemCount} {t("items")})</span>
            <span className="font-medium text-gray-900">₹{subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("tax")}</span>
            <span className="font-medium text-gray-900">₹{tax}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("serviceCharge")}</span>
            <span className="font-medium text-gray-900">₹{serviceCharge}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between font-bold text-lg text-gray-900">
            <span>{t("total")}</span>
            <span className="text-julius-teal">₹{total}</span>
          </div>
        </div>

        {error && <p className="mt-3 text-rose-600 text-xs font-semibold text-center">{error}</p>}

        <button
          onClick={handlePlaceOrder}
          disabled={placing || items.length === 0}
          className="w-full mt-5 py-3.5 bg-gradient-to-r from-julius-teal to-julius-teal-dark text-white rounded-xl font-bold hover:opacity-95 shadow-md transition-all disabled:opacity-50 text-sm"
        >
          {placing ? t("placingOrder") : `${t("placeOrder")} (₹${total})`}
        </button>
      </div>
    </div>
  );
}