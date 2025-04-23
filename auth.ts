import { db } from "@/db";
import redis from "@/lib/redis";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    secondaryStorage: {
        get: async (key) => await redis.get(key),
        set: async (key, value, ttl) => {
            if (ttl)
                await redis.set(key, value, {
                    ex: ttl,
                });
            else await redis.set(key, value);
        },
        delete: async (key) => {
            await redis.del(key);
            return;
        },
    },
});
