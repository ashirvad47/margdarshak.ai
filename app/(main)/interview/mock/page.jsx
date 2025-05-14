import Link from "next/link";
import { IconArrowLeft } from '@tabler/icons-react';
import { Button, Title, Text, Stack, Container } from '@mantine/core';
import Quiz from "../_components/quiz"; // Refactored

export default function MockInterviewPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Button
            component={Link}
            href="/interview"
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size="1rem" stroke={1.5} />}
            px={0}
            mb="md"
          >
            Back to Interview Preparation
          </Button>
          <Stack gap="xs">
            <Title order={1} className="gradient-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
              Mock Interview
            </Title>
            <Text c="dimmed">
              Test your knowledge with industry-specific questions.
            </Text>
          </Stack>
        </div>
        <Quiz />
      </Stack>
    </Container>
  );
}