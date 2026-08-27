import { ORDER_ITEM_STATUS_STYLES } from "../utils/format";
import { getOrderStatusStyles } from "../utils/format";

export default function OrderStatusBadge({ status }) {
  const style = getOrderStatusStyles(status);
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}