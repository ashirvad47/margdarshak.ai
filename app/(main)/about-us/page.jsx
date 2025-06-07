"use client";

import { Container, Title, Text, Stack, SimpleGrid, Card, Image, Group, Paper, Center, Divider, Anchor } from '@mantine/core';
import Link from 'next/link';

const teamMembers = [
  { name: 'Swayam Patnaik', reg: '2141016182', image: '/swayam.jpg', contribution: 'Lead, Backend & AI Integration' },
  { name: 'Ashirvad Samanta', reg: '2141019189', image: '/ashirvad.jpg', contribution: 'Project Lead, Frontend & UI/UX' },
  { name: 'Soumyajit Mohanty', reg: '2141013235', image: '/soumya.jpg', contribution: 'Lead, Database & Systems' },
  { name: 'K. Nikhil', reg: '2141014124', image: '/nikhil.jpg', contribution: 'Lead, Research & ML Models' },
];

const TeamMemberCard = ({ member }) => (
    // Make the card a flex container that fills the height of its grid cell
    <Card withBorder radius="md" p="xl" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Card.Section>
             <Image
                src={member.image}
                height={280} // Increased height slightly for better visuals
                alt={member.name}
                fit="cover" // Ensures image covers the area, preventing size differences
             />
        </Card.Section>

        {/* This stack will now grow to fill the remaining space in the card */}
        <Stack mt="md" align="center" ta="center" gap="xs" style={{ flexGrow: 1 }}>
            <div style={{ flexGrow: 1 }}>
                <Title order={4} fw={600}>{member.name}</Title>
                <Text size="sm" mt="xs" fw={500}>{member.contribution}</Text>
            </div>
            <Text size="sm" c="dimmed">({member.reg})</Text>
        </Stack>
    </Card>
);

const MentorCard = () => (
    <Paper withBorder p="xl" radius="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" align="center">
            <Image
                radius="md"
                src="/ramaranjan.jpg"
                alt="Dr. Rama Ranjan Panda"
                fit="cover"
                height={300}
            />
            <Stack>
                <Title order={3}>Our Guiding Light</Title>
                <Title order={4} fw={700} c="dimmed">Dr. Rama Ranjan Panda</Title>
                <Text fw={500}>Project Supervisor</Text>
                <Text size="sm" c="dimmed" mt="md">
                    We extend our deepest gratitude to Dr. Panda for his invaluable mentorship, unwavering support, and profound insights that guided this project from conception to completion. His expertise was the cornerstone of our success.
                </Text>
            </Stack>
        </SimpleGrid>
    </Paper>
);


export default function AboutUsPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={1} ta="center" className="gradient-title">
          About Margdarshak.ai
        </Title>
        <Center>
            <Image src="/soa_logo.png" alt="Siksha 'O' Anusandhan" w="auto" h={120} fit="contain" />
        </Center>
        <Text c="dimmed" ta="center" size="lg" maw={700} mx="auto">
          Margdarshak.ai is the result of a final year research project by a dedicated team of students from the Institute of Technical Education and Research (ITER), Siksha 'O' Anusandhan, Bhubaneswar.
        </Text>

        <Divider my="lg" label="Project Supervisor" labelPosition="center" />
        <MentorCard />

        <Divider my="lg" label="The Development Team" labelPosition="center" />
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
            {teamMembers.map((member) => (
                <TeamMemberCard key={member.reg} member={member} />
            ))}
        </SimpleGrid>

        <Divider my="lg" label="Learn More" labelPosition="center" />
        <Group justify="center" gap="xl">
            <Anchor component={Link} href="#" size="sm" c="blue" style={{ textDecoration: 'none' }}>
                Read our Research Paper
            </Anchor>
            <Anchor component={Link} href="#" size="sm" c="teal" style={{ textDecoration: 'none' }}>
                Explore the Project Report
            </Anchor>
        </Group>
      </Stack>
    </Container>
  );
}