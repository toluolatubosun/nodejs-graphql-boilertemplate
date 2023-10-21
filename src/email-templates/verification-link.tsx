import DefaultLayout from "@/email-templates/layouts/default-layout";
import { Text, Button, Heading, Section } from "@react-email/components";

interface EmailProp {
    name: string;
    verificationLink: string;
}

export default function Email({ name, verificationLink }: EmailProp) {
    return (
        <DefaultLayout>
            <Section style={{ padding: "16px 16px 0px 16px" }}>
                <Heading as="h3">Verify your Email</Heading>

                <Text>Hi {name},</Text>

                <Text>Click the link below to verify your account.</Text>

                <Button href={verificationLink}>Verify Email</Button>

                <Text>Thanks!</Text>
            </Section>
        </DefaultLayout>
    );
}
