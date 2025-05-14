"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Paper, Title, Text, Stack, useMantineTheme } from '@mantine/core';

export default function PerformanceChart({ assessments }) {
  const theme = useMantineTheme();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (assessments) {
      const formattedData = assessments.map((assessment) => ({
        date: format(new Date(assessment.createdAt), "MMM dd"),
        score: assessment.quizScore,
      })).sort((a, b) => new Date(a.date) - new Date(b.date)); // Ensure data is sorted by date
      setChartData(formattedData);
    }
  }, [assessments]);

  return (
    <Paper withBorder p="lg" radius="md" shadow="sm">
      <Stack gap="xs" mb="lg">
        <Title order={3} className="gradient-title">Performance Trend</Title>
        <Text size="sm" c="dimmed">Your quiz scores over time</Text>
      </Stack>
      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.gray[3]} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: theme.colors.gray[7] }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: theme.colors.gray[7] }} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.white,
                borderColor: theme.colors.gray[3],
                borderRadius: theme.radius.md,
                boxShadow: theme.shadows.sm,
              }}
              labelStyle={{ color: theme.black, fontWeight: 500 }}
              itemStyle={{ color: theme.primaryColor }} // Use theme's primary color for line
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={theme.colors[theme.primaryColor][6]} // Use primary color from theme
              strokeWidth={2}
              dot={{ r: 4, fill: theme.colors[theme.primaryColor][6] }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
}