// client/src/pages/customer/SessionEntry.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionEntry, createSession, joinSession } from '../../services/api';

export default function SessionEntry() {
  const { qrToken } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [table, setTable] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await getSessionEntry(qrToken);
      setTable(data.table);
      setActiveSessions(data.activeSessions || []);
    } catch (err) {
      console.error('SessionEntry error:', err);

      // ✅ Distinguish between network errors and actual invalid QR
      if (!err.response) {
        setError('Cannot reach the server. Check your network or backend URL.');
      } else if (err.response.status === 400) {
        setError('Invalid QR code. Please scan again.');
      } else if (err.response.status === 404) {
        setError('Table not found. Please contact staff.');
      } else {
        setError(err.response.data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [qrToken]);
  const handleCreateSession = async () => {
    setCreating(true);
    setError('');
    try {
      const response = await createSession(qrToken, 1);
      // ✅ Show the code on the next screen (SessionCreated component)
      navigate(`/session/${response.sessionId}/menu`, { 
        state: { sessionCode: response.sessionCode, newSession: true } 
      });
    } catch (err) {
      setError('Failed to create session. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinSession = async () => {
    if (!joinCode) return;
    setJoining(true);
    setError('');
    try {
      const response = await joinSession(qrToken, joinCode);
      navigate(`/session/${response.sessionId}/menu`);
    } catch (err) {
      setError('Invalid session code. Please try again.');
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasActiveSessions = activeSessions.length > 0;

  return (
    <div className="max-w-md mx-auto p-6">
      {/* Table Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 text-center">
        <h1 className="text-2xl font-bold">Table {table?.number}</h1>
        <p className="text-gray-600">{table?.section} · Capacity: {table?.capacity} persons</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* ✅ ALWAYS: Start New Session */}
      <button
        onClick={handleCreateSession}
        disabled={creating}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {creating ? 'Creating...' : 'Start New Session'}
      </button>

      {/* ✅ ONLY IF: Active sessions exist → Show "Join Existing Session" */}
      {hasActiveSessions && (
        <div className="mt-4">
          {!showJoinInput ? (
            <button
              onClick={() => setShowJoinInput(true)}
              className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Join Existing Session
            </button>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-700 mb-2">
                Enter the session code <span className="font-semibold">(shown on your friend's phone)</span>:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., AB7X3"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 5))}
                  className="flex-1 border p-2 rounded-lg uppercase text-center text-xl font-bold tracking-widest"
                  maxLength="5"
                  autoFocus
                />
                <button
                  onClick={handleJoinSession}
                  disabled={!joinCode || joining}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {joining ? 'Joining...' : 'Join'}
                </button>
              </div>
              <button
                onClick={() => {
                  setShowJoinInput(false);
                  setJoinCode('');
                  setError('');
                }}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}