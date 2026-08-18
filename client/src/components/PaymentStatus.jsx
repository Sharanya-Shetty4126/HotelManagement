const STYLES = {
  UNPAID: "bg-red-100 text-red-700",
  REQUESTED: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
};

const LABELS = {
  UNPAID: "Not requested",
  REQUESTED: "Bill requested",
  PAID: "Paid",
};

function PaymentStatus({ status = "UNPAID" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">Payment status</span>
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[status]}`}>
        {LABELS[status]}
      </span>
    </div>
  );
}

export default PaymentStatus;
