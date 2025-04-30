import { render } from "@react-email/components";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins/email-otp";

import { PROJECT } from "@/constants/project";
import { db } from "@/db";
import VerifyEmailTemplate from "@/emails/verify-email";
import { env } from "@/env";
import { resend } from "@/lib/utils/email/resend";

function getBaseUrl() {
    if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
    return "http://localhost:3000";
}

export const auth = betterAuth({
    baseURL: getBaseUrl(),
    trustedOrigins: [getBaseUrl()],
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp }, request) {
                const host = request?.headers.get("host") ?? "localhost:3000";

                const html = await render(
                    VerifyEmailTemplate({
                        otp,
                        host,
                        email,
                    })
                );

                await resend.emails.send({
                    from: env.RESEND_FROM_EMAIL,
                    to: email,
                    subject: `Your verification code for ${PROJECT.NAME}`,
                    html,
                });
            },
        }),
        nextCookies(),
    ],
});
