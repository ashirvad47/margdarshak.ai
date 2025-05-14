"use client"; // If any client-side logic or hooks are used (even for styling)

import React from 'react';
import { IconBrain, IconTargetArrow, IconTrophy } from '@tabler/icons-react';
import { Paper, Text, Title, Group, SimpleGrid } from '@mantine/core';

export default function StatsCards({ assessments }) {
  const getAverageScore = () => { /* ... (no change) ... */ };
  const getLatestAssessment = () => { /* ... (no change) ... */ };
  const getTotalQuestions = () => { /* ... (no change) ... */ };

  const stats = [
    { title: "Average Score", Icon: IconTrophy, value: `${getAverageScore()}%`, description: "Across all assessments" },
    { title: "Questions Practiced", Icon: IconBrain, value: getTotalQuestions(), description: "Total questions" },
    { title: "Latest Score", Icon: IconTargetArrow, value: `${getLatestAssessment()?.quizScore.toFixed(1) || 0}%`, description: "Most recent quiz" },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
      {stats.map((stat, index) => (
        <Paper key={index} withBorder p="md" radius="md" shadow="sm">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>{stat.title}</Text>
            <stat.Icon size="1.2rem" stroke={1.5} style={{ color: 'var(--mantine-color-gray-6)' }} />
          </Group>
          <Title order={3}>{stat.value}</Title>
          <Text size="xs" c="dimmed">{stat.description}</Text>
        </Paper>
      ))}
    </SimpleGrid>
  );
}