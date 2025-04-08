import { Section, Text } from "@react-email/components";

interface OtpDisplayProps {
    otp: string;
}

export function OtpDisplay({ otp }: OtpDisplayProps) {
    return (
        <Section className="bg-[#323336] rounded-md mx-auto w-full text-center">
            <Text className="font-mono text-lg md:text-xl tracking-[10px] leading-5 text-white">
                {otp}
            </Text>
        </Section>
    );
}
