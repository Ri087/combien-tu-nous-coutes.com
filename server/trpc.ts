import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import { Context } from "./context";

// Initialize tRPC with metadata type support
const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

export const middleware = t.middleware;
export const createCallerFactory = t.createCallerFactory;

export const router = t.router;
export const procedure = t.procedure;
