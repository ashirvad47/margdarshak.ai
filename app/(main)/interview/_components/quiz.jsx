// app/(main)/interview/_components/quiz.jsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Button, Paper, Text, Title, Group, Stack, Radio,
    LoadingOverlay, Box, Alert, Center,
} from "@mantine/core";
import {
    IconInfoCircle,         // For explanation alert
    IconChevronRight,       // For "Next Question"
    IconLockOpen,           // For "Show Explanation" when available
    IconSend,               // For "Confirm Answer"
    IconCheck,        // For "Finish Quiz"
    IconLoader2 as IconMantineLoader // Loading spinner
} from '@tabler/icons-react';
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";

export default function Quiz({ quizParams }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]); // Stores user's selected answer for each question
  const [showExplanation, setShowExplanation] = useState(false); // Controls visibility of explanation for current q
  const [answerLocked, setAnswerLocked] = useState(false); // True if answer for current question is confirmed

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData, // Array of question objects
    error: quizError,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData, // Data returned after saving quiz (assessment object)
    setData: setResultData, // To clear resultData when starting new quiz
    error: saveError,
  } = useFetch(saveQuizResult);

  // Effect to fetch quiz questions when component mounts or quizParams change
  useEffect(() => {
    if (quizParams) {
        // Reset states for a new quiz attempt
        setCurrentQuestion(0);
        setAnswers([]);
        setShowExplanation(false);
        setAnswerLocked(false);
        setResultData(null); // Clear previous results if any
        generateQuizFn(quizParams);
    }
  }, [quizParams, generateQuizFn, setResultData]); // Added setResultData

  // Effect to initialize answers array when new quizData is loaded
  useEffect(() => {
    if (quizData && quizData.length > 0) {
      setAnswers(new Array(quizData.length).fill(null));
    }
    // Reset lock and explanation for the first question or if quizData changes
    setAnswerLocked(false);
    setShowExplanation(false);
  }, [quizData]);

  // Effect to reset lock and explanation visibility when currentQuestion changes
  useEffect(() => {
    setAnswerLocked(false);
    setShowExplanation(false);
  }, [currentQuestion]);

  // Effect for displaying error toasts
  useEffect(() => {
    if (quizError) toast.error(quizError.message || "Failed to generate quiz.");
    if (saveError) toast.error(saveError.message || "Failed to save quiz results.");
  }, [quizError, saveError]);

  // Handles when a user selects a radio button
  const handleAnswerSelection = (value) => {
    if (answerLocked) return; // Do nothing if the answer for this question is already locked

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  // Handles the main action button (Confirm Answer / Next Question / Finish Quiz)
  const handleMainAction = () => {
    const isAnswerSelected = answers[currentQuestion] !== null;

    if (!isAnswerSelected) {
      toast.error("Please select an answer first.");
      return;
    }

    if (!answerLocked) {
      // --- Stage 1: Confirming the answer ---
      setAnswerLocked(true);
      toast.success("Answer Confirmed!");
      // The button's text/icon will change in the next render.
      // User now has to click again to proceed to next/finish.
    } else {
      // --- Stage 2: Answer is locked, so this is "Next Question" or "Finish Quiz" ---
      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1); // useEffect for currentQuestion handles state resets
      } else {
        finishQuiz();
      }
    }
  };

  // Handles the "Show Explanation" button click
  const handleShowExplanationClick = () => {
    if (answerLocked) { // Only show if the answer has been locked
      setShowExplanation(true);
    } else {
      // This state should ideally not be reachable if button is correctly disabled
      toast.info("Please confirm your answer first to see the explanation.");
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
    if (!savingResult) { // Prevent multiple submissions
      await saveQuizResultFn(quizData, answers, calculateScore(), quizParams);
    }
  };

  const startNewQuizFromResults = () => {
    // This will re-trigger the useEffect that listens to quizParams
    // if quizParams is passed down again or if we re-call generateQuizFn
    // For simplicity, let's assume quizParams are stable and we just reset for a new fetch.
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setAnswerLocked(false);
    setResultData(null);
    if (quizParams) {
        generateQuizFn(quizParams);
    }
  };

  const startNewQuizFromEmptyState = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setAnswerLocked(false);
    setResultData(null);
    if (quizParams) {
        generateQuizFn(quizParams);
    } else {
        toast.error("Quiz configuration missing.");
    }
  };


  // --- Render Logic ---
  if (generatingQuiz && !quizData) {
    return <Center style={{height: '300px'}}><LoadingOverlay visible={true} /></Center>;
  }

  if (resultData && !savingResult) { // Show results after saving
    return <Box p="md"><QuizResult result={resultData} onStartNew={startNewQuizFromResults} /></Box>;
  }

  if (!generatingQuiz && (!quizData || quizData.length === 0)) {
    return (
      <Paper shadow="sm" p="xl" withBorder ta="center" radius="md">
        <Stack align="center" gap="md">
            {/* ... Error/No questions UI ... */}
        </Stack>
      </Paper>
    );
  }
  
  if (!quizData || quizData.length === 0) return null; // Should be caught above

  const question = quizData[currentQuestion];
  const isCurrentAnswerSelected = answers[currentQuestion] !== null;
  const isLastQuestion = currentQuestion === quizData.length - 1;

  // Determine text and icon for the main action button
  let mainActionButtonText;
  let MainActionButtonIcon;
  if (!answerLocked) {
    mainActionButtonText = "Confirm Answer";
    MainActionButtonIcon = IconSend;
  } else {
    mainActionButtonText = isLastQuestion ? "Finish Quiz" : "Next Question";
    MainActionButtonIcon = isLastQuestion ? IconCheck : IconChevronRight;
  }

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder>
      <LoadingOverlay visible={savingResult} overlayProps={{ radius: "sm", blur: 2 }} />
      <Stack gap="lg">
        <Title order={4}>
          Question {currentQuestion + 1} of {quizData.length}
        </Title>
        <Text fz="lg" fw={500}>{question.question}</Text>

        <Radio.Group
          value={answers[currentQuestion] || ""}
          onChange={handleAnswerSelection}
          name={`question-${currentQuestion}`}
        >
          <Stack gap="sm" mt="md">
            {question.options.map((option, index) => (
              <Radio
                key={index}
                value={option}
                label={option}
                id={`option-${currentQuestion}-${index}`}
                disabled={answerLocked} // Radio options disabled after answer is locked
              />
            ))}
          </Stack>
        </Radio.Group>

        {answerLocked && showExplanation && question.explanation && (
          <Alert
            variant="light" color="blue" title="Explanation"
            icon={<IconInfoCircle />} mt="lg" radius="md"
          >
            {question.explanation}
          </Alert>
        )}

        <Group justify="space-between" mt="xl">
          <Button
            onClick={handleShowExplanationClick}
            variant="outline"
            color="gray"
            disabled={!answerLocked || showExplanation || savingResult}
            leftSection={<IconLockOpen size="1rem" />}
          >
            Show Explanation
          </Button>

          <Button
            onClick={handleMainAction}
            disabled={!isCurrentAnswerSelected || savingResult} // Disabled if no answer selected, or if already saving
            loading={savingResult && answerLocked && isLastQuestion} // Show loading only when finishing
            loaderProps={{ children: <IconMantineLoader size="1rem" /> }}
            leftSection={(savingResult && answerLocked && isLastQuestion) ? undefined : <MainActionButtonIcon size="1.1rem" />}
          >
            {mainActionButtonText}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}