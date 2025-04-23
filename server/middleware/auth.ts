import { TRPCError } from "@trpc/server";

import { middleware } from "../trpc";

export const authMiddleware = middleware(async ({ ctx, next }) => {
    // Check if user is authenticated
    if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
        ctx: {
            session: ctx.session,
        },
    });
});
