import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder"; // This now imports the Mantine-based builder
import { Container } from '@mantine/core'; // Using Mantine Container

export default async function ResumePage() {
  const resume = await getResume(); // Server-side data fetching

  return (
    // Using Mantine Container for consistent padding and layout control
    // py="xl" gives more padding than py-6 typically. Adjust as needed.
    <Container size="xl" py="xl">
      <ResumeBuilder initialContent={resume?.content} />
    </Container>
  );
}