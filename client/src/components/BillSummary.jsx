import Card from "./Card";
import { formatCurrency, calculateBill } from "../utils/format";

function BillSummary({ items, status = "UNPAID" }) {
  const { subtotal, tax, serviceCharge, total } = calculateBill(items);
  return (
    <Card>
      <h2 className="font-semibold text-gray-900 mb-4">Bill</h2>
      <div className="space-y-2 text-sm mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span className="text-gray-700">
              {item.name} × {item.quantity}
            </span>
            <span>{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-3 space-y-1 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (5%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Service charge (10%)</span>
          <span>{formatCurrency(serviceCharge)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-2 border-t mt-2">
          <span>Total</span>
          <span className="text-blue-600">{formatCurrency(total)}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Status: <span className="font-medium">{status}</span> — pay at the counter, no online payment yet.
      </p>
    </Card>
  );
}

export default BillSummary;
