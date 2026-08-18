import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";

function AdminLayout({ children }) {
  return (
    <div>
      <Navbar title="Restaurant Admin" />

      <div>
        <Sidebar>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/tables">Tables</Link>
          <Link to="/admin/orders">Orders</Link>
        </Sidebar>

        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;