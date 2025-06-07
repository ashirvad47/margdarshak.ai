"use client";

import React from 'react';
import { Paper, Grid, Title, Text, Stack, Group, Divider, Badge } from '@mantine/core';
import { useUser } from "@clerk/nextjs";

// A styled component for section headers (e.g., "EDUCATION")
const SectionHeader = ({ children }) => (
  <Stack gap={4} mb="md">
    <Title order={5} fz="sm" fw={700} c="gray.7" tt="uppercase" letterSpacing="1px">
      {children}
    </Title>
    <Divider size="sm" color="gray.8" />
  </Stack>
);

// A component to render individual entries (experience, education, projects)
const EntryItem = ({ entry }) => (
  <Stack gap={2} mb="md">
    <Group justify="space-between" align="flex-start" wrap="nowrap">
      <Title order={5} fw={600} fz="md" c="gray.9">{entry.title}</Title>
      <Text size="xs" c="dimmed" ta="right" miw="120px">
        {entry.startDate} - {entry.endDate || 'Present'}
      </Text>
    </Group>
    <Text size="sm" fw={500} c="gray.8">{entry.organization}</Text>
    <Text size="sm" c="gray.7" mt="xs" style={{ whiteSpace: 'pre-wrap' }}>
      {entry.description}
    </Text>
  </Stack>
);

export function ResumePreview({ data }) {
  const { user } = useUser();
  const skillsArray = data.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    // Added className="resume-paper" to be targeted by print styles
    <Paper shadow="md" p="xl" radius="md" bg="white" className="resume-paper">
      <Stack ta="center" mb="xl">
        <Title order={1} fz={42} fw={800} c="gray.9">{user?.fullName || 'Your Name'}</Title>
        <Group justify="center" gap="xs" wrap="wrap">
          {data.contactInfo?.email && <Text size="sm" c="dimmed">{data.contactInfo.email}</Text>}
          {data.contactInfo?.mobile && <Text size="sm" c="dimmed">· {data.contactInfo.mobile}</Text>}
          {data.contactInfo?.linkedin && <Text size="sm" c="dimmed">· {data.contactInfo.linkedin}</Text>}
        </Group>
      </Stack>

      {/* Added className="resume-grid" to be targeted by print styles */}
      <Grid gutter="xl" className="resume-grid">
        {/* Left Column */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack>
            {data.education?.length > 0 && (
              <div>
                <SectionHeader>Education</SectionHeader>
                {data.education.map((edu, i) => <EntryItem key={`edu-${i}`} entry={edu} />)}
              </div>
            )}
            {skillsArray.length > 0 && (
              <div>
                <SectionHeader>Skills</SectionHeader>
                <Group gap="xs" wrap="wrap">
                  {skillsArray.map((skill, i) => (
                    <Badge key={`skill-${i}`} variant="light" color="gray" size="md" radius="sm">
                      {skill}
                    </Badge>
                  ))}
                </Group>
              </div>
            )}
          </Stack>
        </Grid.Col>

        {/* Right Column */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack>
            {data.summary && (
              <div>
                <SectionHeader>Professional Summary</SectionHeader>
                <Text size="sm" c="gray.7" style={{ whiteSpace: 'pre-wrap' }}>{data.summary}</Text>
              </div>
            )}
            {data.experience?.length > 0 && (
              <div style={{ marginTop: data.summary ? '2rem' : 0 }}>
                <SectionHeader>Work Experience</SectionHeader>
                {data.experience.map((exp, i) => <EntryItem key={`exp-${i}`} entry={exp} />)}
              </div>
            )}
            {data.projects?.length > 0 && (
              <div style={{ marginTop: data.experience?.length > 0 ? '2rem' : 0 }}>
                <SectionHeader>Projects</SectionHeader>
                {data.projects.map((proj, i) => <EntryItem key={`proj-${i}`} entry={proj} />)}
              </div>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}

export default ResumePreview;