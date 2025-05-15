"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Title, Text, Group, Stack, Center, Box } from '@mantine/core';
import { IconPlayerPlay, IconBrandYoutube } from '@tabler/icons-react';
import { Particles } from "@/components/magicui/particles";
import { useTheme } from "next-themes";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

const languages = [
  { text: "Margdarshak", lang: "en" },
  { text: "ମାର୍ଗଦର୍ଶକ", lang: "or" },
  { text: "मार्गदर्शक", lang: "hi" },
  { text: "মার্গदर्शक", lang: "bn" },
  { text: "మార్గదర్శక్", lang: "te" },
  { text: "மார்கதர்ஷக்", lang: "ta" },
  { text: "માર્ગદર્શક", lang: "gu" },
  { text: "ಮಾರ್ಗದರ್ಶಕ", lang: "kn" },
  { text: "മാർഗ്ഗദർശക്", lang: "ml" },
  { text: "ਮਾਰਗਦਰਸ਼ਕ", lang: "pa" },
];

const TITLE_LINE_HEIGHT_FACTOR = 1.1;

const NEW_MARGDARSHAK_COLOR = "#1C2D4A";
const NEW_AI_COLOR = "#F4C542"; // Golden Yellow
const NEW_PARTICLE_COLOR_LIGHT_THEME = "#7EC6C3";
const NEW_PARTICLE_COLOR_DARK_THEME = "#F0F0F0";

// YouTube Button Colors
const YOUTUBE_RED_FILL = "#FF0033"; 
const YOUTUBE_INITIAL_TEXT_COLOR_CLASS = "text-neutral-800"; 
const YOUTUBE_HOVER_TEXT_COLOR_CLASS = "text-white"; 
// THIS IS THE ONLY MODIFIED LINE FROM YOUR ORIGINAL FILE:
const YOUTUBE_INITIAL_BORDER_COLOR_CLASS = "border-gray-300"; // Was "border-neutral-400"


const HeroSection = () => {
  const imageRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const [particleColor, setParticleColor] = useState(NEW_PARTICLE_COLOR_LIGHT_THEME);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const margdarshakColor = NEW_MARGDARSHAK_COLOR;
  const aiColor = NEW_AI_COLOR;

  useEffect(() => {
    setParticleColor(resolvedTheme === "dark" ? NEW_PARTICLE_COLOR_DARK_THEME : NEW_PARTICLE_COLOR_LIGHT_THEME);
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

  useEffect(() => {
    const intervalTime = 2500;

    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % languages.length);
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <style jsx>{`
        .margdarshak-slot {
          display: inline-block;
          text-align: right;
          vertical-align: top; 
          position: relative;
          height: calc(1em * ${TITLE_LINE_HEIGHT_FACTOR}); 
          line-height: calc(1em * ${TITLE_LINE_HEIGHT_FACTOR}); 
          overflow: hidden;
          width: max-content; 
          grid-template-columns:
              repeat(auto‑fit, minmax(180px, 1fr));
        }

        .animated-word {
          display: inline-block;
          animation: slideInUpFromBottom 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          will-change: transform, opacity;
          color: var(--margdarshak-color); 
          vertical-align: top; 
        }

        @keyframes slideInUpFromBottom {
          0% {
            opacity: 0;
            transform: translateY(100%);
          }
          100% {
            opacity: 1;
            transform: translateY(0%);
          }
        }
      `}</style>

      <section className="relative w-full pt-10 md:pt-12 pb-10 overflow-hidden overflow-x-hidden">
        <Particles
          className="absolute inset-0 z-0"
          quantity={200}
          ease={80}
          color={particleColor}
          refresh
        />

        <Center className="relative z-10">
          <Stack gap="xl" align="center" style={{ maxWidth: '800px' }}>
            <Title
              order={1}
              ta="center"
              style={{
                fontSize: 'clamp(4rem, 8.5vw, 7.5rem)',
                lineHeight: TITLE_LINE_HEIGHT_FACTOR,
                fontWeight: 700,
                letterSpacing: '-0.025em',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                flexWrap: 'nowrap',
              }}
            >
              <Box
                component="span"
                className="margdarshak-slot"
                style={{ '--margdarshak-color': margdarshakColor }}
              >
                <span
                  key={currentWordIndex}
                  className="animated-word"
                  lang={languages[currentWordIndex].lang}
                >
                  {languages[currentWordIndex].text}
                </span>
              </Box>
              <span
                style={{
                  color: aiColor,
                  lineHeight: '1', 
                }}
              >
                .ai
              </span>
            </Title>

            <Title
              order={2}
              ta="center"
              style={{
                fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)',
                lineHeight: 1.35,
                fontWeight: 500,
                marginTop: 'var(--mantine-spacing-sm)',
                maxWidth: '700px',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
              }}
            >
              Your AI Career Coach for Professional Success
            </Title>

            <Text
              size="lg"
              c="dimmed"
              ta="center"
              maw={600}
              mt="md"
              style={{ lineHeight: 1.65 }}
            >
              Advance your career with personalized guidance, interview prep, and
              AI-powered tools for job success.
            </Text>

            <Group justify="center" gap="md" mt="lg">
              <Link href="/dashboard" passHref>
                <InteractiveHoverButton
                  initialTextColorClass="text-[#1C2D4A]"
                  hoverTextColorClass="text-[#F4C542]"
                  fillColor="#1C2D4A"
                  borderColorClass="border-gray-300"
                >
                  Get Started
                </InteractiveHoverButton>
              </Link>

              <Link href="https://www.youtube.com/" passHref> {/* Replace with actual YouTube link */}
                <InteractiveHoverButton
                  fillColor={YOUTUBE_RED_FILL}
                  initialTextColorClass={YOUTUBE_INITIAL_TEXT_COLOR_CLASS}
                  hoverTextColorClass={YOUTUBE_HOVER_TEXT_COLOR_CLASS}
                  borderColorClass={YOUTUBE_INITIAL_BORDER_COLOR_CLASS} // Uses the corrected border class
                  initialBgColorClass="bg-transparent"
                  icon={(props) => <IconPlayerPlay {...props} fill="white" />} 
                  hoverIcon={(props) => <IconBrandYoutube {...props} fill="white" />}
                  showArrow={false}
                >
                  Watch Demo
                </InteractiveHoverButton>
              </Link>
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
    </>
  );
};

export default HeroSection;