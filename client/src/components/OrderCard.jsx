import Card from "./Card";
import OrderStatusBadge from "./OrderStatusBadge";
import { getOrderStatus } from "../utils/format";

function OrderCard({ order, onClick }) {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <Card onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-900">
            {order.id} · Table {order.tableNumber}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {itemCount} item{itemCount !== 1 ? "s" : ""} · placed {order.placedAt}
          </p>
        </div>
        <OrderStatusBadge status={getOrderStatus(order)} />
      </div>
    </Card>
  );
}

export default OrderCard;
