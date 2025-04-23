import { db } from "@/db";
import { getServerSession } from "@/lib/auth/utils";

export const createContext = async () => {
    const session = await getServerSession();

    const ctx = {
        session,
        db,
    };

    return ctx;
};

export type Context = typeof createContext;
