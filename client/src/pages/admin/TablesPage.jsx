// client/src/pages/admin/TablesPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table2, Plus, Circle, X } from "lucide-react";
import { getTables } from "../../services/api";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";

const SECTIONS = ["All", "AC", "Non-AC"];

function getStatusStyles(status) {
  const styles = {
    available: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Available" },
    occupied: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Occupied" },
    reserved: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: "Reserved" },
  };
  return styles[status] || { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500", label: "Unknown" };
}

const TablesPage = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("All");
  const [adding, setAdding] = useState(false);
  
  // ✅ Modal states
  const [showModal, setShowModal] = useState(false);
  const [newTable, setNewTable] = useState({
    number: 0,
    section: "AC",
    capacity: 4
  });

  const fetchTables = async () => {
    try {
      const data = await getTables();
      setTables(data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // ✅ Open modal with next available table number
  const openAddModal = () => {
    const nextNumber = tables.length > 0 
      ? Math.max(...tables.map(t => t.number)) + 1 
      : 1;
    setNewTable({
      number: nextNumber,
      section: "AC",
      capacity: 4
    });
    setShowModal(true);
  };

  // ✅ Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTable(prev => ({
      ...prev,
      [name]: name === 'number' || name === 'capacity' ? parseInt(value) : value
    }));
  };

  // ✅ Submit new table
  const handleAddTable = async () => {
    setAdding(true);
    try {
      const response = await axios.post('http://localhost:5000/api/tables', newTable);
      setTables(prev => [...prev, response.data]);
      setShowModal(false);
      setNewTable({ number: 0, section: "AC", capacity: 4 });
    } catch (error) {
      console.error('Add table error:', error);
      alert('Failed to add table: ' + (error.response?.data?.error || error.message));
    } finally {
      setAdding(false);
    }
  };

  const filteredTables = tables.filter(
    (table) => activeSection === "All" || table.section === activeSection
  );

  const handleStartSession = (table) => {
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
          onClick={openAddModal}  // ✅ Opens modal instead of directly adding
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
          const statusStyle = getStatusStyles(table.status);
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

      {/* ✅ ADD TABLE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Table</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Table Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number
                </label>
                <input
                  type="number"
                  name="number"
                  value={newTable.number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  name="section"
                  value={newTable.section}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity (persons)
                </label>
                <select
                  name="capacity"
                  value={newTable.capacity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2">2 persons</option>
                  <option value="4">4 persons</option>
                  <option value="6">6 persons</option>
                  <option value="8">8 persons</option>
                  <option value="10">10 persons</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTable}
                disabled={adding}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {adding ? 'Adding...' : 'Add Table'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablesPage;