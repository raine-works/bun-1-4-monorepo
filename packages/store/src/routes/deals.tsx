import { Link } from "@tanstack/react-router";

export function StoreDealsPage() {
  const DEALS = [
    { code: "BUN14FAST", discount: "20% OFF", desc: "Bun 1.4 Launch Special" },
    { code: "REACT19MEMO", discount: "15% OFF", desc: "React Compiler Celebration" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              ⚡ Flash Deals &amp; Coupons
            </h2>
            <p className="text-xs text-slate-400">
              TanStack Router route:{" "}
              <code className="text-emerald-300 font-mono">/store/deals</code>
            </p>
          </div>
          <Link to="/" className="text-xs text-sky-400 hover:underline">
            &larr; Back to Catalog
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEALS.map((deal) => (
            <div
              key={deal.code}
              className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3.5 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-white block">{deal.desc}</span>
                <span className="text-[11px] text-emerald-400 font-mono font-bold mt-0.5 block">
                  {deal.discount}
                </span>
              </div>
              <code className="font-mono bg-white/5 text-slate-300 border border-white/10 px-2 py-1 rounded text-xs">
                {deal.code}
              </code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
