// File: app/(main)/interview/_components/quiz.jsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Button, Paper, Text, Title, Group, Stack, Radio,
    LoadingOverlay, Box, Alert, Center, // Added Center
} from "@mantine/core";
import { IconInfoCircle, IconPlayerPlay, IconChevronRight, IconLoader2 as IconMantineLoader } from '@tabler/icons-react'; // Aliased IconLoader2
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";
// Removed BarLoader from react-spinners, will use Mantine's Loader

export default function Quiz({ quizParams }) { // Accept quizParams
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
    error: quizError,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
    error: saveError,
  } = useFetch(saveQuizResult);

  // Fetch quiz when component mounts with new params
  useEffect(() => {
    if (quizParams) { // Ensure quizParams are available
        console.log("Quiz component: Generating quiz with params:", quizParams);
        generateQuizFn(quizParams);
    }
  }, [quizParams, generateQuizFn]); // Add generateQuizFn to dependencies

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
    }
  }, [quizData]);

  useEffect(() => {
    if (quizError) toast.error(quizError.message || "Failed to generate quiz.");
    if (saveError) toast.error(saveError.message || "Failed to save quiz results.");
  }, [quizError, saveError]);

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    setShowExplanation(false); // Hide explanation when a new answer is selected
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const calculateScore = () => {
    if (!quizData || quizData.length === 0) return 0;
    let correct = 0;
    answers.forEach((answer, index) => {
      if (quizData[index] && answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    const score = calculateScore();
    // Pass quizParams to saveQuizResultFn
    await saveQuizResultFn(quizData, answers, score, quizParams);
  };

  const startNewQuizFromResults = () => {
    // This function is called from QuizResult.
    // It should ideally navigate back to the config page or re-trigger with same params if desired.
    // For now, let's assume it re-triggers with the same params.
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setResultData(null);
    if (quizParams) {
        generateQuizFn(quizParams);
    }
  };
  
  // This function is for the button if no quizData is loaded initially (e.g., error state)
  const startNewQuizFromEmptyState = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setResultData(null);
    if (quizParams) {
        generateQuizFn(quizParams);
    } else {
        // Fallback if quizParams somehow aren't set, though they should be from mock/page.jsx
        toast.error("Quiz configuration missing. Please go back and configure your quiz.");
        // Potentially redirect: router.push('/interview');
    }
  };


  if (generatingQuiz && !quizData) { // Show loader only if no data yet
    return <Center style={{height: '300px'}}><LoadingOverlay visible={true} /></Center>;
  }

  if (resultData && !savingResult) {
    return (
      <Box p="md">
        <QuizResult result={resultData} onStartNew={startNewQuizFromResults} />
      </Box>
    );
  }

  // If quiz generation failed or returned empty
  if (!generatingQuiz && (!quizData || quizData.length === 0)) {
    return (
      <Paper shadow="sm" p="xl" withBorder radius="md" ta="center">
        <Stack align="center" gap="md">
            <IconPlayerPlay size="3rem" stroke={1.5} color="var(--mantine-color-gray-6)" />
            <Title order={3}>{quizError ? "Quiz Generation Failed" : "No Questions Generated"}</Title>
            <Text c="dimmed" size="sm" maw={500}>
                {quizError ? quizError.message : "We couldn't generate questions based on your selection. Please try different parameters or try again later."}
            </Text>
            {/* The button to retry with current params */}
            <Button onClick={startNewQuizFromEmptyState} size="md" mt="md" leftSection={<IconPlayerPlay size="1.125rem"/>}>
                Retry Quiz Generation
            </Button>
        </Stack>
      </Paper>
    );
  }
  
  // This ensures we don't try to render quizData[currentQuestion] if quizData is null or empty
  if (!quizData || quizData.length === 0) return null;


  const question = quizData[currentQuestion];

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder>
      <LoadingOverlay visible={savingResult} overlayProps={{ radius: "sm", blur: 2 }} />
      <Stack gap="lg">
        <Title order={4}>
          Question {currentQuestion + 1} of {quizData.length}
        </Title>
        <Text fz="lg" fw={500}>{question.question}</Text>

        <Radio.Group
          value={answers[currentQuestion] || ""} // Ensure value is not null for controlled component
          onChange={handleAnswer}
          name={`question-${currentQuestion}`}
        >
          <Stack gap="sm" mt="md">
            {question.options.map((option, index) => (
              <Radio
                key={index}
                value={option}
                label={option}
                id={`option-${currentQuestion}-${index}`}
              />
            ))}
          </Stack>
        </Radio.Group>

        {showExplanation && question.explanation && (
          <Alert
            variant="light" color="blue" title="Explanation"
            icon={<IconInfoCircle />} mt="lg" radius="md"
          >
            {question.explanation}
          </Alert>
        )}

        <Group justify="space-between" mt="xl">
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline" color="gray"
            disabled={!answers[currentQuestion] || showExplanation}
          >
            Show Explanation
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion] || savingResult}
            loading={savingResult}
            loaderProps={{ children: <IconMantineLoader size="1rem" /> }} // Removed animate-spin from here
            rightSection={!savingResult ? <IconChevronRight size="1rem" /> : undefined}
          >
            {currentQuestion < quizData.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}