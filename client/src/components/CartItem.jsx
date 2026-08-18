import { Trash2 } from "lucide-react";
import QuantityControl from "./QuantityControl";
import { formatCurrency } from "../utils/format";

function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center gap-4">
      <span className="text-2xl">{item.emoji}</span>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
      </div>
      <div className="flex items-center gap-3">
        <QuantityControl quantity={item.quantity} onIncrease={onIncrease} onDecrease={onDecrease} />
        <button onClick={onRemove} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default CartItem;
