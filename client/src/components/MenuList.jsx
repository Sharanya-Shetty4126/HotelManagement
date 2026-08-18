import MenuItemCard from "./MenuItemCard";

function MenuList({ items, onAdd }) {
  if (items.length === 0) {
    return <p className="text-center text-gray-500 py-8">No items match your search.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <MenuItemCard key={item.id} item={item} onAdd={onAdd} />
      ))}
    </div>
  );
}

export default MenuList;
