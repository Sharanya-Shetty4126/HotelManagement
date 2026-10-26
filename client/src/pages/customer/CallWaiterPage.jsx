// client/src/pages/customer/CallWaiterPage.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { createCustomerRequest, getSessionRequests, getSocketUrl } from "../../services/api";
import { ArrowLeft, CheckCircle2, Clock, Mic, MicOff, Volume2 } from "lucide-react";
import { io } from "socket.io-client";
import { useLanguage } from "../../context/LanguageContext";

export default function CallWaiterPage() {
  const { sessionId } = useParams();
  const { language, t } = useLanguage();
  const [submitting, setSubmitting] = useState(null);
  const [customNote, setCustomNote] = useState("");
  const [requests, setRequests] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Voice Request State
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState("");
  const recognitionRef = useRef(null);

  const REQUEST_TYPES = [
    { id: "WATER", labelKey: "water", emoji: "💧", descKey: "waterDesc", keywords: ["ನೀರು", "water", "water please"] },
    { id: "CUTLERY", labelKey: "cutlery", emoji: "🍴", descKey: "cutleryDesc", keywords: ["ಚಮಚ", "spoon", "fork", "cutlery", "ಫೋರ್ಕ್", "ಚಮಚ ಬೇಕು"] },
    { id: "NAPKINS", labelKey: "tissue", emoji: "🧻", descKey: "tissueDesc", keywords: ["ಟಿಶ್ಯೂ", "tissue", "napkin", "ಕರವಸ್ತ್ರ", "tissue paper"] },
    { id: "EXTRA_PLATES", labelKey: "extraPlates", emoji: "🍽️", descKey: "extraPlatesDesc", keywords: ["ಪ್ಲೇಟ್", "plate", "plates", "ತಟ್ಟೆ"] },
    { id: "ASSISTANCE", labelKey: "assistance", emoji: "👋", descKey: "assistanceDesc", keywords: ["ವೇಟರ್", "waiter", "ಸರ್ವರ್", "help", "assistant", "call waiter", "ಬನ್ನಿ"] },
    { id: "COMPLAINT", labelKey: "complaint", emoji: "📝", descKey: "complaintDesc", keywords: ["ದೂರು", "complaint", "issue", "problem", "ಸಮಸ್ಯೆ"] },
  ];

  const loadRequests = async () => {
    try {
      const data = await getSessionRequests(sessionId);
      setRequests(data || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  };

  useEffect(() => {
    loadRequests();

    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    const joinSession = () => {
      if (sessionId) {
        socket.emit("join-session", sessionId);
      }
    };

    socket.on("connect", joinSession);
    if (socket.connected) {
      joinSession();
    }

    socket.on("request-resolved", () => {
      loadRequests();
    });

    // 10-second polling fallback so requests are always fresh
    const interval = setInterval(loadRequests, 10000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [sessionId]);

  const handleSendRequest = async (type, note = customNote) => {
    setSubmitting(type.id);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await createCustomerRequest(sessionId, type.id, note);
      const label = t(type.labelKey);
      const message = language === "kn"
        ? `${label} ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ. ಸಿಬ್ಬಂದಿಗೆ ಮಾಹಿತಿ ತಲುಪಿದೆ!`
        : `Requested ${label}. Table server has been notified!`;

      setSuccessMsg(message);
      setCustomNote("");
      await loadRequests();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error("Submit request error:", err);
      setErrorMsg(err.response?.data?.error || "Failed to send request. Please try again.");
    } finally {
      setSubmitting(null);
    }
  };

  // Web Speech API Voice Request (Kannada & English)
  const handleToggleVoiceRequest = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(language === "kn"
        ? "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಸೌಲಭ್ಯ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಗೂಗಲ್ ಕ್ರೋಮ್ ಬಳಸಿ."
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
      setVoiceNotice(language === "kn"
        ? "ಕನ್ನಡದಲ್ಲಿ ಸೇವೆಯನ್ನು ಹೇಳಿ... (ಉದಾ: ನೀರು, ಚಮಚ, ವೇಟರ್, ಟಿಶ್ಯೂ)"
        : "Listening in English... (e.g. Water, Spoon, Call Waiter)");

      recognition.onresult = (event) => {
        const spoken = event.results[0][0].transcript.toLowerCase();
        setVoiceNotice(language === "kn" ? `ಧ್ವನಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ: "${spoken}"` : `Heard: "${spoken}"`);

        // Smart match spoken voice to request types
        const matchedType = REQUEST_TYPES.find((req) =>
          req.keywords.some((kw) => spoken.includes(kw.toLowerCase()))
        );

        if (matchedType) {
          handleSendRequest(matchedType, spoken);
        } else {
          // If no predefined type matched, place speech in custom instructions box
          setCustomNote(event.results[0][0].transcript);
          setSuccessMsg(language === "kn" ? `ಸೂಚನೆ ದಾಖಲಾಗಿದೆ: "${spoken}"` : `Spoken request noted: "${spoken}"`);
        }

        setTimeout(() => setVoiceNotice(""), 3500);
      };

      recognition.onerror = (event) => {
        console.warn("Voice request error:", event.error);
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

  const pendingRequests = requests.filter((r) => !r.resolved);

  return (
    <div className="max-w-xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/session/${sessionId}/menu`}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("needService")}</h1>
            <p className="text-xs text-gray-500">{t("serviceDesc")}</p>
          </div>
        </div>

        {/* 🎙️ Voice Service Button */}
        <button
          onClick={handleToggleVoiceRequest}
          className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-all text-xs font-bold ${
            isListening
              ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-md"
              : "bg-white text-julius-teal border-julius-sand hover:bg-julius-cream"
          }`}
          title={isListening ? "Stop" : `${t("voiceSearch")} (${language === "kn" ? "ಕನ್ನಡ" : "English"})`}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          <span>{isListening ? (language === "kn" ? "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ..." : "Listening...") : (language === "kn" ? "ಧ್ವನಿ ಕರೆ" : "Voice Call")}</span>
        </button>
      </div>

      {/* Voice Listening Notice */}
      {voiceNotice && (
        <div className="mb-4 p-3 bg-gradient-to-r from-julius-teal/10 to-julius-gold/15 border border-julius-teal/30 rounded-xl flex items-center gap-2.5 text-xs text-julius-teal font-semibold animate-in fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          <span>{voiceNotice}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Quick Request Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {REQUEST_TYPES.map((type) => {
          const isCurrentSubmitting = submitting === type.id;
          return (
            <button
              key={type.id}
              onClick={() => handleSendRequest(type)}
              disabled={submitting !== null}
              className="p-4 bg-white border border-julius-sand rounded-2xl hover:border-julius-teal hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{type.emoji}</span>
              <div>
                <span className="block text-sm font-semibold text-gray-900">{t(type.labelKey)}</span>
                <span className="block text-[11px] text-gray-400 leading-tight mt-0.5">{t(type.descKey)}</span>
              </div>
              {isCurrentSubmitting && (
                <span className="text-xs text-julius-teal font-medium">
                  {language === "kn" ? "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ..." : "Sending..."}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Optional Note input */}
      <div className="bg-white p-4 rounded-2xl border border-julius-sand mb-6">
        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
          {t("specificNotes")}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={language === "kn" ? "ಉದಾ: ಬಿಸಿ ನೀರು ಕೊಡಿ, ಹೆಚ್ಚು ಉಪ್ಪು ತನ್ನಿ..." : "e.g., Warm water please, or extra lime slices..."}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-julius-teal"
            maxLength={120}
          />
          {customNote && (
            <button
              onClick={() => handleSendRequest({ id: "ASSISTANCE", labelKey: "assistance" }, customNote)}
              className="px-4 py-2 bg-julius-teal text-white rounded-xl text-xs font-bold whitespace-nowrap hover:bg-julius-teal-light transition-colors"
            >
              {language === "kn" ? "ಕಳುಹಿಸಿ" : "Send"}
            </button>
          )}
        </div>
      </div>

      {/* Active Service Requests Status */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-amber-600" />
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              {language === "kn" ? `ಬಾಕಿ ವಿನಂತಿಗಳು (${pendingRequests.length})` : `Pending Requests (${pendingRequests.length})`}
            </h3>
          </div>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-amber-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-gray-800 capitalize">
                    {req.type?.replace("_", " ").toLowerCase()}
                  </span>
                  {req.description && <p className="text-gray-500 text-[11px] mt-0.5">{req.description}</p>}
                </div>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  {language === "kn" ? "ಸಿಬ್ಬಂದಿಗೆ ತಿಳಿಸಲಾಗಿದೆ" : "Server notified"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}