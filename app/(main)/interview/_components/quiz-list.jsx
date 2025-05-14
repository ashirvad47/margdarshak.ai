"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from 'next/link'; // For the "Start New Quiz" button if it links directly
import {
    Button,
    Paper,
    Text,
    Title,
    Group,
    Stack,
    Modal, // Mantine Modal
    ScrollArea, // For long quiz results in modal
    UnstyledButton, // To make the paper clickable
} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { IconPlayerPlay, IconChevronRight } from '@tabler/icons-react';
import QuizResult from "./quiz-result"; // This will also need refactoring

export default function QuizList({ assessments }) {
  const router = useRouter();
  const [opened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const handleViewQuiz = (assessment) => {
    setSelectedQuiz(assessment);
    openModal();
  };

  return (
    <>
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <div>
              <Title order={2} className="gradient-title">Recent Quizzes</Title>
              <Text size="sm" c="dimmed">Review your past quiz performance</Text>
            </div>
            <Button
              component={Link}
              href="/interview/mock"
              leftSection={<IconPlayerPlay size="1.125rem" stroke={1.5} />}
            >
              Start New Quiz
            </Button>
          </Group>

          {assessments?.length > 0 ? (
            <Stack gap="md">
              {assessments.map((assessment, i) => (
                <UnstyledButton
                  key={assessment.id}
                  onClick={() => handleViewQuiz(assessment)}
                  style={{ width: '100%' }}
                >
                  <Paper withBorder p="md" radius="sm" className="hover:bg-mantine-gray-0 dark:hover:bg-mantine-dark-6 transition-colors"> {/* Mantine theme hover */}
                    <Group justify="space-between">
                        <Stack gap={0}>
                            <Title order={5}>Quiz {assessments.length - i}</Title> {/* Reverse order for display */}
                            <Text size="xs" c="dimmed">
                                Score: {assessment.quizScore.toFixed(1)}% | {" "}
                                {format(new Date(assessment.createdAt), "dd MMM yyyy, HH:mm")}
                            </Text>
                        </Stack>
                        <IconChevronRight size="1.25rem" stroke={1.5} style={{color: 'var(--mantine-color-gray-5)'}}/>
                    </Group>
                    {assessment.improvementTip && (
                        <Text size="xs" c="dimmed" mt="xs" lineClamp={2}>
                        Tip: {assessment.improvementTip}
                        </Text>
                    )}
                  </Paper>
                </UnstyledButton>
              ))}
            </Stack>
          ) : (
            <Text ta="center" c="dimmed" py="xl">No quiz history yet. Start a new quiz to see your progress!</Text>
          )}
        </Stack>
      </Paper>

      <Modal
        opened={opened}
        onClose={closeModal}
        title={<Title order={4}>Quiz Result Details</Title>}
        size="xl" // Larger modal for quiz results
        centered
        scrollAreaComponent={ScrollArea.Autosize} // Makes modal content scrollable
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        {selectedQuiz && (
          <QuizResult
            result={selectedQuiz}
            hideStartNew // Assuming QuizResult is refactored
            onStartNew={() => { closeModal(); router.push("/interview/mock"); }}
          />
        )}
      </Modal>
    </>
  );
}