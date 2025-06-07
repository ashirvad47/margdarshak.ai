// File: app/(main)/interview/page.jsx
"use client"; // This page now has client-side interaction for form

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container, Title, Text, Stack, Paper, Button, Group,
    MultiSelect, Select, Slider, NumberInput, LoadingOverlay, Alert, Center
} from '@mantine/core';
import { IconPlayerPlay, IconSettings, IconListCheck, IconAlertCircle } from '@tabler/icons-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useFetch from '@/hooks/use-fetch';
import { getAssessments, getUserSkillsForQuiz } from "@/actions/interview"; // Added getUserSkillsForQuiz
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list"; // To display past quizzes

// Zod schema for the quiz configuration form
const quizConfigSchema = z.object({
    selectedSkills: z.array(z.string()).min(0, "Select at least one skill or choose 'All My Skills' effectively by leaving empty"), // Allow empty for "All My Skills"
    numQuestions: z.number().min(5, "Minimum 5 questions").max(50, "Maximum 50 questions"), // Adjusted max for sanity
    difficulty: z.string().min(1, "Difficulty is required"),
});

export default function InterviewPrepPage() {
    const router = useRouter();
    const [userSkills, setUserSkills] = useState([]);
    const [initialAssessments, setInitialAssessments] = useState([]);
    const [isLoadingPageData, setIsLoadingPageData] = useState(true);

    const { loading: loadingSkills, error: skillsError, fn: fetchUserSkills } = useFetch(getUserSkillsForQuiz);
    const { loading: loadingAssessments, error: assessmentsError, fn: fetchAssessments } = useFetch(getAssessments);


    const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm({
        resolver: zodResolver(quizConfigSchema),
        defaultValues: {
            selectedSkills: [],
            numQuestions: 10,
            difficulty: "Medium",
        },
    });

    const selectedSkillsWatcher = watch("selectedSkills");

    useEffect(() => {
        async function loadData() {
            setIsLoadingPageData(true);
            const [skillsResult, assessmentsResult] = await Promise.all([
                fetchUserSkills(),
                fetchAssessments()
            ]);
            if (skillsResult) setUserSkills(skillsResult.map(skill => ({ value: skill, label: skill })));
            if (assessmentsResult) setInitialAssessments(assessmentsResult);
            setIsLoadingPageData(false);
        }
        loadData();
    }, [fetchUserSkills, fetchAssessments]);


    const onSubmitQuizConfig = (data) => {
        const params = new URLSearchParams();
        if (data.selectedSkills.length > 0) {
            data.selectedSkills.forEach(skill => params.append("skill", skill));
        }
        params.append("numQuestions", data.numQuestions.toString());
        params.append("difficulty", data.difficulty);
        router.push(`/interview/mock?${params.toString()}`);
    };
    
    const difficultyOptions = [
        { value: "Easy", label: "Easy" },
        { value: "Medium", label: "Medium" },
        { value: "Hard", label: "Hard" },
        { value: "Expert", label: "Expert (Very Challenging)" },
    ];

    const numQuestionsMarks = [
        { value: 5, label: '5' },
        { value: 10, label: '10' },
        { value: 15, label: '15' },
        { value: 20, label: '20' },
        { value: 25, label: '25' },
        { value: 30, label: '30 (Max)' }, // Max 30 for practical limits
    ];


    if (isLoadingPageData) {
        return <Container size="lg" py="xl"><Center><LoadingOverlay visible /></Center></Container>;
    }
     if (skillsError || assessmentsError) {
        return (
            <Container size="lg" py="xl">
                <Alert icon={<IconAlertCircle size="1rem" />} title="Error Loading Data" color="red" radius="md">
                    There was an error loading necessary data for the interview preparation page. Please try refreshing.
                    {skillsError && <Text size="sm">Skills Error: {skillsError.message}</Text>}
                    {assessmentsError && <Text size="sm">Assessments Error: {assessmentsError.message}</Text>}
                </Alert>
            </Container>
        );
    }

    return (
        <Container size="lg" py="xl">
            <Stack gap="xl">
                <Title order={1} className="gradient-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }} mb="md">
                    Interview Preparation Hub
                </Title>

                <Paper withBorder shadow="md" p="xl" radius="md">
                    <Stack gap="lg">
                        <Group gap="xs" align="center">
                            <IconSettings size="2rem" stroke={1.5} />
                            <Title order={3}>Configure Your Mock Interview</Title>
                        </Group>
                        <Text c="dimmed" size="sm">
                            Tailor your practice session. If no skills are selected, questions will be based on your general profile skills and industry.
                        </Text>
                        <form onSubmit={handleSubmit(onSubmitQuizConfig)}>
                            <Stack gap="md">
                                <Controller
                                    name="selectedSkills"
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            {...field}
                                            label="Focus on Specific Skills (Optional)"
                                            data={userSkills}
                                            placeholder={userSkills.length > 0 ? "Select skills or leave empty for all your skills" : "No skills in profile to select"}
                                            searchable
                                            clearable
                                            nothingFoundMessage="No skills found"
                                            error={errors.selectedSkills?.message}
                                            disabled={userSkills.length === 0 || loadingSkills}
                                        />
                                    )}
                                />
                                <Controller
                                    name="numQuestions"
                                    control={control}
                                    render={({ field }) => (
                                        <Stack gap="xs">
                                            <Text size="sm" fw={500}>Number of Questions: {field.value}</Text>
                                            <Slider
                                                value={field.value}
                                                onChange={field.onChange}
                                                min={5}
                                                max={30} // Adjusted max for slider
                                                step={5}
                                                marks={numQuestionsMarks}
                                                label={(value) => `${value} questions`}
                                                styles={{ markLabel: { fontSize: '0.7rem'}}}
                                            />
                                            {errors.numQuestions && <Text c="red" size="xs">{errors.numQuestions.message}</Text>}
                                        </Stack>
                                    )}
                                />
                                <Controller
                                    name="difficulty"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="Difficulty Level"
                                            data={difficultyOptions}
                                            placeholder="Select difficulty"
                                            error={errors.difficulty?.message}
                                            required
                                        />
                                    )}
                                />
                                <Button
                                    type="submit"
                                    mt="md"
                                    leftSection={<IconPlayerPlay size="1.125rem" />}
                                    fullWidth
                                    disabled={!isValid}
                                >
                                    Start Quiz
                                </Button>
                            </Stack>
                        </form>
                    </Stack>
                </Paper>
                
                {/* Existing components for stats and history */}
                <StatsCards assessments={initialAssessments} />
                <PerformanceChart assessments={initialAssessments} />
                <QuizList assessments={initialAssessments} /> {/* This will now show more diverse quiz history */}
            </Stack>
        </Container>
    );
}