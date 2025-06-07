"use client";

import { Container, Title, Text, Stack, List } from '@mantine/core';

export default function TermsAndConditionsPage() {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1} ta="center" className="gradient-title">
          Terms and Conditions
        </Title>
        <Text c="dimmed" ta="center">
          Last updated: June 7, 2025
        </Text>

        <Text>
          Please read these Terms and Conditions ("Terms") carefully before using the Margdarshak.ai website (the "Service") operated by us. Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms.
        </Text>

        <Stack gap="md" mt="lg">
          <Title order={3}>1. Accounts</Title>
          <Text>
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </Text>

          <Title order={3}>2. AI-Generated Content</Title>
          <Text>
            Our Service uses artificial intelligence to generate content such as resumes, cover letters, and career insights. While we strive for accuracy and relevance, we do not guarantee that the generated content will be free of errors or perfectly suited for every situation. You are solely responsible for reviewing, editing, and verifying the accuracy of all content before use. You retain ownership of the final documents you create.
          </Text>

          <Title order={3}>3. Intellectual Property</Title>
          <Text>
            The Service and its original content (excluding content created by users), features, and functionality are and will remain the exclusive property of Margdarshak.ai and its licensors.
          </Text>
          
          <Title order={3}>4. Limitation Of Liability</Title>
          <Text>
            In no event shall Margdarshak.ai, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </Text>

          <Title order={3}>5. Governing Law</Title>
          <Text>
            These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </Text>

          <Title order={3}>6. Changes</Title>
           <Text>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.
          </Text>

           <Title order={3}>7. Contact Us</Title>
           <Text>If you have any questions about these Terms, please contact us at: <a href="mailto:legal@margdarshak.ai">legal@margdarshak.ai</a></Text>

        </Stack>
      </Stack>
    </Container>
  );
}