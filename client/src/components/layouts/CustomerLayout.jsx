// client/src/components/layouts/CustomerLayout.jsx
import { useState, useEffect } from "react";
import { Link, useParams, useLocation, Outlet } from "react-router-dom";
import { getSessionById } from "../../services/api";
import { UtensilsCrossed, ShoppingCart, ClipboardList, Receipt, BellRing, Globe } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext";

export default function CustomerLayout({ children }) {
  const { sessionId } = useParams();
  const location = useLocation();
  const [session, setSession] = useState(null);
  const { itemCount } = useCart();
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const fetchSession = async () => {
      if (sessionId) {
        try {
          const data = await getSessionById(sessionId);
          setSession(data);
        } catch (error) {
          console.error("Failed to fetch session:", error);
        }
      }
    };
    fetchSession();
  }, [sessionId]);

  const tableNumber = session?.tableNumber || session?.table?.number;
  const sessionCode = session?.sessionCode;

  const navLinks = [
    { to: `/session/${sessionId}/menu`, label: t("menu"), icon: UtensilsCrossed },
    { to: `/session/${sessionId}/cart`, label: t("cart"), icon: ShoppingCart, badge: itemCount },
    { to: `/session/${sessionId}/orders`, label: t("orders"), icon: ClipboardList },
    { to: `/session/${sessionId}/waiter`, label: t("service"), icon: BellRing },
    { to: `/session/${sessionId}/bill`, label: t("bill"), icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col font-sans text-julius-charcoal">
      {/* Top Coastal Header */}
      <header className="bg-julius-teal text-white sticky top-0 z-30 shadow-md border-b border-julius-teal-light">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-sm">🐚</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base tracking-wide text-white">
                  {t("appName")}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-julius-gold font-bold px-1.5 py-0.5 rounded bg-black/20">
                  {t("coastalBar")}
                </span>
              </div>
              <div className="text-xs text-white/80 flex items-center gap-2 mt-0.5">
                <span>{tableNumber ? `${t("table")} ${tableNumber}` : "Honnavar"}</span>
                {sessionCode && (
                  <span className="font-mono text-[11px] font-bold text-julius-gold bg-julius-teal-dark px-2 py-0.5 rounded-full border border-julius-gold/30">
                    🔑 #{sessionCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher Pill Button (English <-> ಕನ್ನಡ) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-full text-xs font-bold text-white transition-all border border-white/20 active:scale-95 shadow-xs"
              title="Switch Language / ಭಾಷೆ ಬದಲಾಯಿಸಿ"
            >
              <Globe size={13} className="text-julius-gold" />
              <span>{language === "en" ? "ಕನ್ನಡ" : "English"}</span>
            </button>

            {/* Quick Cart Button (always visible on mobile and desktop) */}
            <Link
              to={`/session/${sessionId}/cart`}
              className="relative flex items-center justify-center p-2 bg-white/15 hover:bg-white/25 rounded-full text-white transition-all border border-white/20 active:scale-95 shadow-xs"
              title={t("viewCart")}
            >
              <ShoppingCart size={15} className="text-julius-gold" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center gap-1.5 ml-2">
              {navLinks.map(({ to, label, icon: Icon, badge }) => {
                const isActive = location.pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
                      isActive
                        ? "bg-julius-gold text-julius-charcoal font-bold shadow-sm"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{label}</span>
                    {badge > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 bg-white text-julius-teal font-bold text-[9px] rounded-full flex items-center justify-center shadow-xs">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {session?.status === "CLOSED" && (
        <div className="bg-amber-600 text-white text-xs font-semibold py-2 px-4 text-center shadow-xs">
          {language === "kn"
            ? "ಈ ಟೇಬಲ್ ಸೆಷನ್ ಪಾವತಿಯಾಗಿ ಮುಕ್ತಾಯವಾಗಿದೆ."
            : "This table session has been settled and closed."}
        </div>
      )}

      {/* Main Content View (with support for children or Outlet) */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 mb-24 sm:mb-8">
        {children || <Outlet />}
      </main>

      {/* Mobile Bottom Navigation Bar (5 tabs with active Cart) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-md border-t border-julius-sand z-40 flex items-center justify-around py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {navLinks.map(({ to, label, icon: Icon, badge }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-semibold transition-all relative ${
                isActive ? "text-julius-teal font-bold" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors relative ${
                  isActive ? "bg-julius-teal/10 text-julius-teal" : ""
                }`}
              >
                <Icon size={17} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-julius-gold text-julius-charcoal font-bold text-[9px] rounded-full flex items-center justify-center shadow-sm">
                    {badge}
                  </span>
                )}
              </div>
              <span className="truncate max-w-[54px]">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}