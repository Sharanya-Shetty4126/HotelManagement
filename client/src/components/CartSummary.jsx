import { IndianRupee } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import { formatCurrency, calculateBill } from "../utils/format";

function CartSummary({ items, onPlaceOrder, placing }) {
  const { subtotal, tax, serviceCharge, total } = calculateBill(items);
  return (
    <Card>
      <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (5%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Service charge (10%)</span>
          <span>{formatCurrency(serviceCharge)}</span>
        </div>
        <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span className="text-blue-600">{formatCurrency(total)}</span>
        </div>
      </div>
      <Button onClick={onPlaceOrder} disabled={placing} className="w-full mt-6">
        <IndianRupee size={16} />
        {placing ? "Placing order..." : "Place Order"}
      </Button>
    </Card>
  );
}

export default CartSummary;
