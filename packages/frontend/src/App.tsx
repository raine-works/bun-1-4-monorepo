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
    <div className="container">
      <header>
        <span className="badge">Bun v1.4 + React 19 Monorepo</span>
        <h1>Minimal Full-Stack Workspace</h1>
        <p className="subtitle">
          Powered by Bun 1.4 Native Bundler, Built-in React Compiler, and Parallel Scripts
        </p>
      </header>

      <div className="grid">
        {/* Backend Info Card */}
        <section className="card">
          <h2>⚡ Backend Server Status</h2>
          <div className="status-row">
            <span className="status-label">API Health:</span>
            <span className="status-value tag-success">{healthStatus}</span>
          </div>
          <div className="status-row">
            <span className="status-label">Bun Runtime:</span>
            <span className="status-value">{serverInfo?.bunVersion || "1.4.0"}</span>
          </div>
          <div className="status-row">
            <span className="status-label">Platform / Arch:</span>
            <span className="status-value">
              {serverInfo ? `${serverInfo.platform} (${serverInfo.arch})` : "loading..."}
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">Server Package:</span>
            <span className="status-value">{serverInfo?.name || "@app/backend"}</span>
          </div>
        </section>

        {/* React Compiler Feature Card */}
        <section className="card">
          <h2>⚛️ Built-in React Compiler</h2>
          <div className="compiler-box">
            Automatic auto-memoization enabled via{" "}
            <code>Bun.build(&#123; reactCompiler: true &#125;)</code>. Zero Babel/SWC plugins
            required!
          </div>
          <div className="status-row">
            <span className="status-label">Fibonacci(20 + {counter}):</span>
            <span className="status-value">{fibValue}</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn" onClick={() => setCounter((c) => c + 1)}>
              Increment Target (+1)
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: "#38bdf8" }}
              onClick={() => setUnrelatedState((s) => s + 1)}
            >
              Re-render Component ({unrelatedState})
            </button>
          </div>
        </section>
      </div>

      {/* Backend Integration Todo Card */}
      <section className="card">
        <h2>📋 Monorepo Tasks &amp; API Integration</h2>
        <form onSubmit={handleAddItem} className="input-row">
          <input
            type="text"
            className="input"
            placeholder="Add new task for backend..."
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
          />
          <button type="submit" className="btn">
            Add Task
          </button>
        </form>

        <ul className="item-list">
          {items.map((item) => (
            <li key={item.id} className="item-row">
              <span
                className={`item-title ${item.completed ? "completed" : ""}`}
                onClick={() => handleToggleItem(item.id, item.completed)}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggleItem(item.id, item.completed)}
                />
                {item.title}
              </span>
              <button
                type="button"
                className="btn btn-danger"
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

// Helper calculation
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
