import { PROJECT } from "@/constants/project";
import { RiTimeLine } from "@remixicon/react";
import { Card } from "./components/card";
import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";
import { EmailFooter, EmailHeading, EmailText } from "./components/email-text";
import { Logomark } from "./common/logomark";

interface ChangeEmailTemplateProps {
    url: string;
    name?: string;
    newEmail: string;
}

export default function ChangeEmailTemplate({
    url,
    name,
    newEmail,
}: ChangeEmailTemplateProps) {
    return (
        <EmailLayout
            previewText={`Please verify your new email address for your ${PROJECT.NAME} account`}
        >
            <div className="flex justify-center items-center w-full mb-6">
                <Logomark className="text-white h-8" />
            </div>

            <Card>
                <EmailHeading>
                    {name ? `Hi ${name},` : "Hi there,"}
                </EmailHeading>

                <EmailText>
                    {
                        "We received a request to change the email address associated with your "
                    }
                    {PROJECT.NAME}
                    {" account to: "}
                    <strong>{newEmail}</strong>
                </EmailText>

                <EmailText>
                    {"To complete this change, please click the button below:"}
                </EmailText>

                <EmailButton href={url}>
                    {"Verify New Email Address"}
                </EmailButton>

                <EmailText className="text-sm text-gray-500">
                    {
                        "If the button doesn't work, copy and paste this link into your browser: "
                    }
                    <span className="text-blue-500 break-all">{url}</span>
                </EmailText>

                <div className="flex items-center gap-2 mt-6">
                    <RiTimeLine className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <EmailText className="font-semibold">
                        {
                            "This link will expire in 1 hour for security reasons."
                        }
                    </EmailText>
                </div>

                <EmailText>
                    {
                        "If you did not request this email change, please disregard this message or contact our support team immediately if you have any concerns about your account security."
                    }
                </EmailText>

                <EmailText className="mt-6">
                    {"Thanks,"}
                    <br />
                    {`The ${PROJECT.NAME} Team`}
                </EmailText>
            </Card>

            <EmailFooter />
        </EmailLayout>
    );
}

ChangeEmailTemplate.PreviewProps = {
    url: "https://example.com/verify-email-change?token=xyz",
    name: "Leonard",
    newEmail: "newemail@example.com",
} as ChangeEmailTemplateProps;
