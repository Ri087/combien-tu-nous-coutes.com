import {
    Body,
    Container,
    Head,
    Html,
    Preview,
    Tailwind,
} from "@react-email/components";
import { ReactNode } from "react";

interface EmailLayoutProps {
    children: ReactNode;
    previewText: string;
}

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
    return (
        <Html>
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Head />
                <Body className="bg-neutral-950 font-sans">
                    <Container className="mx-auto py-5 px-3 max-w-[580px]">
                        {children}
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
