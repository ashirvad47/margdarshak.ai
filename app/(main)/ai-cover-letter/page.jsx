import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { IconPlus } from '@tabler/icons-react'; // Tabler Icon
import { Button, Title, Group, Stack, Container } from '@mantine/core'; // Mantine
import CoverLetterList from "./_components/cover-letter-list"; // Already refactored

export default async function AiCoverLetterPage() { // Renamed for clarity
  const coverLetters = await getCoverLetters();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Title order={1} className="gradient-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
            My Cover Letters
          </Title>
          <Button
            component={Link}
            href="/ai-cover-letter/new"
            leftSection={<IconPlus size="1.125rem" stroke={1.5} />}
            variant="filled" // Or your preferred default variant
          >
            Create New
          </Button>
        </Group>
        <CoverLetterList coverLetters={coverLetters} />
      </Stack>
    </Container>
  );
}