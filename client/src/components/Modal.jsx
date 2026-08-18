function Modal({ title, children, onClose }) {
  return (
    <div>
      <div>
        <h2>{title}</h2>

        <button onClick={onClose}>
          ×
        </button>
      </div>

      <div>
        {children}
      </div>
    </div>
  );
}

export default Modal;