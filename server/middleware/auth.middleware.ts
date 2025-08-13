import { ORPCError } from "@orpc/server";
import { getServerSession } from "@/lib/auth/utils";
import { base } from "../context";

export const authMiddleware = base.middleware(async (opts) => {
  const { next } = opts;

  const session = await getServerSession();

  if (!session) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({ context: { session } });
});
