"use client";

import Link from "next/link";
import { Button, Title, Text, Stack, Center } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';

export default function NotFound() {
  return (
    <Center style={{ minHeight: '100vh', padding: '1rem', textAlign: 'center' }}>
      <Stack align="center" gap="lg">
        <Title
          order={1}
          className="gradient-title"
          style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', marginBottom: 'var(--mantine-spacing-xs)' }}
        >
          404
        </Title>
        <Title order={2} style={{ marginBottom: 'var(--mantine-spacing-xs)' }}>
          Page Not Found
        </Title>
        <Text c="dimmed" maw={500}>
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </Text>
        {/* Corrected Link usage with Mantine Button */}
        <Button
          component={Link} // Use Next.js Link component here
          href="/"
          variant="outline"
          color="gray"
          size="md"
          leftSection={<IconHome size="1.125rem" stroke={1.5} />}
          mt="md"
        >
          Return Home
        </Button>
      </Stack>
    </Center>
  );
}