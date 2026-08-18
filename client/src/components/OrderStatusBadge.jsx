import { ORDER_ITEM_STATUS_STYLES } from "../utils/format";

function OrderStatusBadge({ status }) {
  const style = ORDER_ITEM_STATUS_STYLES[status] || ORDER_ITEM_STATUS_STYLES.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export default OrderStatusBadge;
