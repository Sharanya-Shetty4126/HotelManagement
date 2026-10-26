// client/src/pages/customer/MenuPage.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Search, Star, Minus, Plus, Mic, MicOff, X, Sparkles } from "lucide-react";
import { getMenu } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext";
import LoadingSpinner from "../../components/LoadingSpinner";

// Mouth-watering category default food photography
const CATEGORY_FALLBACK_IMAGES = {
  "Side Dish / Snack": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
  "Soups": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80",
  "Chinese Starters": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80",
  "Tandoor Starters": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
  "Egg Dishes": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
  "Seafood Specials": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
  "Indian Gravies": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
  "Indian Breads": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
  "Chinese Rice & Noodles": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
  "Biryani & Indian Rice": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
  "Julius Bar & Beverages": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
  "Desserts": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
};

const CATEGORY_ICONS = {
  "Side Dish / Snack": "🫓",
  "Soups": "🥣",
  "Chinese Starters": "🥡",
  "Tandoor Starters": "🍢",
  "Egg Dishes": "🍳",
  "Seafood Specials": "🐟",
  "Indian Gravies": "🍲",
  "Indian Breads": "🫓",
  "Chinese Rice & Noodles": "🍜",
  "Biryani & Indian Rice": "🍚",
  "Julius Bar & Beverages": "🍹",
  "Desserts": "🍨"
};

