// app/(main)/interview/_components/quiz-result.jsx
import React from 'react';
import { IconTrophy, IconCircleCheckFilled, IconCircleXFilled, IconInfoCircle, IconPlayerPlay } from '@tabler/icons-react';
import { Button, Paper, Text, Title, Group, Stack, Progress as MantineProgress, Alert, ScrollArea, Box, useMantineTheme, alpha } from '@mantine/core';

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  const theme = useMantineTheme();

  if (!result) return null;

  return (
    <Paper shadow="none" p={0} radius="md" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Changed Paper to be a flex container to allow child Stack to control height distribution */}
      <Stack gap="xl" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* These items will take their natural height */}
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

        {/* This Box should take up the remaining vertical space */}
        <Box style={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Title order={4} mb="md">Question Review</Title>
          {/* ScrollArea should fill this flexible Box */}
          <ScrollArea
            style={{ flexGrow: 1 }} // Make ScrollArea fill the parent Box
            // mah={400} // You can keep mah if you want an absolute max regardless of Box size
            // mih={200} // And mih
            type="auto"
            offsetScrollbars
            scrollbarSize={8}
          >
            <Stack gap="md" p="xs"> {/* Added some padding inside scroll area for better spacing */}
              {(result.questions || []).map((q, index) => (
                <Paper
                  key={index}
                  withBorder
                  p="md"
                  radius="sm"
                  bg={
                         q.isCorrect
                            ? alpha(theme.colors.green[1], 0.5)
                            : alpha(theme.colors.red[1], 0.5)
                        }
                >
                  <Stack gap="sm">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Text fw={500} flex={1} component="div">
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
                            marginLeft: '2px'
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