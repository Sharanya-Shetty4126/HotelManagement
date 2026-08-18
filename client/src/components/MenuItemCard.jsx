import Card from "./Card";
import Button from "./Button";
import { formatCurrency } from "../utils/format";

function MenuItemCard({ item, onAdd }) {
  return (
    <Card className="flex gap-4">
      <span className="text-3xl leading-none">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 border-2 flex items-center justify-center rounded-sm ${
                  item.isVeg ? "border-green-600" : "border-red-600"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`} />
              </span>
              <h3 className="font-medium text-gray-900">{item.name}</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-gray-900">{formatCurrency(item.price)}</span>
          <Button onClick={() => onAdd(item)} className="px-3 py-1.5">
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default MenuItemCard;
