import React from "react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils/cn";
import { PROJECT } from "@/constants/project";

interface LogomarkProps {
    className?: string;
    logoClassName?: string;
    textClassName?: string;
}

function Logomark({
    className,
    logoClassName,
    textClassName,
    ...props
}: LogomarkProps & Omit<React.ComponentProps<"div">, "className">) {
    return (
        <div
            className={cn("flex items-center gap-4 my-4", className)}
            {...props}
        >
            <Logo className={cn("size-5 w-auto", logoClassName)} />
            <span
                className={cn(
                    "text-lg font-medium tracking-tight",
                    textClassName
                )}
            >
                {PROJECT.NAME}
            </span>
        </div>
    );
}

export { Logomark };
