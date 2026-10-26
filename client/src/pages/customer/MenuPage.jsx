// client/src/pages/customer/MenuPage.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Search, Star, Minus, Plus, Mic, MicOff, Volume2 } from "lucide-react";
import { getMenu } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function MenuPage() {
  const { sessionId } = useParams();
  const { language, t, speakText, getItemName, getItemDesc, getCategoryName, matchSearchQuery } = useLanguage();

  // Get session code information passed from the previous page
  const location = useLocation();
  const { sessionCode, newSession } = location.state || {};

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [menu, setMenu] = useState({ items: [], categories: [] });
  const [loading, setLoading] = useState(true);

  // Voice Search State
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState("");
  const recognitionRef = useRef(null);

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
      .catch(() => {
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

      // Set speech recognition language based on user's active choice
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

    return matchesSearch && matchesCategory;
  });

  const quantityOf = (itemId) =>
    cart.find((i) => i.id === itemId)?.quantity || 0;

  if (loading) return <LoadingSpinner label={t("browseMenu") + "..."} />;

  return (
    <div className="pb-24 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">🍽️ {t("menu")}</h1>
      </div>

      {/* Session Code Banner */}
      {newSession && sessionCode && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 mb-6 text-center animate-in fade-in">
          <p className="text-emerald-800 font-medium text-xs">
            {language === "kn" ? "ನಿಮ್ಮ ಟೇಬಲ್ ಸೆಷನ್ ಕೋಡ್:" : "Your session code:"}
          </p>
          <p className="text-3xl font-bold text-emerald-800 my-1 font-mono tracking-widest">
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
          className="w-full pl-10 pr-12 py-2.5 border border-julius-sand rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-julius-teal text-sm shadow-xs"
        />

        {/* 🎙️ Voice Search Microphone Button (Kannada / English) */}
        <button
          onClick={handleToggleVoiceSearch}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
            isListening
              ? "bg-rose-500 text-white animate-pulse shadow-md"
              : "text-julius-teal hover:bg-julius-cream"
          }`}
          title={isListening ? "Stop Listening" : `${t("voiceSearch")} (${language === "kn" ? "ಕನ್ನಡ" : "English"})`}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
      </div>

      {/* Active Voice Listening Banner */}
      {voiceNotice && (
        <div className="mb-4 p-3 bg-gradient-to-r from-julius-teal/10 to-julius-gold/15 border border-julius-teal/30 rounded-xl flex items-center gap-2.5 text-xs text-julius-teal font-semibold animate-in fade-in">
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

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
            selectedCategory === "all"
              ? "bg-julius-teal text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-julius-sand"
          }`}
        >
          {t("all")}
        </button>

        {menu.categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
              selectedCategory === category
                ? "bg-julius-teal text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-julius-sand"
            }`}
          >
            {getCategoryName(category)}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const qty = quantityOf(item.id);

          return (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getItemName(item)}
                      </h3>
                      {language === "kn" && item.name !== getItemName(item) && (
                        <p className="text-[11px] text-gray-400 font-medium">
                          {item.name}
                        </p>
                      )}

                      <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                        {getItemDesc(item)}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                    ₹{item.price}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.isVeg
                          ? "bg-green-100 text-green-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.isVeg ? t("veg") : t("nonVeg")}
                    </span>

                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Star size={13} fill="currentColor" />
                      <span className="text-xs text-gray-600">
                        {item.rating}
                      </span>
                    </div>
                  </div>

                  {qty > 0 ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="w-6 text-center text-xs font-bold text-gray-800">
                        {qty}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded-lg bg-julius-teal text-white hover:bg-julius-teal-light"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addItem(item)}
                      className="px-3 py-1 bg-julius-teal text-white text-xs font-bold rounded-lg hover:bg-julius-teal-light transition-colors shadow-xs"
                    >
                      {t("add")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <p className="text-center text-gray-400 col-span-full py-12 text-sm">
            {t("noItemsFound")}
          </p>
        )}
      </div>

      {/* Cart Bottom Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-julius-sand shadow-lg p-3.5 z-20">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900 text-sm">{itemCount} {t("items")}</span>
              <span className="text-sm font-bold text-julius-teal ml-3">
                ₹{subtotal}
              </span>
            </div>

            <Link
              to={`/session/${sessionId}/cart`}
              className="px-5 py-2 bg-julius-teal text-white text-xs font-bold rounded-xl hover:bg-julius-teal-light transition-colors shadow-sm flex items-center gap-1.5"
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