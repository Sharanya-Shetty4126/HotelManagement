import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getSessionById } from "../../services/api";

export default function CustomerLayout({ children }) {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <div>
              <span className="font-bold text-gray-900">
                {tableNumber ? `Table ${tableNumber}` : "Loading..."}
              </span>
              {sessionCode && (
                <span className="ml-3 text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                  🔑 {sessionCode}
                </span>
              )}
            </div>
          </div>

          {/* ✅ ADD MENU LINK BACK */}
          <div className="flex items-center gap-4">
            <Link
              to={`/session/${sessionId}/menu`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Menu
            </Link>
            <Link
              to={`/session/${sessionId}/orders`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Orders
            </Link>
            <Link
              to={`/session/${sessionId}/bill`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Bill
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}