"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Title, Text, Group, Stack, Center } from '@mantine/core'; // Mantine components
import { IconPlayerPlay, IconArrowRight } from '@tabler/icons-react'; // Tabler icons

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return; // Guard clause

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100; // Adjust as needed

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
    <section className="w-full pt-28 md:pt-36 pb-10"> {/* Adjusted padding slightly */}
      <Center>
        <Stack gap="xl" align="center" style={{ maxWidth: '800px' }}> {/* Using Stack for centered content */}
          <Title
            order={1}
            ta="center"
            className="gradient-title" // Keep your cool gradient title style
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', // Responsive font size
              lineHeight: 1.2,
            }}
          >
            Your AI Career Coach for
            <br />
            Professional Success
          </Title>

          <Text
            size="lg" // Mantine size prop
            c="dimmed" // Mantine color prop for dimmed text
            ta="center"
            maw={600} // Max width
          // className="mx-auto max-w-[600px] text-muted-foreground md:text-xl" // Replaced by Mantine props
          >
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </Text>

          <Group justify="center" gap="md" mt="lg">
            <Button
              component={Link}           // Render the Button as a Next.js Link
              href="/dashboard"          // Target URL
              size="lg"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
              rightSection={<IconArrowRight size="1.125rem" />}
            >
             Get Started
            </Button>
             
              <Button
                component={Link} // Render the Button as a Next.js Link
                href="\petition-to-add-alakh-sir-in-jeeneetards-banner-v0-msas9ieqbgjd1.webp"
                size="lg"
                variant="outline" // Mantine outline button
                color="gray" // Neutral color for outline
                leftSection={<IconPlayerPlay size="1.125rem" />}
              >
                Watch Demo
              </Button>
            
          </Group>

          <div className="hero-image-wrapper mt-10 md:mt-12 w-full"> {/* Ensure wrapper takes width */}
            <div ref={imageRef} className="hero-image">
              <Image
                src="/banner.jpeg" // Ensure this path is correct in your public folder
                width={1280}
                height={720}
                alt="Dashboard Preview"
                style={{
                  borderRadius: 'var(--mantine-radius-lg)', // Use Mantine radius
                  boxShadow: 'var(--mantine-shadow-xl)',    // Use Mantine shadow
                  border: '1px solid var(--mantine-color-gray-3)',
                  maxWidth: '100%', // Ensure image is responsive
                  height: 'auto', // Maintain aspect ratio
                  margin: '0 auto', // Center the image
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