import OrderStatusBadge from "./OrderStatusBadge";

function OrderItemRow({ item }) {
  return (
    <div>
      <span>{item.name}</span>
      <span>× {item.quantity}</span>
      <span>₹{item.price * item.quantity}</span>

      <OrderStatusBadge status={item.status} />
    </div>
  );
}

export default OrderItemRow;