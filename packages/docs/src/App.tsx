export function App() {
  return (
    <div className="container">
      <header>
        <span className="badge">Docs MFE</span>
        <h1>Documentation</h1>
        <p className="subtitle">Micro-frontend documentation module</p>
        <nav className="nav-bar">
          <a href="/" className="nav-link">
            Hub
          </a>
          <a href="/store" className="nav-link">
            Store
          </a>
          <a href="/docs" className="nav-link active">
            Docs
          </a>
        </nav>
      </header>
      <section className="card">
        <p>Documentation micro-frontend content goes here.</p>
      </section>
    </div>
  );
}
