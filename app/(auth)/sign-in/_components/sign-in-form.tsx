"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as LabelPrimitive from "@radix-ui/react-label";
import {
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiMailLine,
  RiUserFill,
} from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PasswordInput } from "@/app/(auth)/_components/password-input";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as Checkbox from "@/components/ui/checkbox";
import * as Divider from "@/components/ui/divider";
import * as FancyButton from "@/components/ui/fancy-button";
import { FormGlobalMessage, FormMessage } from "@/components/ui/form";
import * as Input from "@/components/ui/input";
import * as Label from "@/components/ui/label";
import * as LinkButton from "@/components/ui/link-button";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PAGES } from "@/constants/pages";
import { PROJECT } from "@/constants/project";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";

import sendVerificationOtp from "../../_lib/send-verification-otp";
import { messageParsers } from "../search-params";

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export function SignInForm() {
  const router = useRouter();
  const [{ message, error: errorQuery }] = useQueryStates(messageParsers);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorQuery);

  const { register, handleSubmit, formState, setValue } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (values: z.infer<typeof signInSchema>) => {
    setError(null);
    setIsLoading(true);

    authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: PAGES.DASHBOARD,
        rememberMe: values.rememberMe,
      },
      {
        onError: (ctx) => {
          if (ctx.error.code === AUTH_ERRORS.EMAIL_NOT_VERIFIED) {
            sendVerificationOtp(values.email)
              .then((redirectUrl) => {
                router.push(redirectUrl);
              })
              .catch((error) => {
                setError(error as string);
              })
              .finally(() => {
                setIsLoading(false);
              });
          } else if (ctx.error.code === AUTH_ERRORS.INVALID_EMAIL_OR_PASSWORD) {
            setIsLoading(false);
            setError("Invalid email or password.");
          } else {
            setIsLoading(false);
            setError(ctx.error.message);
          }
        },
      }
    );
  };

  return (
    <div className="w-full max-w-[472px] px-4">
      <section className="flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset md:p-8">
        <form
          className="flex w-full flex-col gap-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col items-center gap-2">
            {/* icon */}
            <div
              className={cn(
                "relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-24",
                // bg
                "before:absolute before:inset-0 before:rounded-full",
                "before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10"
              )}
            >
              <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset lg:size-16">
                <RiUserFill className="size-6 text-text-sub-600 lg:size-8" />
              </div>
            </div>

            <div className="space-y-1 text-center">
              <div className="text-title-h6 lg:text-title-h5">
                Sign in to your account
              </div>
              <div className="text-paragraph-sm text-text-sub-600 lg:text-paragraph-md">
                Enter your email and password to access your account.
              </div>
            </div>
          </div>

          <Divider.Root />

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="email">
                Email <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={!!formState.errors.email}>
                <Input.Wrapper>
                  <Input.Icon as={RiMailLine} />
                  <Input.Input
                    {...register("email")}
                    autoComplete="email webauthn"
                    id="email"
                    placeholder={`hello@${PROJECT.DOMAIN}`}
                    required
                    type="email"
                  />
                </Input.Wrapper>
              </Input.Root>
              <FormMessage>{formState.errors.email?.message}</FormMessage>
            </div>

            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="password">
                Password <Label.Asterisk />
              </Label.Root>
              <PasswordInput
                {...register("password")}
                autoComplete="current-password webauthn"
                hasError={!!formState.errors.password}
                id="password"
                required
              />
              <FormMessage>{formState.errors.password?.message}</FormMessage>
            </div>
          </div>

          <FormGlobalMessage Icon={RiErrorWarningFill} variant="error">
            {error}
          </FormGlobalMessage>

          {message && !error && (
            <FormGlobalMessage Icon={RiCheckboxCircleFill} variant="success">
              {message}
            </FormGlobalMessage>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2">
              <Checkbox.Root
                id="agree"
                onCheckedChange={(value) => {
                  setValue("rememberMe", !!value);
                }}
                {...register("rememberMe")}
              />
              <LabelPrimitive.Root
                className="block cursor-pointer text-paragraph-sm"
                htmlFor="agree"
              >
                Remember me
              </LabelPrimitive.Root>
            </div>
            <LinkButton.Root asChild size="medium" underline variant="gray">
              <Link href={PAGES.FORGOT_PASSWORD}>Forgot password?</Link>
            </LinkButton.Root>
          </div>

          <FancyButton.Root
            disabled={isLoading}
            size="medium"
            variant="primary"
          >
            {isLoading && <StaggeredFadeLoader variant="muted" />}
            {isLoading ? "Signing in..." : "Sign in"}
          </FancyButton.Root>
        </form>
      </section>
    </div>
  );
}
