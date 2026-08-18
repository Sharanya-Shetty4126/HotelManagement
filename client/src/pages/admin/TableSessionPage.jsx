import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Droplet, Receipt, CheckCircle2 } from "lucide-react";
import { getSessionById, updateOrderItemStatus } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import Button from "../../components/Button";
import { formatCurrency, calculateBill, getOrderStatus } from "../../utils/format";

const NEXT_STATUS = { PENDING: "PREPARING", PREPARING: "READY", READY: "SERVED" };

function TableSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = () => {
    setLoading(true);
    getSessionById(sessionId).then((data) => {
      setSession(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const advanceItem = async (orderId, item) => {
    const next = NEXT_STATUS[item.status];
    if (!next) return;
    await updateOrderItemStatus(sessionId, orderId, item.id, next);
    loadSession();
  };

  if (loading) return <LoadingSpinner label="Loading session..." />;

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Session not found.</p>
        <Link to="/admin/tables" className="text-blue-600 text-sm mt-2 inline-block">
          Back to tables
        </Link>
      </div>
    );
  }

  const allItems = session.orders.flatMap((o) => o.items);
  const { total } = calculateBill(
    allItems.map((i) => ({ price: i.price, quantity: i.quantity }))
  );

  return (
    <div>
      <button
        onClick={() => navigate("/admin/tables")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-4"
      >
        <ArrowLeft size={16} /> Back to tables
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Table {session.tableNumber} · Session {session.id}
          </h1>
          <p className="text-sm text-gray-500">
            Started {session.startedAt} · {session.guestCount} guests
          </p>
        </div>
        <Button variant="secondary">
          <Receipt size={16} /> View bill
        </Button>
      </div>

      {/* Customer requests inbox */}
      {session.requests.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-yellow-800 mb-2">Requests</h2>
          <div className="space-y-2">
            {session.requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-yellow-900">
                  <Droplet size={14} /> {r.type} · raised {r.raisedAt}
                </span>
                <Button variant="secondary" className="px-2 py-1 text-xs">
                  <CheckCircle2 size={14} /> Mark resolved
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders, per-item status */}
      <div className="space-y-4">
        {session.orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">
                {order.id} · placed {order.placedAt}
              </h3>
              <OrderStatusBadge status={getOrderStatus(order)} />
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                  <div className="flex-1">
                    <span className="text-gray-900">{item.name}</span>
                    <span className="text-gray-500"> × {item.quantity}</span>
                  </div>
                  <span className="text-gray-600 w-20 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                  <div className="w-32 flex justify-end items-center gap-2">
                    <OrderStatusBadge status={item.status} />
                    {item.status !== "SERVED" && (
                      <button
                        onClick={() => advanceItem(order.id, item)}
                        className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                      >
                        Mark {NEXT_STATUS[item.status].toLowerCase()}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Final bill */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Running total (incl. tax &amp; service charge)</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(total)}</p>
        </div>
        <Button variant="secondary">Close session &amp; generate bill</Button>
      </div>
    </div>
  );
}

export default TableSessionPage;
