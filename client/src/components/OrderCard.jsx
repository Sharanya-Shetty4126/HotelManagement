import Card from "./Card";
import OrderStatusBadge from "./OrderStatusBadge";

function OrderCard({ orderId, tableNumber, status, itemCount, onClick }) {
  return (
    <Card onClick={onClick}>
      <h3>Order #{orderId}</h3>

      <p>Table {tableNumber}</p>

      <p>{itemCount} items</p>

      <OrderStatusBadge status={status} />
    </Card>
  );
}

export default OrderCard;