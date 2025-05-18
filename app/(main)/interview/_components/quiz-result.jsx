// File: app/(main)/interview/_components/quiz-result.jsx
"use client";

import React from 'react';
import { IconTrophy, IconCircleCheckFilled, IconCircleXFilled, IconInfoCircle, IconPlayerPlay } from '@tabler/icons-react';
import { Button, Paper, Text, Title, Group, Stack, Progress as MantineProgress, Alert, ScrollArea, Box, useMantineTheme } from '@mantine/core'; // Added useMantineTheme

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  const theme = useMantineTheme(); // Get theme for consistent styling

  if (!result) return null;

  return (
    // The main Paper for QuizResult should not have a fixed height itself.
    // Its height will be determined by its content.
    <Paper shadow="none" p={0} radius="md">
      <Stack gap="xl">
        <Group justify="center" align="center" gap="xs">
          <IconTrophy size="2rem" stroke={1.5} style={{ color: theme.colors.yellow[6] }} />
          <Title order={2} className="gradient-title">Quiz Results</Title>
        </Group>

        <Stack align="center" gap="xs">
          <Title order={1} style={{ fontSize: '3rem' }}>{result.quizScore.toFixed(1)}%</Title>
          <MantineProgress value={result.quizScore} size="lg" radius="sm" style={{ width: '100%', maxWidth: '400px' }} />
        </Stack>

        {result.improvementTip && (
          <Alert
            variant="light"
            color="blue"
            title="Improvement Tip"
            icon={<IconInfoCircle />}
            radius="md"
          >
            {result.improvementTip}
          </Alert>
        )}

        <Box> {/* This Box wraps the Question Review section */}
          <Title order={4} mb="md">Question Review</Title>
          {/* This ScrollArea is specifically for the list of questions.
            It needs a defined height or maxHeight to know when to show scrollbars.
            `viewportProps` can be used to style the actual scrollable viewport if needed.
          */}
          <ScrollArea
            mah={400} // Using Mantine's shorthand for maxHeight
            mih={200} // Optional: minimum height before scrolling starts
            type="auto" // "auto" shows scrollbars only when needed
            offsetScrollbars
            scrollbarSize={8}
          >
            <Stack gap="md">
              {(result.questions || []).map((q, index) => (
                <Paper 
                  key={index} 
                  withBorder 
                  p="md" 
                  radius="sm" 
                  bg={q.isCorrect ? theme.colors.green[0] : theme.colors.red[0]}
                >
                  <Stack gap="sm">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Text fw={500} flex={1} component="div"> {/* Use div for better flex behavior */}
                        {index + 1}. {q.question}
                      </Text>
                      {q.isCorrect ? (
                        <IconCircleCheckFilled size="1.25rem" style={{ color: theme.colors.green[6], flexShrink: 0 }} />
                      ) : (
                        <IconCircleXFilled size="1.25rem" style={{ color: theme.colors.red[6], flexShrink: 0 }} />
                      )}
                    </Group>
                    <Box 
                        pl="lg" 
                        style={{ 
                            borderLeft: `2px solid ${theme.colors.gray[3]}`,
                            marginLeft: '2px' // Small margin to avoid icon overlap if text is short
                        }}
                    >
                        <Text size="sm" c="dimmed">Your answer: <Text span fw={500} c={q.isCorrect ? 'green' : 'red'}>{q.userAnswer || "Not answered"}</Text></Text>
                        {!q.isCorrect && <Text size="sm" c="dimmed">Correct answer: <Text span fw={500} c="green">{q.answer}</Text></Text>}
                    </Box>
                    {q.explanation && (
                        <Alert variant="light" color="gray" title="Explanation" icon={<IconInfoCircle />} radius="xs" mt="xs" fz="xs">
                            {q.explanation}
                        </Alert>
                    )}
                  </Stack>
                </Paper>
              ))}
              {(!result.questions || result.questions.length === 0) && (
                <Text c="dimmed" ta="center" py="md">No questions to review for this result.</Text>
              )}
            </Stack>
          </ScrollArea>
        </Box>

        {!hideStartNew && (
          <Button onClick={onStartNew} fullWidth mt="lg" size="md" leftSection={<IconPlayerPlay size="1.125rem"/>}>
            Start New Quiz
          </Button>
        )}
      </Stack>
    </Paper>
  );
}