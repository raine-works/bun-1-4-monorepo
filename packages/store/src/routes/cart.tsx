import { Link } from "@tanstack/react-router";

export function StoreCartPage() {
  return (
    <div className="flex flex-col gap-4">
      <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              🛒 Shopping Cart &amp; Checkout
            </h2>
            <p className="text-xs text-slate-400">
              TanStack Router route: <code className="text-emerald-300 font-mono">/store/cart</code>
            </p>
          </div>
          <Link to="/" className="text-xs text-sky-400 hover:underline">
            &larr; Back to Catalog
          </Link>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 flex flex-col gap-3 text-xs">
          <div className="flex justify-between items-center text-slate-300 border-b border-white/5 pb-2">
            <span>Bun 1.4 Native Hoodie (Size L) x 1</span>
            <span className="font-mono text-emerald-400 font-semibold">$49.99</span>
          </div>
          <div className="flex justify-between items-center text-slate-300 border-b border-white/5 pb-2">
            <span>React 19 Compiler Mug x 1</span>
            <span className="font-mono text-emerald-400 font-semibold">$18.50</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Estimated Tax (8%)</span>
            <span className="font-mono text-slate-300">$5.48</span>
          </div>
          <div className="flex justify-between items-center font-bold text-white pt-1 text-sm">
            <span>Total</span>
            <span className="font-mono text-emerald-400">$73.97</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Link
            to="/"
            className="bg-white/10 hover:bg-white/15 text-slate-300 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            Continue Shopping
          </Link>
          <button
            type="button"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors"
          >
            Checkout Demo
          </button>
        </div>
      </section>
    </div>
  );
}
