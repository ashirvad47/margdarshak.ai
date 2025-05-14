import Link from "next/link";
import { IconArrowLeft } from '@tabler/icons-react';
import { Button, Title, Text, Stack, Container } from '@mantine/core';
import CoverLetterGenerator from "../_components/cover-letter-generator"; // Already refactored

export default function NewAiCoverLetterPage() { // Renamed for clarity
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg"> {/* Increased gap */}
        <div> {/* Grouping link and title section */}
          <Button
            component={Link}
            href="/ai-cover-letter"
            variant="subtle" // Mantine subtle variant for a link-like button
            color="gray"
            leftSection={<IconArrowLeft size="1rem" stroke={1.5} />}
            px={0} // Remove padding if you want it very link-like
            mb="md" // Margin bottom
          >
            Back to Cover Letters
          </Button>
          <Stack gap="xs">
            <Title order={1} className="gradient-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
              Create Cover Letter
            </Title>
            <Text c="dimmed">
              Generate a tailored cover letter for your job application.
            </Text>
          </Stack>
        </div>
        <CoverLetterGenerator />
      </Stack>
    </Container>
  );
}