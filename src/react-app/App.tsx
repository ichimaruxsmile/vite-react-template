import { useState } from "react";
import { trpc } from "./trpc";
import "./App.css";

function App() {
	const [name, setName] = useState("World");
	const [newTodo, setNewTodo] = useState("");

	const greeting = trpc.greeting.hello.useQuery(
		{ name },
		{ enabled: name.length > 0 },
	);
	const todos = trpc.todo.list.useQuery();
	const utils = trpc.useUtils();

	const addTodo = trpc.todo.add.useMutation({
		onSuccess: () => {
			utils.todo.list.invalidate();
			setNewTodo("");
		},
	});

	const toggleTodo = trpc.todo.toggle.useMutation({
		onSuccess: () => utils.todo.list.invalidate(),
	});

	const deleteTodo = trpc.todo.delete.useMutation({
		onSuccess: () => utils.todo.list.invalidate(),
	});

	return (
		<div className="container">
			<h1>⚡ tRPC Demo</h1>
			<p className="subtitle">
				End-to-end type-safe APIs with Hono + Cloudflare Workers
			</p>

			{/* Greeting Section */}
			<section className="card">
				<h2>👋 Greeting</h2>
				<div className="input-row">
					<input
						id="greeting-input"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Enter your name..."
					/>
				</div>
				<p className="greeting-result">
					{greeting.isLoading
						? "Loading..."
						: greeting.data?.greeting ?? "Type a name above"}
				</p>
			</section>

			{/* Todo Section */}
			<section className="card">
				<h2>📝 Todo List</h2>
				<form
					className="input-row"
					onSubmit={(e) => {
						e.preventDefault();
						if (newTodo.trim()) {
							addTodo.mutate({ text: newTodo.trim() });
						}
					}}
				>
					<input
						id="todo-input"
						type="text"
						value={newTodo}
						onChange={(e) => setNewTodo(e.target.value)}
						placeholder="What needs to be done?"
					/>
					<button
						id="add-todo-btn"
						type="submit"
						disabled={addTodo.isPending || !newTodo.trim()}
					>
						{addTodo.isPending ? "Adding..." : "Add"}
					</button>
				</form>

				{todos.isLoading && <p className="loading">Loading todos...</p>}

				<ul className="todo-list">
					{todos.data?.map((todo) => (
						<li key={todo.id} className={todo.completed ? "completed" : ""}>
							<label className="todo-label">
								<input
									type="checkbox"
									checked={todo.completed}
									onChange={() => toggleTodo.mutate({ id: todo.id })}
								/>
								<span>{todo.text}</span>
							</label>
							<button
								className="delete-btn"
								onClick={() => deleteTodo.mutate({ id: todo.id })}
								aria-label={`Delete ${todo.text}`}
							>
								✕
							</button>
						</li>
					))}
				</ul>

				{todos.data?.length === 0 && (
					<p className="empty-state">No todos yet. Add one above!</p>
				)}
			</section>

			<footer className="footer">
				<p>
					Powered by <strong>tRPC</strong> + <strong>Hono</strong> +{" "}
					<strong>React</strong> + <strong>Cloudflare Workers</strong>
				</p>
			</footer>
		</div>
	);
}

export default App;
