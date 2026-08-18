import Button from "./Button";

function CartItem({ item, quantity, onIncrease, onDecrease, onRemove }) {
  return (
    <div>
      <h3>{item.name}</h3>
      <p>₹{item.price}</p>

      <Button onClick={onDecrease}>−</Button>

      <span>{quantity}</span>

      <Button onClick={onIncrease}>+</Button>

      <Button onClick={onRemove}>
        Remove
      </Button>
    </div>
  );
}

export default CartItem;