"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    RiErrorWarningFill,
    RiInformationFill,
    RiMailLine,
    RiUserAddFill,
    RiUserLine,
} from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PasswordInput } from "@/app/(auth)/_components/password-input";
import sendVerificationOtp from "@/app/(auth)/_lib/sendVerificationOtp";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import * as Divider from "@/components/ui/divider";
import * as FancyButton from "@/components/ui/fancy-button";
import { FormGlobalMessage, FormMessage } from "@/components/ui/form";
import * as Input from "@/components/ui/input";
import * as Label from "@/components/ui/label";
import * as LinkButton from "@/components/ui/link-button";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PROJECT } from "@/constants/project";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";
import { signUpSchema } from "@/validators/auth";

import { signUpParsers } from "../searchParams";

export function SignUpForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [{ signUpEmail }] = useQueryStates(signUpParsers);

    const { register, handleSubmit, formState } = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            fullName: "",
            email: signUpEmail,
            password: "",
        },
    });

    function onSubmit(values: z.infer<typeof signUpSchema>) {
        setError(null);
        setIsLoading(true);

        authClient.signUp.email(
            {
                name: values.fullName,
                email: values.email,
                password: values.password,
            },
            {
                onError: (ctx) => {
                    switch (ctx.error.code) {
                        case AUTH_ERRORS.USER_ALREADY_EXISTS:
                            setError("A user with this email already exists.");
                            break;
                        default:
                            setError(
                                ctx.error.message ||
                                    "An error occurred during sign up."
                            );
                    }
                    setIsLoading(false);
                },
                onSuccess: () => {
                    sendVerificationOtp(values.email)
                        .then((redirectUrl) => {
                            router.push(redirectUrl);
                        })
                        .catch((error) => {
                            setIsLoading(false);
                            setError(error as string);
                        });
                },
            }
        );
    }
    return (
        <div className="w-full max-w-[472px] px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex w-full flex-col gap-6 rounded-20 bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 md:p-8"
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
                        <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 lg:size-16">
                            <RiUserAddFill className="size-6 text-text-sub-600 lg:size-8" />
                        </div>
                    </div>

                    <div className="space-y-1 text-center">
                        <div className="text-title-h6 lg:text-title-h5">
                            Create your account
                        </div>
                        <div className="text-paragraph-sm text-text-sub-600 lg:text-paragraph-md">
                            Enter your details to sign up.
                        </div>
                    </div>
                </div>

                <Divider.Root />

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <Label.Root htmlFor="fullname">
                            Full name <Label.Asterisk />
                        </Label.Root>
                        <Input.Root hasError={!!formState.errors.fullName}>
                            <Input.Wrapper>
                                <Input.Icon as={RiUserLine} />
                                <Input.Input
                                    id="fullname"
                                    type="text"
                                    placeholder="James Brown"
                                    required
                                    {...register("fullName")}
                                />
                            </Input.Wrapper>
                        </Input.Root>
                        <FormMessage>
                            {formState.errors.fullName?.message}
                        </FormMessage>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label.Root htmlFor="email">
                            Email <Label.Asterisk />
                        </Label.Root>
                        <Input.Root hasError={!!formState.errors.email}>
                            <Input.Wrapper>
                                <Input.Icon as={RiMailLine} />
                                <Input.Input
                                    id="email"
                                    type="email"
                                    placeholder={`hello@${PROJECT.DOMAIN}`}
                                    disabled={!!signUpEmail}
                                    required
                                    {...register("email")}
                                />
                            </Input.Wrapper>
                        </Input.Root>
                        <FormMessage>
                            {formState.errors.email?.message}
                        </FormMessage>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label.Root htmlFor="password">
                            Password <Label.Asterisk />
                        </Label.Root>
                        <PasswordInput
                            id="password"
                            required
                            hasError={!!formState.errors.password}
                            {...register("password")}
                        />
                        {formState.errors.password ? (
                            <FormMessage>
                                {formState.errors.password.message}
                            </FormMessage>
                        ) : (
                            <div className="flex gap-1 text-paragraph-xs text-text-sub-600">
                                <RiInformationFill className="size-4 shrink-0 text-text-soft-400" />
                                Password must be at least 8 characters long and
                                contain a number.
                            </div>
                        )}
                    </div>
                </div>

                <FormGlobalMessage variant="error" Icon={RiErrorWarningFill}>
                    {error}
                </FormGlobalMessage>

                <FancyButton.Root
                    variant="primary"
                    size="medium"
                    disabled={isLoading}
                >
                    {isLoading && <StaggeredFadeLoader variant="muted" />}
                    {isLoading ? "Registering..." : "Register"}
                </FancyButton.Root>

                <div className="text-center text-paragraph-sm text-text-sub-600">
                    By signing up, you agree to our terms of service.
                    <div className="inline-block pt-1 align-baseline">
                        <Link href="/terms-of-service">
                            <LinkButton.Root
                                variant="black"
                                size="medium"
                                underline
                                className="px-1"
                            >
                                Terms of Service
                            </LinkButton.Root>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
