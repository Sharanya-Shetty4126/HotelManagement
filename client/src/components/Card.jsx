function Card({ children, onClick, className = "" }) {
  const clickable = typeof onClick === "function";
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 ${
        clickable ? "cursor-pointer hover:shadow-md hover:border-gray-200 transition-shadow" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
