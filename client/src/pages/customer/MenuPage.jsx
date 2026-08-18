// client/src/pages/customer/MenuPage.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, Star, Minus, Plus } from "lucide-react";
import { getMenu } from "../../services/api";
import { useCart } from "../../context/CartContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatCurrency } from "../../utils/format";

const MenuPage = () => {
  const { token } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [menu, setMenu] = useState({ items: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const { items: cart, addItem, updateQuantity, itemCount, subtotal } = useCart();

  useEffect(() => {
    getMenu().then((data) => {
      setMenu(data);
      setLoading(false);
    });
  }, []);

  const filteredItems = menu.items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const quantityOf = (itemId) => cart.find((i) => i.id === itemId)?.quantity || 0;

  if (loading) return <LoadingSpinner label="Loading menu..." />;

  return (
    <div className={itemCount > 0 ? "pb-24" : ""}>
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", ...menu.categories].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border"
              }`}
            >
              {category === "all" ? "All" : category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const qty = quantityOf(item.id);
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                    {formatCurrency(item.price)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        item.isVeg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.isVeg ? "Veg" : "Non-Veg"}
                    </span>
                    <div className="flex items-center gap-0.5 text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs text-gray-600">{item.rating}</span>
                    </div>
                  </div>

                  {qty > 0 ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{qty}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded bg-blue-100 hover:bg-blue-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addItem(item)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredItems.length === 0 && (
          <p className="text-center text-gray-500 col-span-full py-8">No items match your search.</p>
        )}
      </div>

      {/* Cart Bottom Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-20">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <span className="font-medium">{itemCount} items</span>
              <span className="text-sm text-gray-500 ml-3">{formatCurrency(subtotal)}</span>
            </div>
            <Link to={`/table/${token}/cart`} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View Cart →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
