import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import Button from "../../components/Button";
import Notification from "../../components/Notification";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Mock login for now — accepts any non-empty username/password.
      // Real backend will verify these against the Admin table and return a JWT.
      await login(username, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm border p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-3xl">🏨</span>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage tables and orders</p>
        </div>

        {error && (
          <div className="mb-4">
            <Notification type="error" message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            <LogIn size={16} />
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Mock login for now — any username/password works until the backend auth is wired up.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
