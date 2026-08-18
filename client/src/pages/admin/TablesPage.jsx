// client/src/pages/admin/TablesPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table2, Plus, Circle } from "lucide-react";
import { getTables } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { TABLE_STATUS_STYLES } from "../../utils/format";

const SECTIONS = ["All", "AC", "Non-AC"];

const TablesPage = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("All");

  useEffect(() => {
    getTables().then((data) => {
      setTables(data);
      setLoading(false);
    });
  }, []);

  const filteredTables = tables.filter(
    (table) => activeSection === "All" || table.section === activeSection
  );

  const handleStartSession = (table) => {
    // Table/session creation needs the backend (Table + TableSession
    // tables aren't built yet) — this is a placeholder until then.
    alert(`Starting a new session for Table ${table.number} will be wired up once the backend is ready.`);
  };

  if (loading) return <LoadingSpinner label="Loading tables..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tables</h1>
          <p className="text-gray-600">Manage your restaurant tables</p>
        </div>
        <button
          onClick={() => alert("Adding tables will be wired up once the backend is ready.")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Table
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {SECTIONS.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === section ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const statusStyle = TABLE_STATUS_STYLES[table.status];
          return (
            <div key={table.id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Table2 size={20} className="text-gray-600" />
                <span className="font-semibold text-lg">Table {table.number}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Section:</span>
                  <span className="text-sm font-medium">{table.section}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Capacity:</span>
                  <span className="text-sm font-medium">{table.capacity} persons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle size={8} className={statusStyle.dot} fill="currentColor" />
                  <span className={`text-sm font-medium ${statusStyle.text}`}>{statusStyle.label}</span>
                  {table.sessionId && (
                    <span className="text-xs text-gray-400 ml-2">Session: {table.sessionId}</span>
                  )}
                </div>
              </div>

              {table.status === "occupied" && (
                <button
                  onClick={() => navigate(`/admin/tables/${table.sessionId}`)}
                  className="mt-3 w-full py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  View Session
                </button>
              )}
              {table.status === "available" && (
                <button
                  onClick={() => handleStartSession(table)}
                  className="mt-3 w-full py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  Start New Session
                </button>
              )}
            </div>
          );
        })}
        {filteredTables.length === 0 && (
          <p className="text-gray-500 text-sm col-span-full text-center py-8">No tables in this section.</p>
        )}
      </div>
    </div>
  );
};

export default TablesPage;
