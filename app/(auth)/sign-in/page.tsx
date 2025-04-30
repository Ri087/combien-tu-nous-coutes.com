import { Metadata } from "next";
import { type SearchParams } from "nuqs/server";

import { SignInForm } from "./_components/sign-in-form";
import { searchParamsCache } from "./searchParams";

export const metadata: Metadata = {
    title: "Sign In",
};

type SignInPageProps = {
    searchParams: Promise<SearchParams>;
};

export default async function PageLogin({ searchParams }: SignInPageProps) {
    await searchParamsCache.parse(searchParams);

    return <SignInForm />;
}
