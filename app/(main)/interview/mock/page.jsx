// File: app/(main)/interview/mock/page.jsx
"use client"; // Required for useSearchParams

import Link from "next/link";
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { IconArrowLeft } from '@tabler/icons-react';
import { Button, Title, Text, Stack, Container, Center, Loader } from '@mantine/core';
import Quiz from "../_components/quiz";
import { Suspense } from "react"; // For Suspense boundary

function MockInterviewContent() {
    const searchParams = useSearchParams();

    const skills = searchParams.getAll("skill"); // .getAll for multi-value params
    const numQuestionsParam = searchParams.get("numQuestions");
    const difficulty = searchParams.get("difficulty");

    const quizParams = {
        skills: skills.length > 0 ? skills : null, // Pass null if no specific skills selected
        numQuestions: numQuestionsParam ? parseInt(numQuestionsParam, 10) : 10, // Default
        difficulty: difficulty || "Medium", // Default
    };

    return (
        <Container size="lg" py="xl">
            <Stack gap="xl">
                <div>
                    <Button
                        component={Link}
                        href="/interview"
                        variant="subtle"
                        color="gray"
                        leftSection={<IconArrowLeft size="1rem" stroke={1.5} />}
                        px={0}
                        mb="md"
                    >
                        Back to Interview Hub
                    </Button>
                    <Stack gap="xs">
                        <Title order={1} className="gradient-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
                            Mock Interview
                        </Title>
                        <Text c="dimmed">
                            Testing your knowledge in {quizParams.skills ? quizParams.skills.join(', ') : 'your general skills'} at {quizParams.difficulty} difficulty. ({quizParams.numQuestions} questions)
                        </Text>
                    </Stack>
                </div>
                <Quiz quizParams={quizParams} /> {/* Pass params to Quiz component */}
            </Stack>
        </Container>
    );
}


export default function MockInterviewPage() {
    return (
        // Suspense is required by Next.js when using useSearchParams in a page component
        <Suspense fallback={<Center style={{height: '100vh'}}><Loader size="xl" /></Center>}>
            <MockInterviewContent />
        </Suspense>
    );
}