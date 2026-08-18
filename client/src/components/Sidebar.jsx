function Sidebar({ children }) {
  return (
    <aside>
      <h2>Restaurant Admin</h2>

      <nav>
        {children}
      </nav>
    </aside>
  );
}

export default Sidebar;