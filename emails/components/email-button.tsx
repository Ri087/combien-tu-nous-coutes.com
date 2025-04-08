import { Button } from "@react-email/components";
import { ReactNode } from "react";

interface EmailButtonProps {
    href: string;
    children: ReactNode;
}

export function EmailButton({ href, children }: EmailButtonProps) {
    return (
        <Button
            href={href}
            className="bg-[#0085ff] rounded-md px-6 py-3 text-base font-medium text-white no-underline my-5 text-center block mx-auto w-auto"
        >
            {children}
        </Button>
    );
}
