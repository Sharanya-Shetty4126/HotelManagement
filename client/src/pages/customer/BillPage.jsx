import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Receipt } from "lucide-react";
import { getSessionByToken } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import BillSummary from "../../components/BillSummary";
import Button from "../../components/Button";

function BillPage() {
  const { token } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    getSessionByToken(token).then((data) => {
      setSession(data);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <LoadingSpinner label="Preparing your bill..." />;

  const allItems = session?.orders.flatMap((o) => o.items) || [];

  if (allItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt size={48} className="mx-auto text-gray-300 mb-3" />
        <h2 className="text-lg font-semibold text-gray-700">Nothing to bill yet</h2>
        <p className="text-gray-500 mt-1">Place an order first — your bill will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Your Bill</h1>
      <BillSummary items={allItems} status={requested ? "REQUESTED" : "UNPAID"} />
      {!requested ? (
        <Button className="w-full mt-4" onClick={() => setRequested(true)}>
          Request bill from staff
        </Button>
      ) : (
        <p className="text-sm text-center text-gray-500 mt-4">
          Staff has been notified. Please pay at the counter — cash/card only for now.
        </p>
      )}
    </div>
  );
}

export default BillPage;
