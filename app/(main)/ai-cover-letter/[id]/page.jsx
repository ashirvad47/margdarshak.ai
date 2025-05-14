import Link from "next/link";
import { IconArrowLeft } from '@tabler/icons-react';
import { Button, Title, Text, Stack, Container, Paper } from '@mantine/core';
import { getCoverLetter } from "@/actions/cover-letter";
import CoverLetterPreview from "../_components/cover-letter-preview"; // No direct Shadcn here

export default async function ViewAiCoverLetterPage({ params: paramsProp }) { // Renamed prop to avoid conflict
  // Attempt to "await" the params as the error suggests.
  // This is unusual, but let's follow the error's hint.
  // It's more likely the error is a symptom of something else if params isn't actually a promise.
  const params = await paramsProp; // Await the passed params object
  const { id } = params;

  if (!id) {
    // This case should ideally not be hit if the route is matched correctly
    // but good for robustness.
    return (
      <Container size="sm" py="xl" ta="center">
        <Title order={2} c="red">Error</Title>
        <Text c="dimmed" mt="sm">Cover letter ID is missing.</Text>
        <Button component={Link} href="/ai-cover-letter" mt="lg" variant="outline">
          Back to Cover Letters
        </Button>
      </Container>
    );
  }

  const coverLetter = await getCoverLetter(id);

  if (!coverLetter) {
    return (
      <Container size="sm" py="xl" ta="center">
        <Title order={2} c="red">Cover Letter Not Found</Title>
        <Text c="dimmed" mt="sm">The requested cover letter could not be found or you do not have permission to view it.</Text>
        <Button component={Link} href="/ai-cover-letter" mt="lg" variant="outline">
          Back to Cover Letters
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
      <div>
        <Button
          component={Link}
          href="/ai-cover-letter"
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size="1rem" stroke={1.5} />}
          px={0}
          mb="md"
        >
          Back to Cover Letters
        </Button>
        <Title order={1} className="gradient-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }} mb="xs">
          {coverLetter.jobTitle}
        </Title>
        <Text size="xl" c="dimmed">
          at {coverLetter.companyName}
        </Text>
        </div>
        <Paper withBorder radius="md" p="xs" bg="white">
            <CoverLetterPreview content={coverLetter.content} />
        </Paper>
      </Stack>
    </Container>
  );
}