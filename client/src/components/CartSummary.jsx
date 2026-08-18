import Card from "./Card";
import Button from "./Button";

function CartSummary({ subtotal, onPlaceOrder }) {
  return (
    <Card>
      <h2>Cart Summary</h2>

      <p>Subtotal: ₹{subtotal}</p>

      <Button onClick={onPlaceOrder}>
        Place Order
      </Button>
    </Card>
  );
}

export default CartSummary;