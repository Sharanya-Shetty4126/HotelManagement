function Navbar({ title, children }) {
  return (
    <nav>
      <h2>{title}</h2>

      <div>
        {children}
      </div>
    </nav>
  );
}

export default Navbar;