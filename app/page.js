"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

// Mantine Imports
import { Button, Card, Accordion, Title, Text, SimpleGrid, Center, ThemeIcon, Container, Paper, Group } from '@mantine/core';
import { IconArrowRight, IconUserPlus, IconFileDescription, IconUsers, IconChartLine } from '@tabler/icons-react';

// Data imports
import HeroSection from "@/components/hero";
import { TextReveal } from "@/components/magicui/text-reveal";
import { NumberTicker } from "@/components/magicui/number-ticker"; // Import the new component
import { features } from "@/data/features";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";
import { howItWorks } from "@/data/howItWorks";

const updatedFeatures = features.map(feature => {
  let IconComponent = IconChartLine;
  if (feature.title.includes("Guidance")) IconComponent = IconUserPlus;
  if (feature.title.includes("Interview")) IconComponent = IconUsers;
  if (feature.title.includes("Resume")) IconComponent = IconFileDescription;
  return { ...feature, icon: <IconComponent size="2.5rem" stroke={1.5} /> };
});

const updatedHowItWorks = howItWorks.map(item => {
  let IconComponent = IconChartLine;
  if (item.title.includes("Onboarding")) IconComponent = IconUserPlus;
  if (item.title.includes("Documents")) IconComponent = IconFileDescription;
  if (item.title.includes("Interviews")) IconComponent = IconUsers;
  return { ...item, icon: <IconComponent size="2rem" stroke={1.5} /> };
});


