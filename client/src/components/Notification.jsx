function Notification({ type, message }) {
  return (
    <div>
      <strong>{type}</strong>
      <p>{message}</p>
    </div>
  );
}

export default Notification;