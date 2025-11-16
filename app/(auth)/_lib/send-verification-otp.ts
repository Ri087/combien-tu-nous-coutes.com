import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth/client";

export default function sendVerificationOtp(email: string): Promise<string> {
  return new Promise((resolve, reject) => {
    authClient.emailOtp.sendVerificationOtp(
      {
        email,
        type: "email-verification",
      },
      {
        onError: (ctx) => {
          reject(ctx.error.message);
        },
        onSuccess: () => {
          resolve(`${PAGES.VERIFICATION}?email=${email}`);
        },
      }
    );
  });
}
