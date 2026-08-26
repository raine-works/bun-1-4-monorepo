import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface Item {
  id: string;
  title: string;
  completed: boolean;
}

export function TasksPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch("/api/items");
        if (res.ok) {
          const data = (await res.json()) as { items: Item[] };
          setItems(data.items);
        }
      } catch (err) {
        console.error("Failed to load tasks:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (res.ok) {
        const created = (await res.json()) as Item;
        setItems((prev) => [...prev, created]);
        setTitle("");
      }
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              📋 Tasks Manager
            </h2>
            <p className="text-xs text-slate-300">
              Live REST API integration (<code className="text-pink-300 font-mono">/api/items</code>
              )
            </p>
          </div>
          <Link
            to="/"
            aria-label="Back to Dashboard"
            className="text-xs text-sky-300 hover:text-sky-200 hover:underline min-h-[36px] inline-flex items-center"
          >
            &larr; Back to Dashboard
          </Link>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2">
          <label htmlFor="task-title" className="sr-only">
            New task title
          </label>
          <input
            id="task-title"
            type="text"
            aria-label="New task title"
            className="flex-1 bg-[#0d1117] border border-[#30363d] text-[#e6edf3] placeholder:text-slate-400 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-sky-400 min-h-[36px]"
            placeholder="Add new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            type="submit"
            aria-label="Add new task"
            className="bg-pink-500 hover:bg-pink-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-colors min-h-[36px]"
          >
            Add Task
          </button>
        </form>

        {loading ? (
          <div className="text-xs text-slate-400 py-4 text-center">
            Loading tasks from backend...
          </div>
        ) : (
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between bg-white/[0.02] border border-[#30363d] px-3 py-2 rounded-lg text-xs"
              >
                <span className={item.completed ? "line-through text-slate-400" : "text-slate-200"}>
                  {item.title}
                </span>
                <span className="text-[11px] font-mono text-slate-400">#{item.id.slice(0, 4)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
