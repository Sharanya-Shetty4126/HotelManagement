import { Minus, Plus } from "lucide-react";

function QuantityControl({ quantity, onIncrease, onDecrease }) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg">
      <button onClick={onDecrease} className="p-1.5 hover:bg-gray-200 rounded-l-lg transition-colors">
        <Minus size={16} />
      </button>
      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
      <button onClick={onIncrease} className="p-1.5 hover:bg-gray-200 rounded-r-lg transition-colors">
        <Plus size={16} />
      </button>
    </div>
  );
}

export default QuantityControl;
