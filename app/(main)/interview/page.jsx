import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards"; // Refactored
import PerformanceChart from "./_components/performace-chart"; // Refactored
import QuizList from "./_components/quiz-list"; // Refactored
import { Container, Title, Stack } from '@mantine/core';

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={1} className="gradient-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }} mb="md">
          Interview Preparation
        </Title>
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </Stack>
    </Container>
  );
}