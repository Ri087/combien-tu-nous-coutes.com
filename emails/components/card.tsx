import { Section } from "@react-email/components";
import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
}

export function Card({ children }: CardProps) {
    return (
        <Section className="bg-zinc-800 rounded-3xl p-10 my-4 w-full">
            {children}
        </Section>
    );
}
