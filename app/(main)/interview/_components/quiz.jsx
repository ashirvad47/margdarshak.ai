"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Button,
    Paper,
    Text,
    Title,
    Group,
    Stack,
    Radio, // Mantine Radio
    LoadingOverlay,
    Box,
    Alert, // For explanation
} from "@mantine/core";
import { IconInfoCircle, IconPlayerPlay, IconChevronRight, IconLoader2 } from '@tabler/icons-react';
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result"; // This will also need refactoring
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners"; // Keeping this for initial load as it was there

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
    error: quizError, // Added error handling
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
    error: saveError, // Added error handling
  } = useFetch(saveQuizResult);

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
    }
  }, [quizData]);

  useEffect(() => {
    if (quizError) {
        toast.error(quizError.message || "Failed to generate quiz.");
    }
    if (saveError) {
        toast.error(saveError.message || "Failed to save quiz results.");
    }
  }, [quizError, saveError]);

  const handleAnswer = (value) => { // Mantine Radio.Group onChange provides the value directly
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
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
    await saveQuizResultFn(quizData, answers, score);
    // Toast handled by useFetch effect or can be specific here
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setResultData(null); // Clear previous results
    generateQuizFn();
  };

  if (generatingQuiz) {
    return <BarLoader color="var(--mantine-primary-color-filled)" width="100%" />;
  }

  if (resultData && !savingResult) { // Ensure saving is complete before showing results
    return (
      <Box p="md">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </Box>
    );
  }

  if (!quizData || quizData.length === 0) {
    return (
      <Paper shadow="sm" p="xl" withBorder radius="md" ta="center">
        <Stack align="center" gap="md">
            <IconPlayerPlay size="3rem" stroke={1.5} color="var(--mantine-color-gray-6)" />
            <Title order={3}>Ready to Test Your Knowledge?</Title>
            <Text c="dimmed" size="sm" maw={500}>
                This quiz contains 10 questions specific to your industry and
                skills. Take your time and choose the best answer for each question.
            </Text>
            <Button onClick={generateQuizFn} size="md" mt="md" leftSection={<IconPlayerPlay size="1.125rem"/>}>
                Start Quiz
            </Button>
        </Stack>
      </Paper>
    );
  }

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
          value={answers[currentQuestion]}
          onChange={handleAnswer}
          name={`question-${currentQuestion}`}
        >
          <Stack gap="sm" mt="md">
            {question.options.map((option, index) => (
              <Radio
                key={index}
                value={option}
                label={option}
                id={`option-${currentQuestion}-${index}`} // Unique ID
              />
            ))}
          </Stack>
        </Radio.Group>

        {showExplanation && question.explanation && (
          <Alert
            variant="light"
            color="blue" // Or another subtle color
            title="Explanation"
            icon={<IconInfoCircle />}
            mt="lg"
            radius="md"
          >
            {question.explanation}
          </Alert>
        )}

        <Group justify="space-between" mt="xl">
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
            color="gray"
            disabled={!answers[currentQuestion] || showExplanation}
          >
            Show Explanation
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion] || savingResult}
            loading={savingResult}
            loaderProps={{ children: <IconLoader2 size="1rem" className="animate-spin"/> }}
            rightSection={!savingResult ? <IconChevronRight size="1rem" /> : undefined}
          >
            {currentQuestion < quizData.length - 1
              ? "Next Question"
              : "Finish Quiz"}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}