export default function LandingPage() {
  return (
    <>
      <style jsx>{`
        .banner-and-slogan-section {
          position: relative;
          width: 100%;
          background-image: url('/banner.jpg');
          background-size: cover;
          background-position: center center;
          background-attachment: fixed; /* Creates a parallax-like effect */
        }
      `}</style>
      <div className="grid-background"></div>

      <HeroSection />

      <section className="banner-and-slogan-section">
        <TextReveal>
          Don't just chase a career. Let the perfect one chase you.
        </TextReveal>
      </section>

      {/* Features Section */}
      <Container size="lg" py="xl">
        <Title order={2} ta="center" mb="xl">
          Powerful Features for Your Career Growth
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {updatedFeatures.map((feature, index) => (
            <Paper key={index} p="lg" shadow="sm" withBorder radius="md" style={{ transition: 'border-color 0.3s ease' }} className="hover:border-blue-500">
              <Center style={{ flexDirection: 'column' }}>
                <ThemeIcon variant="light" size="xl" radius="md" mb="md" color="gray">
                  {feature.icon}
                </ThemeIcon>
                <Title order={4} mb="xs" ta="center">{feature.title}</Title>
                <Text c="dimmed" ta="center" size="sm">
                  {feature.description}
                </Text>
              </Center>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>

      {/* Stats Section - MODIFIED */}
      <Paper withBorder={false} py="xl" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Container size="md">
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing="xl">
            {[
              { label: "Industries Covered", value: "100+" },
              { label: "Interview Questions", value: "1M+" },
              { label: "Success Rate", value: "95%" },
              { label: "AI Support", value: "24/7" },
            ].map((stat, index) => {
              let numericValue = null;
              let suffix = '';
              let isTickerEligible = false;

              if (stat.value === '24/7') {
                numericValue = 24;
                suffix = '/7';
                isTickerEligible = true;
              } else {
                const numberMatch = stat.value.match(/^[\d,.]+/);
                if (numberMatch) {
                  let parsedNumber = parseFloat(numberMatch[0].replace(/,/g, ''));
                  let tempSuffix = stat.value.substring(numberMatch[0].length);

                  if (tempSuffix.toLowerCase().startsWith('m')) {
                    parsedNumber *= 1000000;
                    tempSuffix = tempSuffix.substring(1);
                  }
                  
                  numericValue = parsedNumber;
                  suffix = tempSuffix;
                  isTickerEligible = true;
                }
              }

              return (
                <Center key={index} style={{ flexDirection: 'column' }}>
                  {isTickerEligible ? (
                    <Title order={2} className="flex items-baseline justify-center">
                      <NumberTicker value={numericValue} />
                      <span>{suffix}</span>
                    </Title>
                  ) : (
                    <Title order={2}>{stat.value}</Title>
                  )}
                  <Text c="dimmed" size="sm">{stat.label}</Text>
                </Center>
              );
            })}
          </SimpleGrid>
        </Container>
      </Paper>

      {/* How It Works Section */}
      <Container size="lg" py="xl">
        <Title order={2} ta="center" mb="sm">How It Works</Title>
        <Text ta="center" c="dimmed" mb="xl" maw={600} mx="auto">
          Four simple steps to accelerate your career growth
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
          {updatedHowItWorks.map((item, index) => (
            <Center key={index} style={{ flexDirection: 'column', textAlign: 'center' }}>
              <ThemeIcon variant="light" size={64} radius="xl" mb="md" color="gray">
                 {item.icon}
              </ThemeIcon>
              <Title order={4} mb="xs">{item.title}</Title>
              <Text c="dimmed" size="sm">{item.description}</Text>
            </Center>
          ))}
        </SimpleGrid>
      </Container>

      {/* Testimonials Section */}
      <Paper withBorder={false} py="xl" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Container size="lg">
          <Title order={2} ta="center" mb="xl">
            What Our Users Say
          </Title>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {testimonial.map((testimonial, index) => (
              <Card key={index} shadow="sm" p="lg" radius="md" withBorder>
                <Group wrap="nowrap" align="flex-start" mb="md">
                  <Image
                    width={48}
                    height={48}
                    src={testimonial.image}
                    alt={testimonial.author}
                    style={{ borderRadius: '50%', border: '2px solid var(--mantine-color-gray-3)' }}
                  />
                  <div>
                    <Text fw={500}>{testimonial.author}</Text>
                    <Text size="sm" c="dimmed">{testimonial.role}</Text>
                    <Text size="sm" c="blue">
                      {testimonial.company}
                    </Text>
                  </div>
                </Group>
                <Text c="dimmed" fz="sm" lineClamp={5} component="blockquote" pl="xl" style={{ fontStyle: 'italic', position: 'relative' }}>
                  <Text span size="3xl" style={{ position: 'absolute', left: 0, top: -10, color: 'var(--mantine-color-blue-5)' }}>“</Text>
                  {testimonial.quote}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Paper>

      {/* FAQ Section */}
      <Container size="md" py="xl">
        <Title order={2} ta="center" mb="sm">Frequently Asked Questions</Title>
        <Text ta="center" c="dimmed" mb="xl" maw={600} mx="auto">
          Find answers to common questions about our platform
        </Text>
        <Accordion variant="separated" radius="md">
          {faqs.map((faq, index) => (
            <Accordion.Item key={index} value={`faq-${index}`}>
              <Accordion.Control>{faq.question}</Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" c="dimmed">{faq.answer}</Text>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>

      {/* CTA Section */}
      <Paper py={80} className="gradient">
        <Container size="sm" ta="center">
          <Title order={2} mb="md" style={{ color: 'var(--mantine-color-white)'}}>
            Ready to Accelerate Your Career?
          </Title>
          <Text mb="xl" maw={600} mx="auto" style={{ color: 'var(--mantine-color-gray-3)'}}>
            Join thousands of professionals who are advancing their careers with AI-powered guidance.
          </Text>
          <Link href="/dashboard" passHref>
            <Button
              size="lg"
              variant="white"
              rightSection={<IconArrowRight size="1rem" stroke={1.5} />}
              className="h-11 mt-5 animate-bounce"
            >
              Start Your Journey Today
            </Button>
          </Link>
        </Container>
      </Paper>
    </>
  );
}