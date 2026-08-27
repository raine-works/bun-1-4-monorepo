import type { Item } from '@app/data';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { client } from '@/lib/api';

export function TasksPage() {
	const [items, setItems] = useState<Item[]>([]);
	const [title, setTitle] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadTasks() {
			try {
				const res = await client.api.items.$get();
				if (res.ok) {
					const data = await res.json();
					setItems(data.items);
				}
			} catch (err) {
				console.error('Failed to load tasks via Hono RPC:', err);
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
			const res = await client.api.items.$post({
				json: { title: title.trim() },
			});
			if (res.ok) {
				const created = (await res.json()) as Item;
				setItems((prev) => [...prev, created]);
				setTitle('');
			}
		} catch (err) {
			console.error('Failed to add task via Hono RPC:', err);
		}
	};

	const handleToggle = async (item: Item) => {
		try {
			const res = await client.api.items[':id'].$patch({
				param: { id: item.id },
				json: { completed: !item.completed },
			});
			if (res.ok) {
				const updated = (await res.json()) as Item;
				setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
			}
		} catch (err) {
			console.error('Failed to toggle task via Hono RPC:', err);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const res = await client.api.items[':id'].$delete({
				param: { id },
			});
			if (res.ok) {
				setItems((prev) => prev.filter((i) => i.id !== id));
			}
		} catch (err) {
			console.error('Failed to delete task via Hono RPC:', err);
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg flex flex-col gap-4">
				<div className="flex items-center justify-between border-b border-white/5 pb-3">
					<div>
						<h2 className="text-base font-bold text-white flex items-center gap-2">📋 Tasks Manager</h2>
						<p className="text-xs text-slate-300">
							Live Hono RPC client integration (<code className="text-pink-300 font-mono">/api/items</code>)
						</p>
					</div>
					<Link
						to="/"
						aria-label="Back to Dashboard"
						className="text-xs text-sky-300 hover:text-sky-200 hover:underline min-h-9 inline-flex items-center"
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
						className="flex-1 bg-[#0d1117] border border-[#30363d] text-[#e6edf3] placeholder:text-slate-400 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-sky-400 min-h-9"
						placeholder="Add new task..."
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<button
						type="submit"
						aria-label="Add new task"
						className="bg-pink-500 hover:bg-pink-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-colors min-h-9"
					>
						Add Task
					</button>
				</form>

				{loading ? (
					<div className="text-xs text-slate-400 py-4 text-center">Loading tasks via Hono RPC from backend...</div>
				) : (
					<ul className="flex flex-col gap-2 list-none p-0 m-0">
						{items.map((item) => (
							<li
								key={item.id}
								className="flex items-center justify-between bg-white/2 border border-[#30363d] px-3 py-2 rounded-lg text-xs gap-2"
							>
								<button
									type="button"
									onClick={() => handleToggle(item)}
									className="flex-1 text-left bg-transparent border-0 p-0 cursor-pointer flex items-center gap-2"
								>
									<span
										className={`inline-block w-3.5 h-3.5 rounded border ${
											item.completed
												? 'bg-emerald-500 border-emerald-400 text-slate-950 flex items-center justify-center font-bold text-[10px]'
												: 'border-slate-500'
										}`}
									>
										{item.completed ? '✓' : ''}
									</span>
									<span className={item.completed ? 'line-through text-slate-400' : 'text-slate-200'}>
										{item.title}
									</span>
								</button>
								<div className="flex items-center gap-2">
									<span className="text-[11px] font-mono text-slate-400">#{item.id.slice(0, 4)}</span>
									<button
										type="button"
										onClick={() => handleDelete(item.id)}
										aria-label={`Delete task ${item.title}`}
										className="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-1.5 py-0.5 rounded text-[10px] transition-colors"
									>
										×
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
