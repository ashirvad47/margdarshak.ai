"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Title, Text, Group, Stack, Center } from '@mantine/core';
import { IconPlayerPlay, IconArrowRight } from '@tabler/icons-react';
import { Particles } from "@/components/magicui/particles";
import { useTheme } from "next-themes";

const HeroSection = () => {
  const imageRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    setColor(resolvedTheme === "dark" ? "#ffffff" : "#000000");
  }, [resolvedTheme]);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative w-full pt-28 md:pt-36 pb-10 overflow-hidden">
      {/* Particles background */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={200}
        ease={80}
        color={color}
        refresh
      />
      
      {/* Content */}
      <Center className="relative z-10">
        <Stack gap="xl" align="center" style={{ maxWidth: '800px' }}>
          <Title
            order={1}
            ta="center"
            className="gradient-title"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              lineHeight: 1.2,
            }}
          >
            Your AI Career Coach for
            <br />
            Professional Success
          </Title>

          <Text
            size="lg"
            c="dimmed"
            ta="center"
            maw={600}
          >
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </Text>

          <Group justify="center" gap="md" mt="lg">
            <Button
              component={Link}
              href="/dashboard"
              size="lg"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
              rightSection={<IconArrowRight size="1.125rem" />}
            >
              Get Started
            </Button>
             
            <Button
              component={Link}
              href="/demo"
              size="lg"
              variant="outline"
              color="gray"
              leftSection={<IconPlayerPlay size="1.125rem" />}
            >
              Watch Demo
            </Button>
          </Group>

          <div className="hero-image-wrapper mt-10 md:mt-12 w-full">
            <div ref={imageRef} className="hero-image">
              <Image
                src="/banner.jpeg"
                width={1280}
                height={720}
                alt="Dashboard Preview"
                style={{
                  borderRadius: 'var(--mantine-radius-lg)',
                  boxShadow: 'var(--mantine-shadow-xl)',
                  border: '1px solid var(--mantine-color-gray-3)',
                  maxWidth: '100%',
                  height: 'auto',
                  margin: '0 auto',
                }}
                priority
              />
            </div>
          </div>
        </Stack>
      </Center>
    </section>
  );
};

export default HeroSection;