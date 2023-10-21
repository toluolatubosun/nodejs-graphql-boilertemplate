import DefaultLayout from "@/email-templates/layouts/default-layout";
import { Text, Button, Heading, Section } from "@react-email/components";

interface EmailProp {
    name: string;
    resetLink: string;
}

export default function Email({ name, resetLink }: EmailProp) {
    return (
        <DefaultLayout>
            <Section style={{ padding: "16px 16px 0px 16px" }}>
                <Heading as="h3">Reset Password</Heading>

                <Text>Hi {name}, ⚡️</Text>

                <Text>
                    Click the link below to reset your password. This link expires in <b>60 minutes.</b>
                </Text>

                <Button href={resetLink}>Reset your password</Button>

                <Text>Thanks!</Text>
            </Section>
        </DefaultLayout>
    );
}
