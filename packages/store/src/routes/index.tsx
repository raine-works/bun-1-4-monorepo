import { Link } from "@tanstack/react-router";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
}

const PRODUCTS: Product[] = [
  { id: "p1", name: "Bun 1.4 Native Hoodie", price: 49.99 },
  { id: "p2", name: "React 19 Compiler Mug", price: 18.5 },
  { id: "p3", name: "TanStack Router Sticker Pack", price: 8.0 },
];

export function StoreCatalogPage() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              🛍️ Store Catalog
            </h2>
            <p className="text-xs text-slate-300">
              Micro-frontend e-commerce module with scoped basepath{" "}
              <code className="text-emerald-300 font-mono">/store</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-mono font-semibold">
              Cart: {cartCount}
            </span>
            <Link
              to="/cart"
              aria-label="View shopping cart"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-colors min-h-[36px] inline-flex items-center"
            >
              View Cart &rarr;
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3.5 flex flex-col justify-between gap-3"
            >
              <div>
                <h3 className="text-xs font-bold text-white">{prod.name}</h3>
                <span className="text-xs font-mono font-bold text-emerald-300 mt-1 block">
                  ${prod.price.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                aria-label={`Add ${prod.name} to cart`}
                onClick={() => setCartCount((c) => c + 1)}
                className="bg-white/10 hover:bg-white/15 text-slate-100 font-medium py-2 px-3 rounded-md text-xs transition-colors min-h-[36px]"
              >
                + Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
