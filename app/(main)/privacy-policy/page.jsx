"use client";

import { Container, Title, Text, Stack, List } from '@mantine/core';

export default function PrivacyPolicyPage() {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1} ta="center" className="gradient-title">
          Privacy Policy
        </Title>
        <Text c="dimmed" ta="center">
          Last updated: June 7, 2025
        </Text>

        <Text>
          Welcome to Margdarshak.ai ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
        </Text>

        <Stack gap="md" mt="lg">
          <Title order={3}>1. Information We Collect</Title>
          <Text>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</Text>
          <List spacing="xs" size="sm">
            <List.Item>
              <Text fw={500}>Personal Data:</Text> Personally identifiable information, such as your name, email address, and demographic information, that you voluntarily give to us when you register with the Site.
            </List.Item>
            <List.Item>
              <Text fw={500}>Profile & Resume Data:</Text> Information you provide for your career profile, such as your professional experience, skills, bio, education history, and any other data you input into our resume builder or other tools.
            </List.Item>
             <List.Item>
              <Text fw={500}>Authentication Data:</Text> We use Clerk for user authentication. We store your Clerk User ID but do not store your passwords.
            </List.Item>
            <List.Item>
              <Text fw={500}>Derivative Data:</Text> Information our servers automatically collect when you access the Site, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Site.
            </List.Item>
          </List>

          <Title order={3}>2. Use of Your Information</Title>
          <Text>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</Text>
          <List spacing="xs" size="sm">
            <List.Item>Create and manage your account.</List.Item>
            <List.Item>Generate personalized AI-driven career insights, resume feedback, and cover letters.</List.Item>
            <List.Item>Improve the accuracy and performance of our AI models.</List.Item>
            <List.Item>Monitor and analyze usage and trends to improve your experience with the Site.</List.Item>
            <List.Item>Notify you of updates to the Site.</List.Item>
          </List>

          <Title order={3}>3. Disclosure of Your Information</Title>
          <Text>We do not sell your personal information. We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</Text>
           <List spacing="xs" size="sm">
            <List.Item><Text fw={500}>By Law or to Protect Rights:</Text> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</List.Item>
            <List.Item><Text fw={500}>Third-Party Service Providers:</Text> We may share your information with third parties that perform services for us or on our behalf, including data analysis, AI model hosting (such as Google Gemini), and user authentication (Clerk).</List.Item>
          </List>

          <Title order={3}>4. Security of Your Information</Title>
          <Text>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </Text>

           <Title order={3}>5. Contact Us</Title>
           <Text>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@margdarshak.ai">privacy@margdarshak.ai</a></Text>

        </Stack>
      </Stack>
    </Container>
  );
}