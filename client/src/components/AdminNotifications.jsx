// client/src/components/AdminNotifications.jsx
import { useEffect, useState, useRef } from "react";
import { Bell, Check, X, Coffee, Receipt, ShoppingBag, Sparkles, AlertCircle, Volume2 } from "lucide-react";
import { io } from "socket.io-client";
import { resolveCustomerRequest } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

// Synthesize pleasant notification chime using Web Audio API (no external mp3 dependency required)
function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // Audio autoplay might be restricted before user gesture
  }
}

// Celebratory cash register / victory chime for payment confirmation
function playPaymentChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
    });
  } catch (e) {
    // Audio autoplay might be restricted before user gesture
  }
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const { language, t, speakText } = useLanguage();

  const langRef = useRef(language);
  useEffect(() => {
    langRef.current = language;
  }, [language]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socket = io(socketUrl);
    socket.emit("join-admin");

    socket.on("order-notification", (data) => {
      playNotificationChime();
      const isKn = langRef.current === "kn";
      const tableNum = data.order?.tableNumber || "";
      
      // Voice Speech Announcement (Kannada or English)
      if (isKn) {
        speakText(`ಟೇಬಲ್ ${tableNum} ರಿಂದ ಹೊಸ ಆರ್ಡರ್ ಬಂದಿದೆ`, "kn");
      } else {
        speakText(`New order received from Table ${tableNum}`, "en");
      }

      const notif = {
        id: `order-${Date.now()}-${Math.random()}`,
        type: "order",
        title: isKn ? `ಟೇಬಲ್ ${tableNum} ರಿಂದ ಹೊಸ ಆರ್ಡರ್` : `New Order from Table ${tableNum || "N/A"}`,
        subtitle: `${data.order?.items?.length || 0} items (₹${data.order?.total || 0})`,
        time: new Date(),
        sessionId: data.order?.sessionId,
        read: false,
      };
      setNotifications((prev) => [notif, ...prev.slice(0, 19)]);
    });

    socket.on("bill-notification", (data) => {
      playNotificationChime();
      const isKn = langRef.current === "kn";
      const tableNum = data.tableNumber || "";

      // Voice Speech Announcement (Kannada or English)
      if (isKn) {
        speakText(`ಟೇಬಲ್ ${tableNum} ರವರು ಬಿಲ್ ಕೋರಿದ್ದಾರೆ`, "kn");
      } else {
        speakText(`Bill requested for Table ${tableNum}`, "en");
      }

      const notif = {
        id: `bill-${Date.now()}-${Math.random()}`,
        type: "bill",
        title: isKn ? `ಬಿಲ್ ಕೋರಲಾಗಿದೆ: ಟೇಬಲ್ ${tableNum}` : `Bill Requested: Table ${tableNum || "N/A"}`,
        subtitle: `Grand Total: ₹${data.grandTotal || data.bill?.grandTotal || 0}`,
        time: new Date(),
        sessionId: data.sessionId,
        read: false,
      };
      setNotifications((prev) => [notif, ...prev.slice(0, 19)]);
    });

    socket.on("payment-confirmed", (data) => {
      playPaymentChime();
      const isKn = langRef.current === "kn";
      const tableNum = data.tableNumber || "";

      // Voice Speech Announcement (Kannada or English)
      if (isKn) {
        speakText(`ಟೇಬಲ್ ${tableNum} ರ ಪಾವತಿ ದೃಢಪಟ್ಟಿದೆ`, "kn");
      } else {
        speakText(`Payment confirmed for Table ${tableNum}`, "en");
      }

      const notif = {
        id: `payment-${Date.now()}-${Math.random()}`,
        type: "payment",
        title: isKn ? `🎉 ಪಾವತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ: ಟೇಬಲ್ ${tableNum}` : `🎉 Payment Received: Table ${tableNum || "N/A"}`,
        subtitle: `₹${data.grandTotal || data.bill?.grandTotal || 0} via ${data.paymentMethod || "UPI"}`,
        time: new Date(),
        sessionId: data.sessionId,
        read: false,
      };
      setNotifications((prev) => [notif, ...prev.slice(0, 19)]);
    });

    socket.on("order-cancelled", (data) => {
      playNotificationChime();
      const isKn = langRef.current === "kn";
      const tableNum = data.tableNumber || "";

      // Voice Speech Announcement (Kannada or English)
      if (isKn) {
        speakText(`ಟೇಬಲ್ ${tableNum} ರ ಆರ್ಡರ್ ರದ್ದುಮಾಡಲಾಗಿದೆ`, "kn");
      } else {
        speakText(`Order cancelled for Table ${tableNum}`, "en");
      }

      const notif = {
        id: `cancel-${Date.now()}-${Math.random()}`,
        type: "cancelled",
        title: isKn ? `⚠️ ಆರ್ಡರ್ ರದ್ದುಮಾಡಲಾಗಿದೆ: ಟೇಬಲ್ ${tableNum}` : `⚠️ Order Cancelled: Table ${tableNum || "N/A"}`,
        subtitle: data.message || "Customer cancelled pending order",
        time: new Date(),
        sessionId: data.sessionId,
        read: false,
      };
      setNotifications((prev) => [notif, ...prev.slice(0, 19)]);
    });

    socket.on("customer-request", (data) => {
      playNotificationChime();
      const isKn = langRef.current === "kn";
      const tableNum = data.tableNumber || "";

      // Voice Speech Announcement (Kannada or English)
      if (isKn) {
        speakText(`ಟೇಬಲ್ ${tableNum} ಗೆ ಸಹಾಯ ಅಥವಾ ಸೇವೆ ಬೇಕಾಗಿದೆ`, "kn");
      } else {
        speakText(`Service requested from Table ${tableNum}`, "en");
      }

      const notif = {
        id: `req-${data.id || Date.now()}`,
        requestId: data.id,
        type: "request",
        title: isKn ? `ಟೇಬಲ್ ${tableNum}: ಸಹಾಯದ ವಿನಂತಿ` : `Table ${tableNum}: ${data.type?.replace("_", " ")}`,
        subtitle: data.description || (isKn ? "ಗ್ರಾಹಕರಿಗೆ ಸೇವೆ ಬೇಕಾಗಿದೆ" : "Customer needs assistance"),
        time: new Date(),
        sessionId: data.sessionId,
        read: false,
      };
      setNotifications((prev) => [notif, ...prev.slice(0, 19)]);
    });

    // Close panel on click outside
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      socket.disconnect();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResolve = async (notif, e) => {
    e.stopPropagation();
    if (notif.requestId) {
      try {
        await resolveCustomerRequest(notif.requestId);
      } catch (err) {
        console.error("Resolve error:", err);
      }
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
  };

  const handleClickNotif = (notif) => {
    // Mark as read immediately so unreadCount badge decreases
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.sessionId) {
      navigate(`/admin/tables/${notif.sessionId}`);
      setIsOpen(false);
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  // Only count notifications that have not been tapped/visited yet
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 relative transition-colors focus:outline-none cursor-pointer"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center animate-bounce shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">
                {language === "kn" ? "ಲೈವ್ ಸೂಚನೆಗಳು" : "Live Alerts"}
              </span>
              {unreadCount > 0 ? (
                <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} {language === "kn" ? "ಹೊಸತು" : "new"}
                </span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">
                  {language === "kn" ? "ಎಲ್ಲ ಓದಲಾಗಿದೆ" : "All read"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  if (language === "kn") {
                    speakText("ಟೇಬಲ್ 1 ರಿಂದ ಹೊಸ ಆರ್ಡರ್ ಬಂದಿದೆ", "kn");
                  } else {
                    speakText("New order received from Table 1", "en");
                  }
                }}
                className="text-xs text-julius-teal hover:text-julius-teal-light flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                title="Test Audio Announcement"
              >
                <Volume2 size={13} />
                <span>{language === "kn" ? "ಧ್ವನಿ" : "Voice"}</span>
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  {language === "kn" ? "ಓದಲಾಗಿದೆ" : "Mark read"}
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Clear all alerts"
                >
                  {language === "kn" ? "ತೆರವು" : "Clear"}
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleClickNotif(notif)}
                className={`p-3.5 transition-all flex items-start gap-3 cursor-pointer ${
                  notif.read
                    ? "bg-white/80 hover:bg-gray-50 opacity-65"
                    : "bg-blue-50/40 hover:bg-blue-50/70"
                }`}
              >
                <div
                  className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                    notif.type === "payment"
                      ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400/40"
                      : notif.type === "cancelled"
                      ? "bg-rose-100 text-rose-700 ring-2 ring-rose-400/30"
                      : notif.type === "order"
                      ? "bg-green-100 text-green-700"
                      : notif.type === "bill"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {notif.type === "payment" && <Sparkles size={16} />}
                  {notif.type === "cancelled" && <AlertCircle size={16} />}
                  {notif.type === "order" && <ShoppingBag size={16} />}
                  {notif.type === "bill" && <Receipt size={16} />}
                  {notif.type === "request" && <Coffee size={16} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {!notif.read && (
                      <span
                        className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 animate-pulse"
                        title="Unread"
                      />
                    )}
                    <p
                      className={`text-sm leading-tight truncate ${
                        notif.read ? "font-normal text-gray-700" : "font-bold text-gray-900"
                      }`}
                    >
                      {notif.title}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{notif.subtitle}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-400">
                      {new Date(notif.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {notif.read && (
                      <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.2 rounded font-medium">
                        {language === "kn" ? "ಭೇಟಿ ನೀಡಲಾಗಿದೆ" : "Visited"}
                      </span>
                    )}
                  </div>
                </div>

                {notif.type === "request" ? (
                  <button
                    onClick={(e) => handleResolve(notif, e)}
                    className="p-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                    title="Mark Served"
                  >
                    <Check size={14} />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-xs">No active alerts at the moment.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}