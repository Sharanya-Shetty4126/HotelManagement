import Card from "./Card";
import TableStatus from "./TableStatus";
import { Users } from "lucide-react";

function TableCard({ table, onClick }) {
  return (
    <Card onClick={onClick}>
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-gray-900">Table {table.number}</h3>
        <TableStatus status={table.status} />
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
        <Users size={14} />
        <span>{table.capacity} seats · {table.section}</span>
      </div>
      {table.sessionId && (
        <p className="text-xs text-gray-400 mt-1">Session {table.sessionId}</p>
      )}
    </Card>
  );
}

export default TableCard;
