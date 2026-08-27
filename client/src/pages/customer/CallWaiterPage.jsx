import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function CallWaiterPage() {
  const { sessionId } = useParams();
  const [selected, setSelected] = useState(null);

  const requestTypes = [
    { id: 'WATER', label: '💧 Water' },
    { id: 'CUTLERY', label: '🍴 Cutlery' },
    { id: 'NAPKINS', label: '🧻 Tissue Paper' },
    { id: 'EXTRA_PLATES', label: '🍽️ Extra Plates' },
    { id: 'COMPLAINT', label: '📝 Complaint' },
    { id: 'ASSISTANCE', label: '👋 Assistance' },
  ];

  const handleCallWaiter = (type) => {
    setSelected(type.id);
    alert(`Request sent to waiter: ${type.label}`);
    setTimeout(() => setSelected(null), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Call Waiter</h1>
      <p className="text-gray-600 mb-6">Session: {sessionId}</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {requestTypes.map(type => (
          <button
            key={type.id}
            onClick={() => handleCallWaiter(type)}
            className={`p-6 bg-white border rounded-xl hover:shadow-md transition-all text-center ${
              selected === type.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="text-3xl mb-2">{type.label.split(' ')[0]}</div>
            <div className="text-sm font-medium">{type.label}</div>
          </button>
        ))}
      </div>
      
      {selected && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-700 font-medium">✅ Waiter has been notified!</p>
        </div>
      )}
    </div>
  );
}