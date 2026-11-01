import Card from "./Card";
import Button from "./Button";
import { formatCurrency } from "../utils/format";
import { getDishImage, CATEGORY_FALLBACK_IMAGES } from "../utils/dishImages";

function MenuItemCard({ item, onAdd }) {
  const displayImage = getDishImage(item);
  const fallbackImage = CATEGORY_FALLBACK_IMAGES[item.category] || CATEGORY_FALLBACK_IMAGES.default;

  return (
    <Card className="flex gap-4 items-center">
      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
        <img
          src={displayImage}
          alt={item.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
          }}
          className="w-full h-full object-cover"
        />
        {item.emoji && (
          <span className="absolute top-1 left-1 bg-white/80 backdrop-blur-xs rounded-full p-0.5 text-xs shadow-xs">
            {item.emoji}
          </span>
        )}
      </div>
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
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
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
