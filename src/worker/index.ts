import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/router";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.use("/trpc/*", trpcServer({ router: appRouter }));

export default app;