export default function MenuPage() {
  const { sessionId } = useParams();
  const { language, t, getItemName, getItemDesc, getCategoryName, matchSearchQuery } = useLanguage();

  const location = useLocation();
  const { sessionCode, newSession } = location.state || {};

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [vegFilter, setVegFilter] = useState("all"); // 'all' | 'veg' | 'nonveg'
  const [menu, setMenu] = useState({ items: [], categories: [] });
  const [loading, setLoading] = useState(true);

  // Voice Search State
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState("");
  const recognitionRef = useRef(null);
  const categoryScrollRef = useRef(null);

  const {
    items: cart,
    addItem,
    updateQuantity,
    itemCount,
    subtotal,
  } = useCart();

  useEffect(() => {
    getMenu()
      .then((data) => {
        setMenu(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching menu:", err);
        setLoading(false);
      });
  }, []);

  // Web Speech API Voice Search (Supports Kannada 'kn-IN' & English 'en-IN')
  const handleToggleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(language === "kn" 
        ? "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಹುಡುಕಾಟ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಗೂಗಲ್ ಕ್ರೋಮ್ ಬಳಸಿ." 
        : "Voice recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceNotice("");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = language === "kn" ? "kn-IN" : "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setVoiceNotice(t("listening"));

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const spokenQuery = event.results[0][0].transcript;
        setSearchTerm(spokenQuery);
        setVoiceNotice(language === "kn" ? `ಹುಡುಕಲಾಗಿದೆ: "${spokenQuery}"` : `Searching for: "${spokenQuery}"`);
        setTimeout(() => setVoiceNotice(""), 3500);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        setVoiceNotice("");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech error:", err);
      setIsListening(false);
      setVoiceNotice("");
    }
  };

  const filteredItems = menu.items.filter((item) => {
    const matchesSearch = matchSearchQuery(searchTerm, item);

    const matchesCategory =
      selectedCategory === "all" ||
      item.category === selectedCategory;

    const matchesDiet =
      vegFilter === "all" ||
      (vegFilter === "veg" && item.isVeg) ||
      (vegFilter === "nonveg" && !item.isVeg);

    return matchesSearch && matchesCategory && matchesDiet;
  });

  const quantityOf = (itemId) =>
    cart.find((i) => i.id === itemId)?.quantity || 0;

  if (loading) return <LoadingSpinner label={t("browseMenu") + "..."} />;

  return (
    <div className="pb-28 font-sans">
      {/* Page Title & Restaurant Branding */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <span>🍽️</span>
            <span>{t("menu")}</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            {menu.items.length} {t("items")} · {menu.categories.length} {language === "kn" ? "ವಿಭಾಗಗಳು" : "Categories"}
          </p>
        </div>

        {/* Quick Veg/Non-Veg Filter Chips */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-julius-sand/60 shadow-xs">
          <button
            onClick={() => setVegFilter("all")}
            className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
              vegFilter === "all"
                ? "bg-julius-teal text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {t("all")}
          </button>
          <button
            onClick={() => setVegFilter("veg")}
            className={`px-2 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all ${
              vegFilter === "veg"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{t("veg")}</span>
          </button>
          <button
            onClick={() => setVegFilter("nonveg")}
            className={`px-2 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all ${
              vegFilter === "nonveg"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-rose-700 hover:bg-rose-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>{t("nonVeg")}</span>
          </button>
        </div>
      </div>

      {/* Session Code Welcome Banner */}
      {newSession && sessionCode && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 mb-4 text-center animate-in fade-in shadow-xs">
          <p className="text-emerald-800 font-medium text-xs">
            {language === "kn" ? "ನಿಮ್ಮ ಟೇಬಲ್ ಸೆಷನ್ ಕೋಡ್:" : "Your session code:"}
          </p>
          <p className="text-3xl font-black text-emerald-800 my-1 font-mono tracking-widest">
            {sessionCode}
          </p>
          <p className="text-xs text-emerald-600">
            {language === "kn" 
              ? "ಸ್ನೇಹಿತರು ನಿಮ್ಮೊಂದಿಗೆ ಆರ್ಡರ್ ಮಾಡಲು ಈ ಕೋಡ್ ಹಂಚಿಕೊಳ್ಳಿ!" 
              : "Share this code with friends to join your table session!"}
          </p>
        </div>
      )}

      {/* Search and Voice Recognition Bar */}
      <div className="relative mb-3">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-20 py-2.5 border border-julius-sand rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-julius-teal text-sm shadow-xs"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}

          {/* Voice Search Microphone Button */}
          <button
            onClick={handleToggleVoiceSearch}
            className={`p-1.5 rounded-lg transition-all ${
              isListening
                ? "bg-rose-500 text-white animate-pulse shadow-md"
                : "text-julius-teal hover:bg-julius-cream"
            }`}
            title={isListening ? "Stop Listening" : `${t("voiceSearch")} (${language === "kn" ? "ಕನ್ನಡ" : "English"})`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
      </div>

      {/* Active Voice Listening Banner */}
      {voiceNotice && (
        <div className="mb-3 p-3 bg-gradient-to-r from-julius-teal/10 to-julius-gold/15 border border-julius-teal/30 rounded-xl flex items-center gap-2.5 text-xs text-julius-teal font-semibold animate-in fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          <span>{voiceNotice}</span>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setVoiceNotice("");
              }}
              className="ml-auto text-[11px] underline text-gray-500 hover:text-gray-800"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Sticky Horizontal Category Selector */}
      <div className="sticky top-0 z-20 bg-julius-cream/95 backdrop-blur-md pt-1 pb-3 mb-3 -mx-4 px-4 border-b border-julius-sand/40">
        <div
          ref={categoryScrollRef}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        >
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 ${
              selectedCategory === "all"
                ? "bg-julius-teal text-white shadow-sm ring-2 ring-julius-teal/20"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-julius-sand"
            }`}
          >
            <span>✨</span>
            <span>{t("all")}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategory === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {menu.items.length}
            </span>
          </button>

          {menu.categories.map((category) => {
            const catCount = menu.items.filter((i) => i.category === category).length;
            const icon = CATEGORY_ICONS[category] || "🍽️";

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 ${
                  selectedCategory === category
                    ? "bg-julius-teal text-white shadow-sm ring-2 ring-julius-teal/20"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-julius-sand"
                }`}
              >
                <span>{icon}</span>
                <span>{getCategoryName(category)}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === category ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {catCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header / Active Filter Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-3 px-1">
        <span>
          {language === "kn" ? "ಖಾದ್ಯಗಳು" : "Showing"}: <strong className="text-gray-900">{filteredItems.length}</strong> {language === "kn" ? "ಐಟಂಗಳು" : "dishes"}
          {selectedCategory !== "all" && (
            <span className="text-julius-teal ml-1">
              · {getCategoryName(selectedCategory)}
            </span>
          )}
        </span>

        {(searchTerm || selectedCategory !== "all" || vegFilter !== "all") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setVegFilter("all");
            }}
            className="text-julius-teal hover:underline text-[11px] font-bold"
          >
            {language === "kn" ? "ಫಿಲ್ಟರ್ ತೆರವು" : "Reset filters"}
          </button>
        )}
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredItems.map((item) => {
          const qty = quantityOf(item.id);
          const fallbackImage = CATEGORY_FALLBACK_IMAGES[item.category] || CATEGORY_FALLBACK_IMAGES.default;
          const displayImage = item.imageUrl || fallbackImage;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-xs border border-julius-sand/60 overflow-hidden hover:shadow-md transition-all p-3 sm:p-4 flex gap-3 sm:gap-4 justify-between group"
            >
              {/* Left Column: Details */}
              <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
                <div>
                  {/* Veg / Non-Veg Standard FSSAI Indicator + Category Pill */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`w-3.5 h-3.5 border-2 rounded flex items-center justify-center shrink-0 ${
                        item.isVeg ? "border-emerald-600" : "border-rose-700"
                      }`}
                      title={item.isVeg ? "Pure Veg" : "Non-Veg"}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.isVeg ? "bg-emerald-600" : "bg-rose-700"
                        }`}
                      />
                    </span>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-julius-teal/80 bg-julius-cream px-2 py-0.5 rounded-md border border-julius-sand/50 truncate max-w-[130px]">
                      {getCategoryName(item.category)}
                    </span>

                    {item.rating ? (
                      <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold ml-auto">
                        <Star size={11} fill="currentColor" />
                        <span className="text-gray-700">{item.rating}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Item Name */}
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-julius-teal transition-colors">
                    {getItemName(item)}
                  </h3>

                  {language === "kn" && item.name !== getItemName(item) && (
                    <p className="text-[11px] text-gray-400 font-medium leading-none mt-0.5">
                      {item.name}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mt-1 font-black text-sm sm:text-base text-gray-900 tracking-tight">
                    ₹{item.price}
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                      {getItemDesc(item)}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Mouth-Watering Food Photo & Add/Counter Button */}
              <div className="w-24 sm:w-28 shrink-0 flex flex-col items-center justify-between">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-xs border border-julius-sand/60 bg-gray-100">
                  <img
                    src={displayImage}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImage;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.emoji && (
                    <span className="absolute top-1 left-1 bg-white/80 backdrop-blur-xs rounded-full p-0.5 text-xs shadow-xs">
                      {item.emoji}
                    </span>
                  )}
                </div>

                {/* Add Button or Interactive Quantity Counter */}
                <div className="w-full mt-2 flex justify-center">
                  {qty > 0 ? (
                    <div className="w-full max-w-[100px] h-8 bg-julius-teal text-white rounded-xl shadow-xs flex items-center justify-between px-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-white/20 rounded-md transition-colors active:scale-90"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} className="stroke-[3]" />
                      </button>

                      <span className="text-xs font-black text-white">
                        {qty}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-white/20 rounded-md transition-colors active:scale-90"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} className="stroke-[3]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addItem(item)}
                      className="w-full max-w-[100px] h-8 bg-white text-julius-teal border-2 border-julius-teal font-black text-xs rounded-xl shadow-xs hover:bg-julius-teal hover:text-white transition-all uppercase tracking-wide flex items-center justify-center gap-1 active:scale-95"
                    >
                      <span>{t("add")}</span>
                      <Plus size={12} className="stroke-[3]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center col-span-full py-16 px-4 bg-white rounded-2xl border border-julius-sand/50">
            <span className="text-4xl mb-3 block">🍽️</span>
            <p className="font-bold text-gray-800 text-sm">
              {t("noItemsFound")}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {language === "kn" ? "ಬೇರೆ ಹೆಸರು ಅಥವಾ ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ ನೋಡಿ." : "Try searching for another dish or clearing category filters."}
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setVegFilter("all");
              }}
              className="mt-4 px-4 py-2 bg-julius-teal text-white font-bold text-xs rounded-xl hover:bg-julius-teal-light transition-all shadow-xs"
            >
              {language === "kn" ? "ಎಲ್ಲಾ ಮೆನು ತೋರಿಸಿ" : "Show All Dishes"}
            </button>
          </div>
        )}
      </div>

      {/* Floating Cart Bottom Bar (floats directly above mobile bottom navigation bar) */}
      {itemCount > 0 && (
        <div className="fixed bottom-12 sm:bottom-0 left-0 right-0 bg-julius-teal text-white shadow-2xl p-3 z-30 sm:z-20 border-t border-julius-gold/30 backdrop-blur-lg">
          <div className="max-w-3xl mx-auto flex items-center justify-between px-2">
            <div>
              <span className="font-bold text-white text-sm">
                {itemCount} {t("items")}
              </span>
              <span className="text-sm font-black text-julius-gold ml-3">
                ₹{subtotal}
              </span>
            </div>

            <Link
              to={`/session/${sessionId}/cart`}
              className="px-5 py-2 bg-julius-gold text-julius-charcoal text-xs font-black rounded-xl hover:bg-yellow-400 transition-colors shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <span>{t("viewCart")}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}