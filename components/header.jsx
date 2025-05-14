"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Import useClerk from Clerk
import { SignedIn, SignedOut, UserButton, useClerk } from "@clerk/nextjs";

import { Button as MantineButton, Menu, ActionIcon, Group, Box } from '@mantine/core';
import {
  IconLayoutDashboard,
  IconFileText,
  IconPencil,
  IconSchool,
  IconChevronDown,
  IconStar,
  IconLogin,
} from '@tabler/icons-react';

export default function Header() {
  // Destructure openSignIn from the useClerk hook
  const { openSignIn } = useClerk();

  return (
    <Box
      component="header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        borderBottom: '1px solid var(--mantine-color-gray-3)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1050,
        height: '64px',
      }}
    >
      <Group
        justify="space-between"
        align="center"
        style={{ height: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 var(--mantine-spacing-md)' }}
      >
        <Link href="/" passHref>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', cursor: 'pointer' }}>
            <Image
              src={"/logo.png"}
              alt="Sensai Logo"
              width={130}
              height={36}
              style={{ objectFit: 'contain', display: 'block' }}
              priority
            />
          </div>
        </Link>

        <Group gap="sm">
          <SignedIn>
            <MantineButton
              component={Link}
              href="/dashboard"
              variant="subtle"
              color="gray"
              leftSection={<IconLayoutDashboard size="1rem" stroke={1.5} />}
              className="hidden md:inline-flex"
            >
              Industry Insights
            </MantineButton>
            <ActionIcon
              component={Link}
              href="/dashboard"
              variant="subtle"
              color="gray"
              className="md:hidden"
              aria-label="Dashboard"
            >
              <IconLayoutDashboard size="1.2rem" stroke={1.5} />
            </ActionIcon>

            <Menu shadow="md" width={220} position="bottom-end" offset={8} trigger="hover" openDelay={100} closeDelay={200}>
              <Menu.Target>
                <MantineButton
                  variant="light"
                  color="gray"
                  rightSection={<IconChevronDown size="1rem" stroke={1.5} />}
                  leftSection={<IconStar size="1rem" stroke={1.5} />}
                >
                  <span className="hidden md:inline">Growth Tools</span>
                  <span className="md:hidden">Tools</span>
                </MantineButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item component={Link} href="/resume" leftSection={<IconFileText size="1rem" stroke={1.5} />}>
                  Build Resume
                </Menu.Item>
                <Menu.Item component={Link} href="/ai-cover-letter" leftSection={<IconPencil size="1rem" stroke={1.5} />}>
                  Cover Letter
                </Menu.Item>
                <Menu.Item component={Link} href="/interview" leftSection={<IconSchool size="1rem" stroke={1.5} />}>
                  Interview Prep
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </SignedIn>

          <SignedOut>
            {/* Use your MantineButton and call openSignIn on click */}
            <MantineButton
              variant="default"
              color="gray"
              leftSection={<IconLogin size="1rem" stroke={1.5} />}
              onClick={() => openSignIn()} // This will trigger the Clerk sign-in modal
            >
              Sign In
            </MantineButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </Group>
      </Group>
    </Box>
  );
}