import MenuItemCard from "./MenuItemCard";

function MenuList({ items, onAdd }) {
  return (
    <div>
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          name={item.name}
          price={item.price}
          description={item.description}
          onAdd={() => onAdd(item)}
        />
      ))}
    </div>
  );
}

export default MenuList;