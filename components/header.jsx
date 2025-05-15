"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Container,
  Group,
  Button,
  Menu,
  Burger,
  Drawer,
  Stack,
  Text,
  UnstyledButton,
  Box,
  Divider,
  ScrollArea,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconLayoutGrid,
  IconFileText,
  IconMailFilled,
  IconMessageCircle,
  IconChevronDown,
  IconStar,
  IconLogin,
  IconUserPlus,
  // IconHome, // IconHome was not used, removed for tidiness
} from '@tabler/icons-react';

// Define navigation links with updated icon sizes
const mainNavLinks = [
  { href: "/dashboard", label: "Industry Insights", icon: <IconLayoutGrid size="1rem" /> },
];

const toolLinks = [
  { href: "/resume", label: "Resume Builder", icon: <IconFileText size="1rem" /> },
  { href: "/ai-cover-letter", label: "AI Cover Letter", icon: <IconMailFilled size="1rem" /> },
  { href: "/interview", label: "Interview Prep", icon: <IconMessageCircle size="1rem" /> },
];

const HEADER_HEIGHT = '4.5rem'; // 72px

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const theme = useMantineTheme();

  useEffect(() => {
    if (!isMobile) {
      closeDrawer();
    }
  }, [isMobile, closeDrawer]);

  const Logo = () => (
    <Link href="/" passHref legacyBehavior>
      <UnstyledButton
        aria-label="Go to homepage"
        style={{ display: 'flex', alignItems: 'center' }}
        onClick={() => { if (isMobile) closeDrawer(); }}
      >
        {isMobile ? (
          <Image src="/logoHead.png" alt="Margdarshak.ai Icon" width={32} height={32} />
        ) : (
          <Image src="/logo2.png" alt="Margdarshak.ai" width={170} height={34} priority /> // Adjusted size slightly for proportion
        )}
      </UnstyledButton>
    </Link>
  );

  // Common button style for desktop nav elements
  const navButtonStyle = (theme) => ({
    root: {
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing.sm,
      height: '2.25rem', // 36px
      color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
      },
      // Ensure active state is subtle or matches hover for Apple-like feel
      // CORRECTED LINE AGAIN: Using the exact suggestion from the error message.
      '&[dataActive="true"]': {
         backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
      }
    },
    label: {
      fontWeight: 500, // Apple uses medium weight for such text
      fontSize: theme.fontSizes.sm,
    },
    section: {
      marginRight: theme.spacing.xs, // Space between icon and text
    }
  });

  const desktopNavItems = (
    <Group gap="xs"> {/* Reduced gap for tighter grouping of nav items */}
      {mainNavLinks.map((link) => (
        <Button
          key={link.label}
          component={Link}
          href={link.href}
          variant="subtle"
          leftSection={link.icon}
          styles={navButtonStyle}
          radius="sm" // Consistent radius
        >
          {link.label}
        </Button>
      ))}
      <Menu
        shadow="md"
        width={230} // Adjusted width slightly
        trigger="hover"
        openDelay={100}
        closeDelay={200}
        radius="md" // Rounded dropdown
        position="bottom-end" // Aligns dropdown to the right of the "Tools" button
        offset={7} // Increased offset for better separation
        transitionProps={{ transition: 'pop-top-right', duration: 150 }}
        withinPortal // CRITICAL for rendering on top
      >
        <Menu.Target>
          <Button
            variant="subtle"
            leftSection={<IconStar size="1rem" />}
            rightSection={<IconChevronDown size="0.9rem" style={{ marginLeft: '0.25rem' }} />}
            styles={navButtonStyle}
            radius="sm"
          >
            Tools
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {toolLinks.map((link) => (
            <Menu.Item
              key={link.label}
              component={Link}
              href={link.href}
              leftSection={link.icon}
              styles={{
                itemLabel: { fontSize: theme.fontSizes.sm },
                itemSection: { marginRight: theme.spacing.xs }, // Consistent icon spacing
              }}
            >
              {link.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Group>
  );

  const mobileNavItems = (
    <Stack gap="xs" p="md">
      <Text size="sm" fw={500} c="dimmed" mb="xs">Navigation</Text>
      {mainNavLinks.map((link) => (
        <Button
          key={link.label}
          component={Link}
          href={link.href}
          variant="subtle"
          color="gray"
          leftSection={link.icon}
          onClick={closeDrawer}
          fullWidth
          justify="start"
          styles={{ label: { flexGrow: 1, fontSize: theme.fontSizes.sm }, root: { height: '2.75rem' } }}
        >
          {link.label}
        </Button>
      ))}
      <Divider my="sm" />
      <Text size="sm" fw={500} c="dimmed" mb="xs">Tools</Text>
      {toolLinks.map((link) => (
        <Button
          key={link.label}
          component={Link}
          href={link.href}
          variant="subtle"
          color="gray"
          leftSection={link.icon}
          onClick={closeDrawer}
          fullWidth
          justify="start"
          styles={{ label: { flexGrow: 1, fontSize: theme.fontSizes.sm }, root: { height: '2.75rem' } }}
        >
          {link.label}
        </Button>
      ))}
    </Stack>
  );

  return (
    <Box
      component="header"
      style={{
        height: HEADER_HEIGHT,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
        // boxShadow: theme.shadows.sm, // Can be removed for a flatter Apple-like header, or kept subtle
      }}
    >
      <Container size="xl" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo /> {/* Logo on the far left */}

        {/* Group for all items on the right: Desktop Nav (conditional), Auth, Mobile Burger (conditional) */}
        <Group gap="sm"> {/* Adjust gap as needed between nav items and auth items */}
          {!isMobile && desktopNavItems} {/* Desktop navigation items */}
          
          <SignedIn>
            <UserButton afterSignOutUrl="/" appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8", // Consistent small avatar
              }
            }}/>
          </SignedIn>
          <SignedOut>
            {/* Using default variant for Sign In for a more standard button look */}
            <Button component={Link} href="/sign-in" variant="default" size="sm" radius="sm">
              Sign In
            </Button>
            {!isMobile && (
                <Button 
                  component={Link} 
                  href="/sign-up" 
                  variant="filled" // Primary action
                  size="sm" 
                  radius="sm"
                  // Example: if your theme's primary color is blue
                  // style={{backgroundColor: theme.colors.blue[6]}} 
                >
                    Sign Up
                </Button>
            )}
          </SignedOut>

          {isMobile && (
            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              aria-label="Toggle navigation"
              color={theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7]}
              size="sm"
            />
          )}
        </Group>
      </Container>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={<Logo />}
        padding="0"
        size={isMobile ? "80%" : "md"}
        position="right"
        zIndex={1200}
        transitionProps={{ transition: 'slide-left', duration: 250, timingFunction: 'ease' }}
        styles={{
            header: { padding: theme.spacing.md, borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}` },
            // body: { paddingTop: 0 } // if mobileNavItems has its own top padding
        }}
      >
        <ScrollArea style={{ height: `calc(100vh - ${HEADER_HEIGHT} - ${theme.spacing.md})` }}> {/* Adjust height based on drawer header */}
          {mobileNavItems}
          <Divider my="sm" />
           <SignedOut>
            <Stack p="md" gap="sm">
                 <Button component={Link} href="/sign-in" variant="default" onClick={closeDrawer} fullWidth radius="sm">
                    Sign In
                </Button>
                <Button component={Link} href="/sign-up" variant="filled" onClick={closeDrawer} fullWidth radius="sm">
                    Sign Up
                </Button>
            </Stack>
           </SignedOut>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}

export default Header;
