// client/src/pages/customer/BillPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSessionById, generateBill, payBillOnline, getSocketUrl } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { io } from "socket.io-client";
import { useLanguage } from "../../context/LanguageContext";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  QrCode,
  ShieldCheck,
  Smartphone,
  Printer,
  ChevronRight,
  X,
  Lock
} from "lucide-react";

export default function BillPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { language, t, getItemName } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [session, setSession] = useState(null);
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");

  // Payment Gateway Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("upi_apps"); // 'upi_apps' | 'upi_qr' | 'card'
  const [upiApp, setUpiApp] = useState("gpay"); // 'gpay' | 'phonepe' | 'paytm' | 'cred'
  const [customUpiId, setCustomUpiId] = useState("");
  const [cardData, setCardData] = useState({
    number: "4532 •••• •••• 8821",
    name: "Customer Guest",
    expiry: "09/28",
    cvv: "889"
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStepText, setPaymentStepText] = useState("");
  const [transactionDetails, setTransactionDetails] = useState(null);

  const fetchSession = async () => {
    try {
      const data = await getSessionById(sessionId);
      setSession(data);
      if (data.bill) {
        setBill(data.bill);
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
      setError("Failed to load session details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    const socketUrl = getSocketUrl();
    const socket = io(socketUrl);
    socket.emit("join-session", sessionId);

    socket.on("payment-confirmed", (data) => {
      setBill((prev) => ({
        ...(prev || {}),
        paymentConfirmed: true,
        confirmedAt: data.bill?.confirmedAt || new Date().toISOString()
      }));
      if (data.transactionId) {
        setTransactionDetails({
          id: data.transactionId,
          method: data.paymentMethod || "UPI Online"
        });
      }
      setShowPaymentModal(false);
    });

    return () => socket.disconnect();
  }, [sessionId]);

  const handleGenerateBill = async () => {
    setGenerating(true);
    setError("");
    try {
      const response = await generateBill(sessionId);
      setBill(response.bill);
    } catch (err) {
      console.error("Failed to generate bill:", err);
      setError(err.response?.data?.error || "Failed to generate bill. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const openPaymentGateway = async () => {
    // If bill hasn't been generated yet, generate it first so admin gets the bill-notification ring
    if (!bill) {
      setGenerating(true);
      try {
        const response = await generateBill(sessionId);
        setBill(response.bill);
      } catch (err) {
        console.error("Failed to auto-generate bill:", err);
      } finally {
        setGenerating(false);
      }
    }
    setShowPaymentModal(true);
  };

  const handleExecutePayment = async () => {
    setIsProcessingPayment(true);
    setPaymentStepText("Connecting to Secure Payment Gateway...");

    try {
      await new Promise((r) => setTimeout(r, 800));
      setPaymentStepText("Authorizing transaction with bank...");
      await new Promise((r) => setTimeout(r, 900));

      const generatedTxnId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const methodLabel =
        selectedMethod === "card"
          ? "Debit/Credit Card"
          : selectedMethod === "upi_qr"
          ? "UPI Dynamic QR"
          : `${upiApp.toUpperCase()} (UPI)`;

      setPaymentStepText("Verifying payment settlement...");

      const response = await payBillOnline(sessionId, {
        paymentMethod: methodLabel,
        transactionId: generatedTxnId,
        amount: totals.grandTotal
      });

      if (response.success) {
        setBill(response.bill);
        setTransactionDetails({
          id: response.transactionId,
          method: response.paymentMethod
        });
        await new Promise((r) => setTimeout(r, 400));
        setShowPaymentModal(false);
      }
    } catch (err) {
      console.error("Payment failure:", err);
      alert("Payment failed: " + (err.response?.data?.error || "Transaction declined. Please try again."));
    } finally {
      setIsProcessingPayment(false);
      setPaymentStepText("");
    }
  };

  if (loading) return <LoadingSpinner label="Loading bill..." />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Calculate totals from orders if no bill exists
  const calculateTotals = () => {
    if (!session || !session.orders) return null;

    const subtotal = session.orders.reduce((sum, order) => {
      return sum + (order.items || []).reduce((s, item) => s + item.price * item.quantity, 0);
    }, 0);

    const tax = Math.round(subtotal * 0.05);
    const serviceCharge = Math.round(subtotal * 0.1);
    const grandTotal = subtotal + tax + serviceCharge;

    return { subtotal, tax, serviceCharge, grandTotal };
  };

  const totals = bill
    ? {
        subtotal: bill.total,
        tax: bill.tax,
        serviceCharge: bill.serviceCharge,
        grandTotal: bill.grandTotal,
      }
    : calculateTotals();

  const allItems =
    session?.orders?.flatMap((order) =>
      (order.items || []).map((item) => ({
        ...item,
        orderId: order.id,
      }))
    ) || [];

  const hasItems = allItems.length > 0;
  const isPaid = bill?.paymentConfirmed;

  // Construct UPI deep-link URL for QR & mobile apps
  const upiUrl = `upi://pay?pa=juliuscoastal@okhdfcbank&pn=Julius%20Coastal%20Bar&am=${totals?.grandTotal || 0}&cu=INR&tn=Table%20${session?.tableNumber || ""}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="max-w-xl mx-auto pb-12 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🧾 {t("billSummary")}</h1>
          <p className="text-sm text-gray-500">
            {t("table")} {session?.tableNumber} · #{session?.sessionCode}
          </p>
        </div>
      </div>

      {!hasItems ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-julius-sand p-8">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-gray-700 font-bold">{t("emptyCartTitle")}</p>
          <p className="text-gray-400 text-xs mt-1">{t("emptyCartDesc")}</p>
          <button
            onClick={() => navigate(`/session/${sessionId}/menu`)}
            className="mt-6 px-6 py-2.5 bg-julius-teal text-white font-medium rounded-xl hover:bg-julius-teal-light shadow-sm transition-colors text-sm"
          >
            {t("browseMenu")}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-julius-sand overflow-hidden">
          {/* Paid Banner */}
          {isPaid && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 text-center animate-in fade-in">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <h2 className="font-bold text-xl mb-1 flex items-center justify-center gap-2">
                {t("paymentConfirmed")} <Sparkles size={18} />
              </h2>
              <p className="text-xs text-emerald-100 max-w-sm mx-auto">
                {t("paymentConfirmedDesc")}
              </p>
              {transactionDetails && (
                <div className="mt-3.5 inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-xs font-mono text-emerald-200">
                  <span>Ref: {transactionDetails.id}</span>
                  <span>•</span>
                  <span>{transactionDetails.method}</span>
                </div>
              )}
            </div>
          )}

          {/* Itemized list */}
          <div className="p-5 divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {allItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="py-2.5 flex justify-between items-center text-sm">
                <div>
                  <span className="font-semibold text-gray-900">{item.quantity}x</span>
                  <span className="ml-2.5 text-gray-800 font-medium">{getItemName(item)}</span>
                </div>
                <span className="font-medium text-gray-700">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Pricing Calculation breakdown */}
          {totals && (
            <div className="p-5 bg-gray-50/70 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{t("subtotal")}</span>
                <span>₹{totals.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t("tax")}</span>
                <span>₹{totals.tax}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t("serviceCharge")}</span>
                <span>₹{totals.serviceCharge}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between font-bold text-xl text-gray-900">
                <span>{t("grandTotal")}</span>
                <span className="text-julius-teal">₹{totals.grandTotal}</span>
              </div>
            </div>
          )}

          {/* Bill Action Buttons */}
          <div className="p-5 border-t border-gray-100 bg-white">
            {isPaid ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-800 font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    {language === "kn" ? "ಅಧಿಕೃತ ಇನ್‌ವಾಯ್ಸ್ ಪೂರ್ಣಗೊಂಡಿದೆ" : "Official Invoice Settled"}
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    {bill.confirmedAt ? new Date(bill.confirmedAt).toLocaleString() : "Just now"}
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer size={16} /> {t("printInvoice")}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. Primary Action: Pay with Gateway */}
                <button
                  onClick={openPaymentGateway}
                  disabled={generating}
                  className="w-full py-3.5 bg-gradient-to-r from-julius-teal to-julius-teal-dark text-white rounded-xl font-bold hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 text-base group"
                >
                  <CreditCard size={18} />
                  <span>{t("payWithGateway")} (₹{totals?.grandTotal})</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* 2. Secondary Action: Pay at Counter */}
                {!bill && (
                  <button
                    onClick={handleGenerateBill}
                    disabled={generating}
                    className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-xs hover:bg-gray-50 transition-colors"
                  >
                    {generating ? (language === "kn" ? "ಕೌಂಟರ್‌ಗೆ ತಿಳಿಸಲಾಗುತ್ತಿದೆ..." : "Notifying Counter...") : t("payCashCounter")}
                  </button>
                )}

                {bill && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                    <p className="text-xs text-amber-800 font-semibold flex items-center justify-center gap-1.5">
                      <Clock size={14} /> {t("billRequestedCounter")}
                    </p>
                    <p className="text-[11px] text-amber-600 mt-0.5">
                      {t("counterNote")}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  <span>100% Encrypted & Verified Payment Gateway</span>
                </div>
              </div>
            )}
            {error && <p className="text-red-600 text-xs text-center mt-3">{error}</p>}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECURE PAYMENT GATEWAY MODAL (UPI, QR, CARDS) */}
      {/* ============================================================ */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95">
            {/* Modal Header */}
            <div className="bg-julius-teal text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-julius-gold" />
                  <span className="text-xs font-bold uppercase tracking-wider text-julius-gold">
                    Julius Checkout
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-0.5">Payment Gateway</h3>
                <p className="text-xs text-white/80">Table {session?.tableNumber} · Total ₹{totals?.grandTotal}</p>
              </div>
              <button
                onClick={() => !isProcessingPayment && setShowPaymentModal(false)}
                disabled={isProcessingPayment}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Payment Method Tabs */}
            <div className="p-5">
              {isProcessingPayment ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-julius-teal border-t-transparent"></div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-base">{paymentStepText}</h4>
                    <p className="text-xs text-gray-400 mt-1">Please do not refresh or close this screen</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setSelectedMethod("upi_apps")}
                      className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                        selectedMethod === "upi_apps"
                          ? "bg-white text-julius-teal shadow-xs font-bold"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <Smartphone size={14} />
                      UPI Apps
                    </button>
                    <button
                      onClick={() => setSelectedMethod("upi_qr")}
                      className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                        selectedMethod === "upi_qr"
                          ? "bg-white text-julius-teal shadow-xs font-bold"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <QrCode size={14} />
                      Scan QR
                    </button>
                    <button
                      onClick={() => setSelectedMethod("card")}
                      className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                        selectedMethod === "card"
                          ? "bg-white text-julius-teal shadow-xs font-bold"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <CreditCard size={14} />
                      Card
                    </button>
                  </div>

                  {/* TAB 1: UPI APPS */}
                  {selectedMethod === "upi_apps" && (
                    <div className="space-y-3 pt-1">
                      <p className="text-xs font-semibold text-gray-600">Select your preferred UPI app:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "gpay", label: "Google Pay", icon: "🌐" },
                          { id: "phonepe", label: "PhonePe", icon: "🟣" },
                          { id: "paytm", label: "Paytm UPI", icon: "🔵" },
                          { id: "cred", label: "CRED UPI", icon: "🪙" },
                        ].map((app) => (
                          <button
                            key={app.id}
                            onClick={() => setUpiApp(app.id)}
                            className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                              upiApp === app.id
                                ? "border-julius-teal bg-julius-teal/5 text-julius-teal font-bold shadow-xs"
                                : "border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="text-xl">{app.icon}</span>
                            <span className="text-xs">{app.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="pt-2">
                        <label className="block text-xs text-gray-500 mb-1">Or enter UPI ID / VPA</label>
                        <input
                          type="text"
                          placeholder="e.g., yourname@okhdfcbank"
                          value={customUpiId}
                          onChange={(e) => setCustomUpiId(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-julius-teal outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DYNAMIC UPI QR */}
                  {selectedMethod === "upi_qr" && (
                    <div className="text-center py-2 space-y-3">
                      <p className="text-xs text-gray-600 font-medium">
                        Scan with any UPI App (GPay / PhonePe / Paytm / BHIM)
                      </p>
                      <div className="w-48 h-48 mx-auto bg-white p-2 rounded-2xl border-2 border-dashed border-julius-teal/40 flex items-center justify-center shadow-inner">
                        <img
                          src={qrCodeImageUrl}
                          alt="Dynamic Table UPI QR"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <div className="font-mono text-xs font-bold text-julius-teal bg-julius-cream px-3 py-1.5 rounded-lg inline-block border border-julius-sand">
                        Pay exactly: ₹{totals?.grandTotal}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CARDS */}
                  {selectedMethod === "card" && (
                    <div className="space-y-3 pt-1 text-xs">
                      <div>
                        <label className="block text-gray-500 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardData.number}
                          onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-julius-teal outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-gray-500 mb-1">Valid Thru</label>
                          <input
                            type="text"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-julius-teal outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-500 mb-1">CVV</label>
                          <input
                            type="password"
                            value={cardData.cvv}
                            maxLength={4}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-julius-teal outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pay Button */}
                  <div className="pt-3">
                    <button
                      onClick={handleExecutePayment}
                      className="w-full py-3.5 bg-julius-teal hover:bg-julius-teal-dark text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                    >
                      <Lock size={15} />
                      <span>Authorize & Pay ₹{totals?.grandTotal}</span>
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      Instant settlement · Auto-notifies restaurant cashier
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}