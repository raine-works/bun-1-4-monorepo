export function App() {
  return (
    <div className="mx-auto max-w-4xl w-full flex flex-col gap-6 py-8 px-4">
      <header className="text-center mb-4">
        <span className="inline-block bg-sky-500/15 text-sky-400 border border-sky-500/30 font-mono text-xs font-semibold px-3 py-1 rounded-full mb-3">
          Docs MFE
        </span>
        <h1 className="text-4xl font-extrabold bg-linear-to-r from-white via-sky-400 to-emerald-400 bg-clip-text text-transparent mb-2">
          Documentation
        </h1>
        <p className="text-slate-400 text-sm md:text-base">Micro-frontend documentation module</p>
        <nav className="flex justify-center gap-3 mt-4">
          <a
            href="/"
            className="text-slate-400 hover:text-white hover:bg-white/5 border border-transparent font-semibold text-sm px-3 py-1.5 rounded-md transition-colors"
          >
            Hub
          </a>
          <a
            href="/store"
            className="text-slate-400 hover:text-white hover:bg-white/5 border border-transparent font-semibold text-sm px-3 py-1.5 rounded-md transition-colors"
          >
            Store
          </a>
          <a
            href="/docs"
            className="text-sky-400 bg-sky-500/10 border border-sky-500/30 font-semibold text-sm px-3 py-1.5 rounded-md transition-colors"
          >
            Docs
          </a>
        </nav>
      </header>
      <section className="mx-auto bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg text-slate-300">
        <p>Documentation micro-frontend content goes here.</p>
      </section>
    </div>
  );
}
