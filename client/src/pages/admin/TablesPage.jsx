// client/src/pages/admin/TablesPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table2, Plus, Circle, X, Play, QrCode, Download, ExternalLink, Copy, Check } from "lucide-react";
import { getTables, createTable, startTableSession, getSocketUrl } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { io } from "socket.io-client";
import { useLanguage } from "../../context/LanguageContext";

const SECTIONS = ["All", "AC", "Non-AC"];

function getStatusStyles(status, t) {
  const styles = {
    available: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: t ? t("available") : "Available" },
    occupied: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500", label: t ? t("occupied") : "Occupied" },
    bill_generated: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", label: t ? t("billRequested") : "Bill Requested" },
  };
  return styles[status] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-400", label: status };
}

const TablesPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("All");
  const [adding, setAdding] = useState(false);
  const [startingSession, setStartingSession] = useState(false);

  // Add Table Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTable, setNewTable] = useState({ number: 1, section: "AC", capacity: 4 });

  // Start Session Modal for walk-ins
  const [seatingTable, setSeatingTable] = useState(null);
  const [guestCount, setGuestCount] = useState(2);

  // QR Code Modal
  const [qrModalTable, setQrModalTable] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchTables = async () => {
    try {
      const data = await getTables();
      setTables(data);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();

    const socketUrl = getSocketUrl();
    const socket = io(socketUrl);
    socket.emit("join-admin");

    socket.on("session-started", () => fetchTables());
    socket.on("bill-notification", () => fetchTables());
    socket.on("payment-confirmed", () => fetchTables());
    socket.on("table-updated", () => fetchTables());

    return () => socket.disconnect();
  }, []);

  const openAddModal = () => {
    const nextNumber = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1;
    setNewTable({ number: nextNumber, section: "AC", capacity: 4 });
    setShowAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTable((prev) => ({
      ...prev,
      [name]: name === "number" || name === "capacity" ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddTable = async () => {
    setAdding(true);
    try {
      await createTable(newTable.number, newTable.section, newTable.capacity);
      await fetchTables();
      setShowAddModal(false);
    } catch (error) {
      console.error("Add table error:", error);
      alert("Failed to add table: " + (error.response?.data?.error || error.message));
    } finally {
      setAdding(false);
    }
  };

  const handleSeatGuests = async () => {
    if (!seatingTable) return;
    setStartingSession(true);
    try {
      const res = await startTableSession(seatingTable.id, guestCount);
      setSeatingTable(null);
      await fetchTables();
      navigate(`/admin/tables/${res.sessionId}`);
    } catch (error) {
      console.error("Start session error:", error);
      alert("Failed to start session: " + (error.response?.data?.error || error.message));
    } finally {
      setStartingSession(false);
    }
  };

  const filteredTables = tables.filter(
    (table) => activeSection === "All" || table.section === activeSection
  );

  if (loading) return <LoadingSpinner label={language === "kn" ? "ಟೇಬಲ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." : "Loading tables..."} />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === "kn" ? "ಟೇಬಲ್‌ಗಳ ನಿರ್ವಹಣೆ" : "Tables Management"}
          </h1>
          <p className="text-gray-600">
            {language === "kn"
              ? "ನೈಜ-ಸಮಯದ ಟೇಬಲ್ ಸ್ಥಿತಿ, QR ಪ್ರವೇಶ ಮತ್ತು ಗ್ರಾಹಕರ ಆಸನ ನಿರ್ವಹಣೆ."
              : "Real-time table occupancy, QR access, and guest seating."}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm self-start font-medium"
        >
          <Plus size={18} />
          {t("addTable")}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {SECTIONS.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === section
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-50 border"
            }`}
          >
            {section === "All" ? t("all") : section}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const stateKey = table.occupancyState || table.status;
          const statusStyle = getStatusStyles(stateKey, t);

          return (
            <div
              key={table.id}
              className={`bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow flex flex-col justify-between ${statusStyle.border}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Table2 size={22} className="text-gray-700" />
                    <span className="font-bold text-lg text-gray-900">{t("table")} {table.number}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    <Circle size={6} className={statusStyle.dot} fill="currentColor" />
                    {statusStyle.label}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t("filterSection")}:</span>
                    <span className="font-medium text-gray-800">{table.section}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{language === "kn" ? "ಸಾಮರ್ಥ್ಯ:" : "Capacity:"}</span>
                    <span className="font-medium text-gray-800">
                      {table.capacity} {language === "kn" ? "ಜನರು" : "Persons"}
                    </span>
                  </div>
                  {table.activeSession && (
                    <>
                      <div className="flex justify-between pt-1 border-t">
                        <span className="text-gray-400">{t("code")}:</span>
                        <span className="font-mono font-bold text-blue-600">{table.activeSession.sessionCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t("orders")}:</span>
                        <span className="font-medium">
                          {table.activeSession.orderCount} {language === "kn" ? "ಆರ್ಡರ್‌ಗಳು" : "placed"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t flex flex-col gap-2">
                {table.sessionId ? (
                  <button
                    onClick={() => navigate(`/admin/tables/${table.sessionId}`)}
                    className="w-full py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                  >
                    {language === "kn" ? "ಸಕ್ರಿಯ ಸೆಷನ್ ನೋಡಿ →" : "View Active Session →"}
                  </button>
                ) : (
                  <button
                    onClick={() => setSeatingTable(table)}
                    className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play size={14} />
                    {t("seatGuests")}
                  </button>
                )}

                {table.qrToken && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => { setQrModalTable(table); setCopied(false); }}
                      className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 hover:border-blue-200"
                    >
                      <QrCode size={13} className="text-blue-600" />
                      {language === "kn" ? "QR ಕೋಡ್ ನೋಡಿ" : "View QR Code"}
                    </button>
                    <a
                      href={`/table/${table.qrToken}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 transition-colors"
                      title={language === "kn" ? "ಗ್ರಾಹಕರ ಲಿಂಕ್ ತೆರೆಯಿರಿ" : "Open customer landing page"}
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredTables.length === 0 && (
          <p className="text-gray-500 text-sm col-span-full text-center py-12">
            {language === "kn" ? "ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಟೇಬಲ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ." : "No tables found in this section."}
          </p>
        )}
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {language === "kn" ? "ಹೊಸ ಟೇಬಲ್ ಸೇರಿಸಿ" : "Add New Table"}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "kn" ? "ಟೇಬಲ್ ಸಂಖ್ಯೆ" : "Table Number"}
                </label>
                <input
                  type="number"
                  name="number"
                  value={newTable.number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("filterSection")}
                </label>
                <select
                  name="section"
                  value={newTable.section}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "kn" ? "ಸಾಮರ್ಥ್ಯ" : "Capacity"}
                </label>
                <select
                  name="capacity"
                  value={newTable.capacity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="2">2 {language === "kn" ? "ಜನರು" : "Persons"}</option>
                  <option value="4">4 {language === "kn" ? "ಜನರು" : "Persons"}</option>
                  <option value="6">6 {language === "kn" ? "ಜನರು" : "Persons"}</option>
                  <option value="8">8 {language === "kn" ? "ಜನರು" : "Persons"}</option>
                  <option value="10">10 {language === "kn" ? "ಜನರು" : "Persons"}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                {language === "kn" ? "ರದ್ದುಮಾಡಿ" : "Cancel"}
              </button>
              <button
                onClick={handleAddTable}
                disabled={adding}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {adding
                  ? (language === "kn" ? "ಸೇರಿಸಲಾಗುತ್ತಿದೆ..." : "Adding...")
                  : (language === "kn" ? "ಟೇಬಲ್ ಸೇರಿಸಿ" : "Add Table")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seat Walk-in Guests Modal */}
      {seatingTable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {language === "kn" ? "ಗ್ರಾಹಕರನ್ನು ಕೂರಿಸಿ" : "Seat Guests"} ({t("table")} {seatingTable.number})
              </h2>
              <button onClick={() => setSeatingTable(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {language === "kn"
                ? `ಟೇಬಲ್ ${seatingTable.number} (${seatingTable.section}) ಗಾಗಿ ಸಕ್ರಿಯ ಊಟದ ಸೆಷನ್ ಪ್ರಾರಂಭಿಸಿ.`
                : `Start an active session for walk-in dining at Table ${seatingTable.number} (${seatingTable.section}).`}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "kn" ? "ಗ್ರಾಹಕರ ಸಂಖ್ಯೆ" : "Number of Guests"}
              </label>
              <input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-bold"
                min="1"
                max={seatingTable.capacity * 2}
              />
              <span className="text-xs text-gray-400 mt-1 block">
                {language === "kn"
                  ? `ಟೇಬಲ್ ಸಾಮರ್ಥ್ಯ ${seatingTable.capacity} ಜನರು.`
                  : `Table capacity is ${seatingTable.capacity} persons.`}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSeatingTable(null)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                {language === "kn" ? "ರದ್ದುಮಾಡಿ" : "Cancel"}
              </button>
              <button
                onClick={handleSeatGuests}
                disabled={startingSession}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
              >
                {startingSession
                  ? (language === "kn" ? "ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ..." : "Seating...")
                  : (language === "kn" ? "ಸೆಷನ್ ಪ್ರಾರಂಭಿಸಿ" : "Start Session")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View QR Code Modal */}
      {qrModalTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 text-center">
            <button
              onClick={() => setQrModalTable(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-3">
              <QrCode size={24} />
            </div>

            <h3 className="text-xl font-bold text-gray-900">
              {language === "kn" ? `ಟೇಬಲ್ ${qrModalTable.number} QR ಕೋಡ್` : `Table ${qrModalTable.number} QR Code`}
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              {qrModalTable.section} · {qrModalTable.capacity} {language === "kn" ? "ಜನರ ಸಾಮರ್ಥ್ಯ" : "Persons"}
            </p>

            {/* QR Code Image */}
            <div className="p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-inner inline-block mb-4">
              <img
                src={`/qr-codes/table-${qrModalTable.number}.png`}
                alt={`Table ${qrModalTable.number} QR Code`}
                className="w-56 h-56 object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  const targetUrl = `${window.location.origin}/table/${qrModalTable.qrToken}`;
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;
                }}
              />
            </div>

            <p className="text-xs text-slate-400 mb-4 px-2">
              {language === "kn"
                ? "ಗ್ರಾಹಕರು ತಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಮೆನು ವೀಕ್ಷಿಸಬಹುದು."
                : "Guests can scan this from their phone camera to open the menu and place orders."}
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <a
                  href={`/qr-codes/table-${qrModalTable.number}.png`}
                  download={`table-${qrModalTable.number}-qr.png`}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download size={15} />
                  {language === "kn" ? "ಡೌನ್‌ಲೋಡ್" : "Download PNG"}
                </a>
                <button
                  onClick={() => {
                    const targetUrl = `${window.location.origin}/table/${qrModalTable.qrToken}`;
                    navigator.clipboard.writeText(targetUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                  {copied ? (language === "kn" ? "ಕಾಪಿ ಆಗಿದೆ!" : "Copied!") : (language === "kn" ? "ಲಿಂಕ್ ಕಾಪಿ" : "Copy Link")}
                </button>
              </div>

              <a
                href={`/table/${qrModalTable.qrToken}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-center gap-1"
              >
                <ExternalLink size={12} />
                {language === "kn" ? "ಗ್ರಾಹಕನಾಗಿ ಈ ಪುಟವನ್ನು ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ" : "Test as Guest in New Tab"}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablesPage;