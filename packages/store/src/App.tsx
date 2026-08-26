export function App() {
  return (
    <div className="container">
      <header>
        <span className="badge">Store MFE</span>
        <h1>Store</h1>
        <p className="subtitle">Micro-frontend store module</p>
        <nav className="nav-bar">
          <a href="/" className="nav-link">
            Hub
          </a>
          <a href="/store" className="nav-link active">
            Store
          </a>
          <a href="/docs" className="nav-link">
            Docs
          </a>
        </nav>
      </header>
      <section className="card">
        <p>Store micro-frontend content goes here.</p>
      </section>
    </div>
  );
}
