// client/src/pages/customer/CartPage.jsx
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { placeOrder } from "../../services/api";
import CartItem from "../../components/CartItem";
import CartSummary from "../../components/CartSummary";

const CartPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      await placeOrder(token, items);
      clearCart();
      navigate(`/table/${token}/orders`);
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Your cart is empty</h2>
          <p className="text-gray-500 mt-2">Add some delicious items!</p>
          <Link
            to={`/table/${token}`}
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link to={`/table/${token}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          <span>Back to Menu</span>
        </Link>
        <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-800">
          Clear All
        </button>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-4">Your Cart</h1>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onIncrease={() => updateQuantity(item.id, 1)}
            onDecrease={() => updateQuantity(item.id, -1)}
            onRemove={() => removeItem(item.id)}
          />
        ))}
      </div>

      <CartSummary items={items} onPlaceOrder={handlePlaceOrder} placing={placing} />
    </div>
  );
};

export default CartPage;
