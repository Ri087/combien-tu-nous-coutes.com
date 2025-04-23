import { createContext } from "@/server/context";
import { createCallerFactory, router } from "@/server/trpc";

export const appRouter = router({});

export const createCaller = createCallerFactory(appRouter)(createContext);

export type AppRouter = typeof appRouter;
