import { redirect } from "next/navigation";

import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";

import AuthFooter from "./_components/footer";
import AuthHeader from "./_components/header";

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getServerSession();

    if (session) {
        redirect(PAGES.DASHBOARD);
    }

    return (
        <div className="items-cente flex min-h-screen flex-col ">
            <AuthHeader />
            <div className="relative isolate flex w-full flex-1 flex-col items-center justify-center">
                <img
                    src="/images/auth-pattern.svg"
                    alt=""
                    className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-full max-w-[1140px] -translate-x-1/2 -translate-y-1/2 object-contain"
                    width="824"
                    height="318"
                />
                {children}
            </div>
            <AuthFooter />
        </div>
    );
}
