import Button from "./Button";

function QuantityControl({ quantity, onIncrease, onDecrease }) {
  return (
    <div>
      <Button onClick={onDecrease}>−</Button>

      <span>{quantity}</span>

      <Button onClick={onIncrease}>+</Button>
    </div>
  );
}

export default QuantityControl;