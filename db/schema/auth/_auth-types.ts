import { account, user, verification } from "./auth-schema";

export type User = typeof user.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;

export type ExportedUser = Pick<
    User,
    "id" | "name" | "email" | "image" | "createdAt"
>;
