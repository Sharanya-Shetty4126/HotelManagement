import Card from "./Card";
import TableStatus from "./TableStatus";

function TableCard({ tableNumber, status, onClick }) {
  return (
    <Card onClick={onClick}>
      <h3>Table {tableNumber}</h3>

      <TableStatus status={status} />
    </Card>
  );
}

export default TableCard;