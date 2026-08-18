function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
