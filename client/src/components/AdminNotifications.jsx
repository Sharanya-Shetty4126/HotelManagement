import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    socket.emit('join-admin');

    socket.on('order-notification', (data) => {
      setNotifications(prev => [...prev, { ...data, type: 'order' }]);
      // Play sound
      const audio = new Audio('/sounds/order-received.mp3');
      audio.play();
    });

    socket.on('bill-notification', (data) => {
      setNotifications(prev => [...prev, { ...data, type: 'bill' }]);
      const audio = new Audio('/sounds/bill-requested.mp3');
      audio.play();
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="relative">
      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {notifications.length}
        </span>
      )}
    </div>
  );
}