import OrderStatusBadge from "./OrderStatusBadge";
import { formatCurrency } from "../utils/format";

function OrderItemRow({ item }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <div className="flex-1">
        <span className="text-gray-900">{item.name}</span>
        <span className="text-gray-500"> × {item.quantity}</span>
      </div>
      <span className="text-gray-600 w-20 text-right">{formatCurrency(item.price * item.quantity)}</span>
      <div className="w-28 flex justify-end">
        <OrderStatusBadge status={item.status} />
      </div>
    </div>
  );
}

export default OrderItemRow;
