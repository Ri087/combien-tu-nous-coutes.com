import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { BatchLinkPlugin, DedupeRequestsPlugin } from "@orpc/client/plugins";
import type {
  InferRouterInputs,
  InferRouterOutputs,
  RouterClient,
} from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { appRouter } from "@/server/routers/_app";

declare global {
  var $client: RouterClient<typeof appRouter> | undefined;
}

const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined") {
      throw new Error("RPCLink is not allowed on the server side.");
    }
    return `${window.location.origin}/api/rpc`;
  },
  plugins: [
    new DedupeRequestsPlugin({
      filter: ({ request }) => request.method === "GET",
      groups: [
        {
          condition: () => true,
          context: {},
        },
      ],
    }),
    new BatchLinkPlugin({
      groups: [
        {
          condition: () => true,
          context: {},
        },
      ],
    }),
  ],
});

/**
 * Fallback to client-side client if server-side client is not available.
 */
export const orpcClient: RouterClient<typeof appRouter> =
  globalThis.$client ?? createORPCClient(link);

export type RouterInput = InferRouterInputs<typeof appRouter>;
export type RouterOutput = InferRouterOutputs<typeof appRouter>;

export const orpc = createTanstackQueryUtils(orpcClient);
