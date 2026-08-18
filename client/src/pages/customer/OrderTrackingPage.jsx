import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PackageCheck } from "lucide-react";
import { getSessionByToken } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import { formatCurrency, getOrderStatus } from "../../utils/format";

// Customer-facing view is intentionally the simple 3-stage version — the
// finer per-item statuses are for the admin/kitchen side only.
const CUSTOMER_STAGES = ["Placed", "Preparing", "Served"];

function stageIndex(orderStatus) {
  if (orderStatus === "SERVED") return 2;
  if (orderStatus === "PENDING") return 0;
  return 1;
}

function OrderTrackingPage() {
  const { token } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionByToken(token).then((data) => {
      setSession(data);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <LoadingSpinner label="Loading your orders..." />;

  if (!session || session.orders.length === 0) {
    return (
      <div className="text-center py-12">
        <PackageCheck size={48} className="mx-auto text-gray-300 mb-3" />
        <h2 className="text-lg font-semibold text-gray-700">No orders yet</h2>
        <p className="text-gray-500 mt-1">Orders you place will show up here.</p>
        <Link to={`/table/${token}`} className="text-blue-600 text-sm mt-3 inline-block">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Your Orders</h1>
      <div className="space-y-4">
        {session.orders.map((order) => {
          const status = getOrderStatus(order);
          const idx = stageIndex(status);
          const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
          return (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{order.id}</h3>
                <OrderStatusBadge status={status} />
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {itemCount} item{itemCount !== 1 ? "s" : ""} · placed {order.placedAt}
              </p>

              {/* Simple 3-stage progress the customer actually cares about */}
              <div className="flex items-center gap-2 mb-3">
                {CUSTOMER_STAGES.map((stage, i) => (
                  <div key={stage} className="flex-1 flex items-center gap-2">
                    <div
                      className={`h-1.5 flex-1 rounded-full ${
                        i <= idx ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                    {i < CUSTOMER_STAGES.length - 1 && null}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-3">
                {CUSTOMER_STAGES.map((stage) => (
                  <span key={stage}>{stage}</span>
                ))}
              </div>

              <ul className="text-sm divide-y">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between py-1.5">
                    <span className="text-gray-700">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-gray-500">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderTrackingPage;
