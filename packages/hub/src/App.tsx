import { useEffect, useState } from "react";

interface ServerInfo {
  name: string;
  bunVersion: string;
  platform: string;
  arch: string;
  uptime: number;
}

interface Item {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

/**
 * Main application component for the Hub frontend.
 * Demonstrates:
 * - Direct REST API integration with Bun backend (`/api/health`, `/api/info`, `/api/items`).
 * - Native React Compiler automatic memoization (zero manual `useCallback`/`useMemo`).
 * - Micro-frontend cross-navigation between `/`, `/store`, and `/docs`.
 */
export function App() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>("connecting...");
  const [items, setItems] = useState<Item[]>([]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [counter, setCounter] = useState(0);
  const [unrelatedState, setUnrelatedState] = useState(0);

  // Fetch backend data
  useEffect(() => {
    async function loadData() {
      try {
        const [healthRes, infoRes, itemsRes] = await Promise.all([
          fetch("/api/health"),
          fetch("/api/info"),
          fetch("/api/items"),
        ]);

        if (healthRes.ok) {
          const healthData = (await healthRes.json()) as { status: string };
          setHealthStatus(healthData.status);
        }
        if (infoRes.ok) {
          const infoData = (await infoRes.json()) as ServerInfo;
          setServerInfo(infoData);
        }
        if (itemsRes.ok) {
          const itemsData = (await itemsRes.json()) as { items: Item[] };
          setItems(itemsData.items);
        }
      } catch (err) {
        console.error("Backend connection error:", err);
        setHealthStatus("offline");
      }
    }
    loadData();
  }, []);

  // Add Item handler (no manual useCallback needed thanks to React Compiler!)
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newItemTitle.trim() }),
      });
      if (res.ok) {
        const created = (await res.json()) as Item;
        setItems((prev) => [...prev, created]);
        setNewItemTitle("");
      }
    } catch (err) {
      console.error("Failed to add item:", err);
    }
  };

  // Toggle Item completion
  const handleToggleItem = async (id: string, currentCompleted: boolean) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      if (res.ok) {
        const updated = (await res.json()) as Item;
        setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      }
    } catch (err) {
      console.error("Failed to toggle item:", err);
    }
  };

  // Delete Item
  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  // Heavy computation without manual useMemo: React Compiler caches this automatically!
  const fibValue = calculateFib(Math.min(counter + 20, 35));

  return (
    <div className="mx-auto max-w-4xl w-full flex flex-col gap-6 py-8 px-4">
      <header className="text-center mb-4">
        <span className="inline-block bg-pink-500/15 text-pink-400 border border-pink-500/30 font-mono text-xs font-semibold px-3 py-1 rounded-full mb-3">
          Bun v1.4 + React 19 Monorepo
        </span>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-pink-400 to-sky-400 bg-clip-text text-transparent mb-2">
          Minimal Full-Stack Workspace
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Powered by Bun 1.4 Native Bundler, Built-in React Compiler, and Parallel Scripts
        </p>
        <nav className="flex justify-center gap-3 mt-4">
          <a
            href="/"
            className="text-pink-400 bg-pink-500/10 border border-pink-500/30 font-semibold text-sm px-3 py-1.5 rounded-md transition-colors"
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
            className="text-slate-400 hover:text-white hover:bg-white/5 border border-transparent font-semibold text-sm px-3 py-1.5 rounded-md transition-colors"
          >
            Docs
          </a>
        </nav>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Backend Info Card */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            ⚡ Backend Server Status
          </h2>
          <div className="flex justify-between py-2 border-b border-white/5 text-sm">
            <span className="text-slate-400">API Health:</span>
            <span className="font-mono text-emerald-400 font-semibold">{healthStatus}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5 text-sm">
            <span className="text-slate-400">Bun Runtime:</span>
            <span className="font-mono text-sky-400">{serverInfo?.bunVersion || "1.4.0"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5 text-sm">
            <span className="text-slate-400">Platform / Arch:</span>
            <span className="font-mono text-sky-400">
              {serverInfo ? `${serverInfo.platform} (${serverInfo.arch})` : "loading..."}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5 text-sm">
            <span className="text-slate-400">Server Package:</span>
            <span className="font-mono text-sky-400">{serverInfo?.name || "@app/backend"}</span>
          </div>
        </section>

        {/* React Compiler Feature Card */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            ⚛️ Built-in React Compiler
          </h2>
          <div className="bg-sky-500/5 border border-dashed border-sky-400/50 p-3.5 rounded-lg text-xs md:text-sm leading-relaxed text-slate-300">
            Automatic auto-memoization enabled via{" "}
            <code className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-sky-300">
              Bun.build(&#123; reactCompiler: true &#125;)
            </code>
            . Zero Babel/SWC plugins required!
          </div>
          <div className="flex justify-between py-2 border-b border-white/5 text-sm">
            <span className="text-slate-400">Fibonacci(20 + {counter}):</span>
            <span className="font-mono text-sky-400">{fibValue}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-pink-400 hover:bg-pink-500 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-transform active:scale-95 cursor-pointer"
              onClick={() => setCounter((c) => c + 1)}
            >
              Increment Target (+1)
            </button>
            <button
              type="button"
              className="bg-sky-400 hover:bg-sky-500 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-transform active:scale-95 cursor-pointer"
              onClick={() => setUnrelatedState((s) => s + 1)}
            >
              Re-render Component ({unrelatedState})
            </button>
          </div>
        </section>
      </div>

      {/* Backend Integration Todo Card */}
      <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-white">
          📋 Monorepo Tasks &amp; API Integration
        </h2>
        <form onSubmit={handleAddItem} className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-[#0d1117] border border-[#30363d] text-[#e6edf3] placeholder:text-slate-500 px-3.5 py-2 rounded-lg text-sm focus:outline-none focus:border-sky-400"
            placeholder="Add new task for backend..."
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
          />
          <button
            type="submit"
            className="bg-pink-400 hover:bg-pink-500 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-transform active:scale-95 cursor-pointer"
          >
            Add Task
          </button>
        </form>

        <ul className="flex flex-col gap-2 list-none p-0 m-0">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between bg-white/[0.02] border border-[#30363d] px-3.5 py-2.5 rounded-lg text-sm"
            >
              <span
                className={`flex items-center gap-2.5 cursor-pointer select-none ${
                  item.completed ? "line-through text-slate-500" : "text-slate-200"
                }`}
                onClick={() => handleToggleItem(item.id, item.completed)}
              >
                <input
                  type="checkbox"
                  className="accent-pink-500 rounded cursor-pointer"
                  checked={item.completed}
                  onChange={() => handleToggleItem(item.id, item.completed)}
                />
                {item.title}
              </span>
              <button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2.5 py-1 rounded transition-colors cursor-pointer"
                onClick={() => handleDeleteItem(item.id)}
                aria-label={`Delete ${item.title}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/**
 * Computes the nth Fibonacci number iteratively to demonstrate CPU work caching via React Compiler.
 *
 * @param n - The Fibonacci index to calculate.
 * @returns The nth Fibonacci number.
 */
function calculateFib(n: number): number {
  if (n <= 1) return n;
  let a = 0,
    b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}
