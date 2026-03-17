import { z } from "zod";
import { router, publicProcedure } from "./trpc";

// In-memory todo store (resets on worker restart)
interface Todo {
	id: string;
	text: string;
	completed: boolean;
}

let todos: Todo[] = [
	{ id: "1", text: "Learn tRPC", completed: false },
	{ id: "2", text: "Build something awesome", completed: false },
];

const greetingRouter = router({
	hello: publicProcedure
		.input(z.object({ name: z.string().min(1) }))
		.query(({ input }) => {
			return { greeting: `Hello, ${input.name}! 👋` };
		}),
});

const todoRouter = router({
	list: publicProcedure.query(() => {
		return todos;
	}),

	add: publicProcedure
		.input(z.object({ text: z.string().min(1) }))
		.mutation(({ input }) => {
			const todo: Todo = {
				id: crypto.randomUUID(),
				text: input.text,
				completed: false,
			};
			todos.push(todo);
			return todo;
		}),

	toggle: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ input }) => {
			const todo = todos.find((t) => t.id === input.id);
			if (!todo) throw new Error("Todo not found");
			todo.completed = !todo.completed;
			return todo;
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ input }) => {
			todos = todos.filter((t) => t.id !== input.id);
			return { success: true };
		}),
});

export const appRouter = router({
	greeting: greetingRouter,
	todo: todoRouter,
});

export type AppRouter = typeof appRouter;
