import Card from "./Card";

function BillSummary({ items, total, status }) {
  return (
    <Card>
      <h2>Bill</h2>

      {items.map((item) => (
        <div key={item.id}>
          <span>
            {item.name} × {item.quantity}
          </span>

          <span>₹{item.price * item.quantity}</span>
        </div>
      ))}

      <hr />

      <h3>Total: ₹{total}</h3>

      <p>Bill Status: {status}</p>
    </Card>
  );
}

export default BillSummary;