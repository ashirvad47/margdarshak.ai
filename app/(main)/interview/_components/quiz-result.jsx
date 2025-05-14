"use client";

import React from 'react';
import { IconTrophy, IconCircleCheckFilled, IconCircleXFilled, IconInfoCircle, IconPlayerPlay } from '@tabler/icons-react';
import { Button, Paper, Text, Title, Group, Stack, Progress as MantineProgress, Alert, ScrollArea, Box } from '@mantine/core';

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  return (
    <Paper shadow="none" p={0} radius="md"> {/* Main container, can be Paper or just Stack */}
      <Stack gap="xl">
        <Group justify="center" align="center" gap="xs">
          <IconTrophy size="2rem" stroke={1.5} style={{ color: 'var(--mantine-color-yellow-6)' }} />
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

        <Box>
          <Title order={4} mb="md">Question Review</Title>
          <ScrollArea style={{ maxHeight: '400px' }} type="auto"> {/* Scroll for many questions */}
            <Stack gap="md">
              {(result.questions || []).map((q, index) => (
                <Paper key={index} withBorder p="md" radius="sm" bg={q.isCorrect ? 'var(--mantine-color-green-0)' : 'var(--mantine-color-red-0)'}>
                  <Stack gap="sm">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Text fw={500} flex={1}>{index + 1}. {q.question}</Text>
                      {q.isCorrect ? (
                        <IconCircleCheckFilled size="1.25rem" style={{ color: 'var(--mantine-color-green-6)' }} />
                      ) : (
                        <IconCircleXFilled size="1.25rem" style={{ color: 'var(--mantine-color-red-6)' }} />
                      )}
                    </Group>
                    <Box pl="lg" style={{ borderLeft: `2px solid var(--mantine-color-gray-3)` }}>
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