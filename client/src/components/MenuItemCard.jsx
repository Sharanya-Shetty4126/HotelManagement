import Card from "./Card";
import Button from "./Button";

function MenuItemCard({ name, price, description, onAdd }) {
  return (
    <Card>
      <h3>{name}</h3>
      <p>{description}</p>
      <p>₹{price}</p>

      <Button onClick={onAdd}>
        Add to Cart
      </Button>
    </Card>
  );
}

export default MenuItemCard;