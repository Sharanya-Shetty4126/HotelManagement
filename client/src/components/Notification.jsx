const TYPE_STYLES = {
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50 text-red-800 border-red-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
};

function Notification({ type = "info", message }) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${TYPE_STYLES[type] || TYPE_STYLES.info}`}>
      {message}
    </div>
  );
}

export default Notification;
