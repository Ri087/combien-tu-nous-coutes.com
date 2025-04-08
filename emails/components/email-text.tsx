import { PROJECT } from "@/constants/project";
import { cn } from "@/lib/utils";
import { Heading, Link, Section, Text } from "@react-email/components";
import { ReactNode } from "react";

interface EmailTextProps {
    children: ReactNode;
    className?: string;
}

export function EmailHeading({ children, className }: EmailTextProps) {
    return (
        <Heading
            className={cn(
                "text-xl font-medium text-white mt-0 mb-4",
                className
            )}
        >
            {children}
        </Heading>
    );
}

export function EmailText({ children, className }: EmailTextProps) {
    return (
        <Text className={cn("text-sm text-white leading-6 my-3", className)}>
            {children}
        </Text>
    );
}

interface EmailFooterProps {
    className?: string;
    twitterLink?: string;
    linkedinLink?: string;
    docsLink?: string;
    privacyLink?: string;
    termsLink?: string;
    children?: ReactNode;
}

export function EmailFooter({
    className,
    twitterLink,
    linkedinLink,
    docsLink,
    privacyLink,
    termsLink,
}: EmailFooterProps) {
    return (
        <Section className="mt-6">
            <div className="text-center mb-4">
                {twitterLink && (
                    <>
                        <Link
                            href={twitterLink}
                            className="text-gray-400 text-xs mx-2"
                        >
                            {"Twitter"}
                        </Link>
                        <Text className="text-gray-400 inline-block mx-1 text-xs">
                            {"•"}
                        </Text>
                    </>
                )}

                {linkedinLink && (
                    <>
                        <Link
                            href={linkedinLink}
                            className="text-gray-400 text-xs mx-2"
                        >
                            {"LinkedIn"}
                        </Link>
                        <Text className="text-gray-400 inline-block mx-1 text-xs">
                            {"•"}
                        </Text>
                    </>
                )}

                {docsLink && (
                    <>
                        <Link
                            href={docsLink}
                            className="text-gray-400 text-xs mx-2"
                        >
                            {"Docs"}
                        </Link>
                        {(privacyLink || termsLink) && (
                            <Text className="text-gray-400 inline-block mx-1 text-xs">
                                {"•"}
                            </Text>
                        )}
                    </>
                )}

                {privacyLink && (
                    <>
                        <Link
                            href={privacyLink}
                            className="text-gray-400 text-xs mx-2"
                        >
                            {"Privacy"}
                        </Link>
                        {termsLink && (
                            <Text className="text-gray-400 inline-block mx-1 text-xs">
                                {"•"}
                            </Text>
                        )}
                    </>
                )}

                {termsLink && (
                    <Link
                        href={termsLink}
                        className="text-gray-400 text-xs mx-2"
                    >
                        {"Terms"}
                    </Link>
                )}
            </div>

            <Text
                className={cn("text-xs text-gray-400 text-center", className)}
            >
                {`© ${new Date().getFullYear()} ${PROJECT.COMPANY}`}
            </Text>
        </Section>
    );
}
