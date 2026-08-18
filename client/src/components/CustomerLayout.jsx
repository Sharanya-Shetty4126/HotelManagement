import Navbar from "./Navbar";

function CustomerLayout({ children }) {
  return (
    <div>
      <Navbar title="Restaurant" />

      <main>
        {children}
      </main>
    </div>
  );
}

export default CustomerLayout;