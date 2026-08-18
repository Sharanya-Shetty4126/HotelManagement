import { TABLE_STATUS_STYLES } from "../utils/format";

function TableStatus({ status }) {
  const style = TABLE_STATUS_STYLES[status] || TABLE_STATUS_STYLES.available;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export default TableStatus;
