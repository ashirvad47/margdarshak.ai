// File: app/(main)/interview/_components/quiz-list.jsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { format } from "date-fns";
import { toast } from "sonner";
import Link from 'next/link';
import {
    Button, Paper, Text, Title, Group, Stack, ActionIcon, Tooltip, Modal,
    ScrollArea, // Ensure ScrollArea is imported if used for modal itself
    UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { IconEye, IconTrash, IconAlertTriangle, IconPlayerPlay, IconChevronRight } from '@tabler/icons-react';
import { deleteCoverLetter } from "@/actions/cover-letter"; // This seems like a copy-paste error, should be deleteAssessment or similar if that exists
import useFetch from "@/hooks/use-fetch";
import QuizResult from "./quiz-result";

// Placeholder for deleteAssessment - replace with your actual action if it exists
// const deleteAssessment = async (id) => { console.warn("deleteAssessment action not implemented", id); return Promise.resolve(); };


export default function QuizList({ assessments }) {
  const router = useRouter();
  const [opened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Assuming you might want a delete functionality for quiz assessments similar to cover letters
  // const { loading: isDeleting, fn: deleteAssessmentFn } = useFetch(deleteAssessment); 

  const handleViewQuiz = (assessment) => {
    setSelectedQuiz(assessment);
    openModal();
  };

  // const confirmDelete = async () => {
  //   if (selectedQuiz && !isDeleting) {
  //     try {
  //       await deleteAssessmentFn(selectedQuiz.id);
  //       toast.success("Quiz assessment deleted successfully!");
  //       router.refresh(); 
  //     } catch (error) {
  //       toast.error(error.message || "Failed to delete quiz assessment");
  //     } finally {
  //       closeModal();
  //       setSelectedQuiz(null);
  //     }
  //   }
  // };


  if (!assessments?.length) {
    return (
      <Paper shadow="sm" p="xl" withBorder ta="center" radius="md">
        <Stack align="center" gap="md">
            <IconPlayerPlay size="2.5rem" stroke={1.5} style={{ color: 'var(--mantine-color-gray-5)'}} />
            <Title order={3} mb="xs">No Quiz History Yet</Title>
            <Text c="dimmed" size="sm">
            Take your first mock interview to see your progress and insights here.
            </Text>
            <Button
            component={Link}
            href="/interview" // Should link to the quiz config on the same page or mock page
            mt="md"
            variant="light"
            size="sm"
            leftSection={<IconPlayerPlay size="1rem"/>}
            >
            Configure New Quiz
            </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <>
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <div>
              <Title order={3} className="gradient-title">Recent Quizzes</Title> {/* Changed order to 3 for better hierarchy */}
              <Text size="sm" c="dimmed">Review your past quiz performance</Text>
            </div>
            {/* Button to start new quiz is on the parent page now (interview/page.jsx) */}
          </Group>

          {assessments?.length > 0 ? (
            <Stack gap="md">
              {assessments.map((assessment, i) => (
                <UnstyledButton
                  key={assessment.id}
                  onClick={() => handleViewQuiz(assessment)}
                  style={{ width: '100%' }}
                >
                  <Paper withBorder p="md" radius="sm" className="hover:bg-mantine-gray-0 dark:hover:bg-mantine-dark-6 transition-colors">
                    <Group justify="space-between">
                        <Stack gap={0}>
                            <Title order={5}>Quiz {assessments.length - i}</Title>
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
        title="Quiz Result Details"
        size="xl" // xl is good for more content
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        styles={{
            body: { 
                // Ensure body can grow and then enable scrolling if needed
                // maxHeight: 'calc(100vh - 160px)', // Example: 80px top/bottom margin
                // overflowY: 'auto', // This will apply to the modal's direct body
            },
        }}
      >
        {selectedQuiz && (
          <QuizResult
            result={selectedQuiz}
            hideStartNew // Assuming QuizResult is refactored
            onStartNew={() => { closeModal(); router.push("/interview"); }} // Go back to interview hub
          />
        )}
      </Modal>
    </>
  );
}