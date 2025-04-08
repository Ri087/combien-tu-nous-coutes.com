import { PROJECT } from "@/constants/project";
import { Card } from "./components/card";
import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";
import { EmailFooter, EmailHeading, EmailText } from "./components/email-text";
import { Logomark } from "./common/logomark";

interface WaitlistApprovedTemplateProps {
    signUpUrl: string;
    email?: string;
    discordUrl?: string;
}

export default function WaitlistApprovedTemplate({
    signUpUrl,
    email,
    discordUrl,
}: WaitlistApprovedTemplateProps) {
    return (
        <EmailLayout
            previewText={`Your application to ${PROJECT.NAME} has been approved`}
        >
            <div className="flex justify-center items-center w-full mb-6">
                <Logomark className="text-white h-8" />
            </div>

            <Card>
                <EmailHeading>You're in!</EmailHeading>

                <EmailText>
                    Thank you for your interest in{" "}
                    <strong>{PROJECT.NAME}</strong>! Your application has been
                    approved. Click the button below to register an account
                    {email && (
                        <>
                            {" "}
                            with your email{" "}
                            <a
                                href={`mailto:${email}`}
                                className="text-blue-500"
                            >
                                {email}
                            </a>
                        </>
                    )}{" "}
                    and start your <strong>{PROJECT.NAME}</strong> experience!
                </EmailText>

                <EmailButton href={signUpUrl}>Try {PROJECT.NAME}</EmailButton>

                <EmailText className="text-sm text-gray-500">
                    Your account will be ready immediately after registration.
                </EmailText>

                {discordUrl && (
                    <>
                        <EmailText className="mt-8 mb-4">
                            We also invite you to join our Discord!
                        </EmailText>

                        <div className="text-center">
                            <a
                                href={discordUrl}
                                className="px-6 py-3 my-4 inline-block border border-blue-500 rounded-full text-blue-500 font-medium no-underline"
                            >
                                Join Discord
                            </a>
                        </div>
                    </>
                )}
            </Card>
            <EmailFooter />
        </EmailLayout>
    );
}

WaitlistApprovedTemplate.PreviewProps = {
    signUpUrl: "https://example.com/sign-up",
    email: "leonard@example.com",
} as WaitlistApprovedTemplateProps;
