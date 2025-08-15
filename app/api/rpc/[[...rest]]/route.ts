import { RPCHandler } from "@orpc/server/fetch";
import {
  BatchHandlerPlugin,
  StrictGetMethodPlugin,
} from "@orpc/server/plugins";
import { db } from "@/db";
import { appRouter } from "@/server/routers/_app";

const handler = new RPCHandler(appRouter, {
  plugins: [new StrictGetMethodPlugin(), new BatchHandlerPlugin()],
});

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: {
      headers: request.headers,
      db,
    },
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
