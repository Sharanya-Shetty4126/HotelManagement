import { Link, useParams } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function CustomerLayout({ children }) {
  const { token } = useParams();
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={`/table/${token}`} className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="font-bold text-gray-900">Table {token?.slice(0, 6)}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to={`/table/${token}/orders`}
              className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline"
            >
              My orders
            </Link>
            <Link
              to={`/table/${token}/cart`}
              className="relative p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <ShoppingCart size={22} className="text-blue-600" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
