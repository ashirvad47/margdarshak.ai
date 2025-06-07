import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";
import { Container } from '@mantine/core';
import { checkUser } from "@/lib/checkUser";

export default async function ResumePage() {
  const resumeData = await getResume();
  const user = await checkUser();

  return (
    <Container size="xl" py="xl">
      <ResumeBuilder initialResumeData={resumeData} userProfile={user} />
    </Container>
  );
}