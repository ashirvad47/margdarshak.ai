"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Paper,
  Container,
  SimpleGrid,
  Title,
  Text,
  Stack,
  Anchor,
  Group,
  ActionIcon,
  Divider,
} from '@mantine/core';
import { IconBrandLinkedin, IconBrandX, IconBrandYoutube } from '@tabler/icons-react';

const footerSections = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Contact Us', href: '/contact-us' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms & Conditions', href: '/terms-and-conditions' },
    ],
  },
  {
    title: 'Core Tools',
    links: [
      { label: 'Industry Insights', href: '/dashboard' },
      { label: 'Resume Builder', href: '/resume' },
      { label: 'AI Cover Letter', href: '/ai-cover-letter' },
      { label: 'Interview Prep', href: '/interview' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '#' },
      { label: 'Success Stories', href: '#' },
      { label: 'FAQs', href: '#' },
      { label: 'Support', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <Paper
      component="footer"
      radius={0}
      p={{ base: 'lg', md: 'xl' }}
      mt="xl"
      bg="var(--mantine-color-gray-0)"
      style={{ borderTop: `1px solid var(--mantine-color-gray-2)` }}
    >
      <Container size="xl">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 'lg', md: 'xl' }}>
          {/* Logo and Description Section */}
          <Stack>
            <Link href="/" passHref>
              <Image src="/logo2.png" alt="Margdarshak.ai" width={170} height={34} />
            </Link>
            <Text size="sm" c="dimmed" mt="sm">
              Your AI-powered guide to navigating the complexities of the professional world and achieving career success.
            </Text>
            <Group gap="xs" mt="md">
              <ActionIcon component="a" href="#" variant="subtle" color="gray" radius="xl">
                <IconBrandLinkedin size="1.2rem" />
              </ActionIcon>
              <ActionIcon component="a" href="#" variant="subtle" color="gray" radius="xl">
                <IconBrandX size="1.2rem" />
              </ActionIcon>
              <ActionIcon component="a" href="#" variant="subtle" color="gray" radius="xl">
                <IconBrandYoutube size="1.2rem" />
              </ActionIcon>
            </Group>
          </Stack>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <Stack key={section.title}>
              <Title order={5} fw={600}>{section.title}</Title>
              <Stack gap="xs" mt="sm">
                {section.links.map((link) => (
                  <Anchor
                    key={link.label}
                    component={Link}
                    href={link.href}
                    c="dimmed"
                    size="sm"
                    style={{ textDecoration: 'none' }}
                    className="hover:text-primary"
                  >
                    {link.label}
                  </Anchor>
                ))}
              </Stack>
            </Stack>
          ))}
        </SimpleGrid>

        <Divider my="xl" />

        <Text c="dimmed" size="xs" ta="center">
          © {new Date().getFullYear()} Margdarshak.ai. All Rights Reserved.
        </Text>
      </Container>
    </Paper>
  );
}

export default Footer;