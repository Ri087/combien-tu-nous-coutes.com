import { relations } from "drizzle-orm";

import { accessList, account, subscription, user } from "./auth-schema";

export const userRelations = relations(user, ({ many, one }) => ({
    accounts: many(account),
    accessStatus: one(accessList, {
        fields: [user.email],
        references: [accessList.email],
    }),
    subscription: one(subscription, {
        fields: [user.id],
        references: [subscription.referenceId],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export const accessListRelations = relations(accessList, ({ one }) => ({
    user: one(user, {
        fields: [accessList.userId],
        references: [user.id],
    }),
    addedByUser: one(user, {
        fields: [accessList.addedBy],
        references: [user.id],
    }),
}));
