"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  // BriefcaseIcon, // From lucide-react
  // LineChart as LineChartIcon, // From lucide-react, aliased to avoid conflict
  // TrendingUp, // From lucide-react
  // TrendingDown, // From lucide-react
  // Brain, // From lucide-react
} from "lucide-react"; // Commenting out Lucide specific for cards, will use Tabler

import {
    IconBriefcase,
    IconChartLine,
    IconTrendingUp,
    IconTrendingDown,
    IconBrain,
} from '@tabler/icons-react'; // Using Tabler icons for consistency with Mantine

import { format, formatDistanceToNow } from "date-fns";

// Mantine Imports
import {
  Paper, // Using Paper for card-like containers
  Text,
  Title,
  Badge as MantineBadge, // Aliasing to avoid conflict if you had a local Badge
  Progress as MantineProgress, // Aliasing
  SimpleGrid,
  Group,
  Stack,
  useMantineTheme, // To access theme colors for charts etc.
} from '@mantine/core';

const DashboardView = ({ insights }) => {
  const theme = useMantineTheme(); // Hook to access theme

  if (!insights) {
    // Optional: Add a loading state or placeholder if insights might be undefined initially
    return (
      <Paper p="xl" withBorder shadow="sm" ta="center">
        <Text>Loading insights...</Text>
        {/* You could put a Mantine Loader component here */}
      </Paper>
    );
  }

  const salaryData = insights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }));

  const getDemandLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return theme.colors.green[6];
      case "medium":
        return theme.colors.yellow[6];
      case "low":
        return theme.colors.red[6];
      default:
        return theme.colors.gray[5];
    }
  };

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook?.toLowerCase()) {
      case "positive":
        return { Icon: IconTrendingUp, color: theme.colors.green[6] };
      case "neutral":
        return { Icon: IconChartLine, color: theme.colors.yellow[6] };
      case "negative":
        return { Icon: IconTrendingDown, color: theme.colors.red[6] };
      default:
        return { Icon: IconChartLine, color: theme.colors.gray[6] };
    }
  };

  const outlookInfo = getMarketOutlookInfo(insights.marketOutlook);
  const OutlookIcon = outlookInfo.Icon;
  const outlookColor = outlookInfo.color;

  const lastUpdatedDate = insights.lastUpdated ? format(new Date(insights.lastUpdated), "dd MMM yyyy") : 'N/A';
  const nextUpdateDistance = insights.nextUpdate ? formatDistanceToNow(new Date(insights.nextUpdate), { addSuffix: true }) : 'N/A';

  return (
    <Stack gap="lg"> {/* Main container stack */}
      <Group justify="space-between" align="center">
        <MantineBadge variant="outline" color="gray" size="lg">
          Last updated: {lastUpdatedDate}
        </MantineBadge>
        {/* You can add other controls here if needed */}
      </Group>

      {/* Market Overview Cards - Using Mantine Paper and SimpleGrid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <Paper withBorder p="md" radius="md" shadow="sm">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>Market Outlook</Text>
            <OutlookIcon style={{ color: outlookColor }} size="1.2rem" stroke={1.5} />
          </Group>
          <Title order={3}>{insights.marketOutlook || 'N/A'}</Title>
          <Text size="xs" c="dimmed">Next update {nextUpdateDistance}</Text>
        </Paper>

        <Paper withBorder p="md" radius="md" shadow="sm">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>Industry Growth</Text>
            <IconTrendingUp style={{ color: theme.colors.gray[6] }} size="1.2rem" stroke={1.5} />
          </Group>
          <Title order={3}>{(insights.growthRate || 0).toFixed(1)}%</Title>
          <MantineProgress value={insights.growthRate || 0} mt="sm" size="sm" radius="sm" />
        </Paper>

        <Paper withBorder p="md" radius="md" shadow="sm">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>Demand Level</Text>
            <IconBriefcase style={{ color: theme.colors.gray[6] }} size="1.2rem" stroke={1.5} />
          </Group>
          <Title order={3}>{insights.demandLevel || 'N/A'}</Title>
          <div
            style={{
              height: '0.5rem', // 8px
              width: '100%',
              borderRadius: 'var(--mantine-radius-sm)',
              marginTop: 'var(--mantine-spacing-sm)',
              backgroundColor: getDemandLevelColor(insights.demandLevel),
            }}
          />
        </Paper>

        <Paper withBorder p="md" radius="md" shadow="sm">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>Top Skills</Text>
            <IconBrain style={{ color: theme.colors.gray[6] }} size="1.2rem" stroke={1.5} />
          </Group>
          <Group gap="xs" mt="xs" wrap="wrap">
            {(insights.topSkills || []).map((skill) => (
              <MantineBadge key={skill} variant="light" color="gray" size="sm" radius="sm">
                {skill}
              </MantineBadge>
            ))}
            {!(insights.topSkills && insights.topSkills.length > 0) && <Text size="sm" c="dimmed">N/A</Text>}
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Salary Ranges Chart */}
      <Paper withBorder p="md" radius="md" shadow="sm">
        <Stack gap="xs" mb="md">
            <Title order={4}>Salary Ranges by Role</Title>
            <Text size="sm" c="dimmed">
                Displaying minimum, median, and maximum salaries (in thousands)
            </Text>
        </Stack>
        <div style={{ height: '400px' }}> {/* Ensure Recharts has a sized container */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salaryData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}> {/* Adjusted margin */}
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.gray[3]} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: theme.colors.gray[7] }} />
              <YAxis tick={{ fontSize: 12, fill: theme.colors.gray[7] }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.white,
                  borderColor: theme.colors.gray[3],
                  borderRadius: theme.radius.md,
                }}
                labelStyle={{ color: theme.black, fontWeight: 500 }}
              />
              <Bar dataKey="min" fill={theme.colors.gray[3]} name="Min Salary (K)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="median" fill={theme.colors.gray[5]} name="Median Salary (K)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="max" fill={theme.colors.gray[7]} name="Max Salary (K)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      {/* Industry Trends & Recommended Skills */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Paper withBorder p="md" radius="md" shadow="sm">
          <Title order={4} mb="sm">Key Industry Trends</Title>
          <Text size="sm" c="dimmed" mb="md">
            Current trends shaping the industry
          </Text>
          <Stack gap="sm">
            {(insights.keyTrends || []).map((trend, index) => (
              <Group key={index} gap="xs" wrap="nowrap" align="flex-start">
                <div style={{
                  minWidth: '0.5rem', height: '0.5rem', marginTop: '0.3rem',
                  borderRadius: '50%', backgroundColor: 'var(--mantine-color-blue-filled)' // Using Mantine primary color
                }} />
                <Text size="sm">{trend}</Text>
              </Group>
            ))}
            {!(insights.keyTrends && insights.keyTrends.length > 0) && <Text size="sm" c="dimmed">N/A</Text>}
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md" shadow="sm">
          <Title order={4} mb="sm">Recommended Skills</Title>
          <Text size="sm" c="dimmed" mb="md">
            Skills to consider developing
          </Text>
          <Group gap="xs" wrap="wrap">
            {(insights.recommendedSkills || []).map((skill) => (
              <MantineBadge key={skill} variant="outline" color="gray" size="sm" radius="sm">
                {skill}
              </MantineBadge>
            ))}
            {!(insights.recommendedSkills && insights.recommendedSkills.length > 0) && <Text size="sm" c="dimmed">N/A</Text>}
          </Group>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
};

export default DashboardView;