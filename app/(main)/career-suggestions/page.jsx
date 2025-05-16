// File: app/(main)/career-suggestions/page.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container, Title, Text, Paper, Group, Stack, Button, Loader, Center, SimpleGrid, Card, Badge, Alert, Modal, Select as MantineSelect
} from '@mantine/core';
import {
    IconCpu, IconBulbFilled, IconChevronRight, IconAlertTriangle,
    IconRefresh, IconInfoCircle, IconDeviceFloppy
} from '@tabler/icons-react';
import useFetch from "@/hooks/use-fetch";
import { getCareerPredictions, getUserMlProfile, saveFinalCareerChoice } from "@/actions/careerPrediction";
import { industries as allIndustriesData } from "@/data/industries"; // For manual selection
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getUserOnboardingStatus } from "@/actions/user";

// Configuration for displaying profile items
const profileDisplayConfig = [
  { key: 'fieldOfStudy', label: 'Field of Study' }, { key: 'gpa', label: 'GPA' },
  { key: 'experience', label: 'Years of Prof. Exp.' }, { key: 'extracurricularActivities', label: 'Extracurriculars' },
  { key: 'internships', label: 'Internships' }, { key: 'projects', label: 'Projects' },
  { key: 'leadershipPositions', label: 'Leadership Exp.' }, { key: 'fieldSpecificCourses', label: 'Relevant Courses' },
  { key: 'researchExperience', label: 'Research Exp.' }, { key: 'codingSkills', label: 'Coding (0-4)' },
  { key: 'communicationSkills', label: 'Communication (0-4)' }, { key: 'problemSolvingSkills', label: 'Problem Solving (0-4)' },
  { key: 'teamworkSkills', label: 'Teamwork (0-4)' }, { key: 'analyticalSkills', label: 'Analytical (0-4)' },
  { key: 'presentationSkills', label: 'Presentation (0-4)' }, { key: 'networkingSkills', label: 'Networking (0-4)' },
  { key: 'industryCertifications', label: 'Certifications' },
  { key: 'bio', label: 'Professional Bio', fullWidth: true },
];

const ProfileDataItem = ({ label, value: rawValue, fullWidth = false }) => {
  let displayValue = rawValue;
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    displayValue = <Text span c="dimmed" fs="italic">N/A</Text>;
  } else if (typeof rawValue === 'number') {
    if (['Leadership Exp.', 'Research Exp.', 'Certifications'].includes(label)) {
      displayValue = rawValue === 1 ? "Yes" : "No";
    } else if (label.includes('(0-4)')) {
        const ratings = ["None", "Beginner", "Intermediate", "Advanced", "Expert"];
        displayValue = ratings[rawValue] || String(rawValue);
    } else {
        displayValue = String(rawValue);
    }
  }

  const itemContent = (
    <Stack gap={0}>
      <Text size="xs" c="dimmed" tt="uppercase">{label.replace(' (Count)','').replace(' (0-4)','')}</Text>
      {typeof displayValue === 'string' && label === 'Professional Bio' ? (
        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{displayValue}</Text>
      ) : (
        <Text size="sm" fw={500}>{displayValue}</Text>
      )}
    </Stack>
  );

  if (fullWidth) {
    return <Paper withBorder p="sm" radius="sm" w="100%">{itemContent}</Paper>;
  }
  return <Paper withBorder p="sm" radius="sm" miw={120}>{itemContent}</Paper>;
};


export default function CareerSuggestionsPage() {
  const router = useRouter();
  const [predictedCareers, setPredictedCareers] = useState([]);
  const [selectedSuggestedCareer, setSelectedSuggestedCareer] = useState(null);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [manualIndustry, setManualIndustry] = useState("");
  const [manualSubIndustry, setManualSubIndustry] = useState("");
  const [availableSubIndustries, setAvailableSubIndustries] = useState([]);
  const [onboardingStatusChecked, setOnboardingStatusChecked] = useState(false);

  const { data: userProfile, loading: profileLoading, error: profileError, fn: fetchUserProfile } = useFetch(getUserMlProfile);
  const { loading: predicting, fn: fetchPredictionsFn, error: predictionError } = useFetch(getCareerPredictions);
  const { loading: savingChoice, fn: saveChoiceFn, error: saveChoiceError, data: saveChoiceResult } = useFetch(saveFinalCareerChoice);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Directly call the server action. No need for useFetch here for a one-time check.
        const status = await getUserOnboardingStatus();
        if (status.isFullyOnboarded) {
          console.log("CareerSuggestionsPage: User already fully onboarded. Redirecting to dashboard.");
          router.push('/dashboard');
        } else if (!status.isMlProfileCompleted) {
          console.log("CareerSuggestionsPage: ML profile not completed. Redirecting to onboarding.");
          router.push('/onboarding');
        } else {
          // ML profile is completed, but not fully onboarded - this is the correct page.
          fetchUserProfile(); // Now fetch the profile data
        }
      } catch (err) {
        console.error("Error checking onboarding status on suggestions page:", err);
        toast.error("Could not verify onboarding status. Please try refreshing.");
        // Fallback: attempt to load profile anyway or redirect to a safe page
        fetchUserProfile(); // Attempt to load profile
      } finally {
        setOnboardingStatusChecked(true);
      }
    };
    checkStatus();
  }, [router, fetchUserProfile]); // Empty array was correct for fetch-once

  useEffect(() => {
    if (profileError) {
      toast.error(profileError.message || "Failed to load your profile.");
    }
    if (predictionError) {
      toast.error(predictionError.message || "Could not fetch career predictions.");
    }
    if (saveChoiceError) {
      toast.error(saveChoiceError.message || "Failed to save your choice.");
    }
  }, [profileError, predictionError, saveChoiceError]);

  useEffect(() => {
    if (saveChoiceResult && !savingChoice) { // saveChoiceResult is the updatedUser object
      toast.success(`Career choice "${saveChoiceResult.industry}" saved! Redirecting to dashboard...`);
      router.push('/dashboard');
      router.refresh(); // Ensure dashboard gets fresh data
    }
  }, [saveChoiceResult, savingChoice, router]);


  const handleStartPrediction = useCallback(async () => {
    if (!userProfile || profileLoading) {
      toast.info("Profile data is still loading or not available.");
      return;
    }
    setSelectedSuggestedCareer(null);
    setPredictedCareers([]);
    setShowManualSelection(false); // Hide manual section when getting new predictions
    
    const predictions = await fetchPredictionsFn(); 

    if (predictions && Array.isArray(predictions)) {
      setPredictedCareers(predictions.slice(0, 5)); 
      if (predictions.length === 0 && !predictionError) { 
        toast.info("No specific AI career predictions could be generated. You can choose an industry manually.");
      }
    } else if (!predictionError) { 
      toast.error("Failed to get AI predictions or received an unexpected format.");
    }
  }, [fetchPredictionsFn, userProfile, profileLoading, predictionError]);

  const handleSelectSuggestedCareer = (careerName) => {
    setSelectedSuggestedCareer(careerName);
    setManualIndustry(""); // Clear manual selection if a suggestion is picked
    setManualSubIndustry("");
  };

  const handleConfirmChoice = async () => {
    let careerToSave = selectedSuggestedCareer;
    if (showManualSelection) {
        if (!manualIndustry) {
            toast.error("Please select a manual industry or choose an AI suggestion.");
            return;
        }
        // For manual choice, the "careerName" passed to saveFinalCareerChoice
        // will be the industry string itself. SubIndustry will be handled separately if needed.
        careerToSave = manualIndustry;
        // If you have subIndustry, you might pass an object:
        // await saveChoiceFn({ industry: manualIndustry, subIndustry: manualSubIndustry });
        // For now, assuming saveFinalCareerChoice primarily uses the main career/industry name.
    }

    if (!careerToSave) {
      toast.error("Please select a career suggestion or a manual industry.");
      return;
    }
    
    // The saveChoiceFn expects the 'selectedCareerName' argument which is used for mapping and skill gen.
    await saveChoiceFn(careerToSave);
  };
  
  const industryOptions = useMemo(() => allIndustriesData.map(ind => ({ value: ind.name, label: ind.name })), []);

  useEffect(() => {
    if (manualIndustry) {
      const selectedIndustryData = allIndustriesData.find(ind => ind.name === manualIndustry);
      setAvailableSubIndustries(selectedIndustryData?.subIndustries.map(sub => ({ value: sub, label: sub })) || []);
      setManualSubIndustry(""); // Reset sub-industry when main industry changes
    } else {
      setAvailableSubIndustries([]);
    }
  }, [manualIndustry]);

  const handleToggleManualSelection = () => {
    setShowManualSelection(prev => !prev);
    setSelectedSuggestedCareer(null); // Clear AI suggestion if switching to manual
    if (showManualSelection) { // If hiding manual, clear manual fields
        setManualIndustry("");
        setManualSubIndustry("");
    }
  };

  if (!onboardingStatusChecked || (profileLoading && !userProfile && !profileError)) {
    return <Center style={{ height: 'calc(100vh - 120px)' }}><Loader size="lg" /></Center>;
  }

  if (profileError && !userProfile) {
    return (
      <Center style={{ height: 'calc(100vh - 120px)', padding: '1rem' }}>
        <Paper p="xl" withBorder shadow="md" radius="md">
          <Stack align="center" gap="md">
            <IconAlertTriangle size="3rem" color="var(--mantine-color-red-6)" />
            <Title order={3} ta="center">Error Loading Your Profile</Title>
            <Text c="dimmed" ta="center">{profileError.message}</Text>
            <Button onClick={() => fetchUserProfile()} mt="md" leftSection={<IconRefresh size="1rem"/>}>
              Try Reloading Profile
            </Button>
            <Button component="a" href="/onboarding" variant="outline" mt="xs">
              Go Back to Profile Setup
            </Button>
          </Stack>
        </Paper>
      </Center>
    );
  }

  const displayedProfileItems = userProfile
    ? profileDisplayConfig.filter(item => {
        const value = userProfile[item.key];
        return value !== null && value !== undefined && (typeof value === 'string' ? value !== "" : true);
      })
    : [];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl" align="center">
        <Title order={1} ta="center" className="gradient-title">
          Finalize Your Career Path
        </Title>
        <Text ta="center" c="dimmed" maw={650}>
          Based on your profile, our AI can suggest career paths.
          Review the suggestions or choose your primary industry manually to get tailored insights.
        </Text>

        {userProfile && (
          <Paper withBorder p="lg" radius="md" shadow="xs" w="100%">
            <Title order={4} mb="md">Your Profile Summary for AI Analysis</Title>
            <SimpleGrid cols={{ base: 1, xs:2, sm:3, md: 4 }} spacing="md">
              {profileDisplayConfig.filter(item => {
                const value = userProfile[item.key];
                return value !== null && value !== undefined && (typeof value === 'string' ? value !== "" : true);
              }).map(item => (
                <ProfileDataItem key={item.key} label={item.label} value={userProfile[item.key]} fullWidth={item.fullWidth} />
              ))}
            </SimpleGrid>
          </Paper>
        )}

        <Stack align="center" mt="lg" w="100%">
          {!predictedCareers.length && !predicting && (
            <Button
              size="lg"
              onClick={handleStartPrediction}
              leftSection={<IconCpu size="1.2rem" />}
              disabled={profileLoading || predicting || !userProfile}
              loading={predicting}
              loaderProps={{children: <Loader size="sm" color="white"/>}}
            >
              {profileLoading ? "Loading Profile..." : (predicting ? "Analyzing..." : "Get AI Career Suggestions")}
            </Button>
          )}
          {predicting && <Loader mt="md" />}
        </Stack>

        {/* AI Suggestions */}
        {predictedCareers.length > 0 && !showManualSelection && (
          <Stack gap="lg" align="center" w="100%" mt="md">
            <Title order={3} ta="center">Top 5 AI-Powered Suggestions</Title>
            <SimpleGrid cols={{base: 1, sm: 2, md: 3}} spacing="lg" w="100%" maw={900} verticalSpacing="lg">
              {predictedCareers.map((prediction, index) => (
                <Card key={index} shadow="sm" padding="lg" radius="md" withBorder
                  style={{
                    cursor: 'pointer',
                    borderColor: selectedSuggestedCareer === prediction.career ? 'var(--mantine-color-blue-filled)' : 'var(--mantine-color-gray-3)',
                    backgroundColor: selectedSuggestedCareer === prediction.career ? 'var(--mantine-color-blue-light)' : 'var(--mantine-color-body)',
                    transition: 'border-color 0.2s, background-color 0.2s'
                  }}
                  onClick={() => handleSelectSuggestedCareer(prediction.career)}
                >
                  <Stack align="center" gap="xs">
                    <IconBulbFilled size="2rem" color={selectedSuggestedCareer === prediction.career ? 'var(--mantine-color-blue-filled)' : 'var(--mantine-color-yellow-filled)'} />
                    <Text fw={700} size="lg" ta="center">{prediction.career}</Text>
                    <Badge color="gray" variant="light">
                      {(prediction.probability * 100).toFixed(0)}% Match
                    </Badge>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        )}

        {/* Manual Selection Section Toggle */}
        {userProfile && !predicting && (
            <Button
                variant="subtle"
                onClick={handleToggleManualSelection}
                mt={predictedCareers.length > 0 ? "xl" : "sm"}
            >
                {showManualSelection ? "Hide Manual Selection & View AI Suggestions" : "Or, Choose Industry Manually"}
            </Button>
        )}

        {/* Manual Industry/Sub-Industry Selection Form */}
        {showManualSelection && (
            <Paper withBorder p="lg" radius="md" shadow="xs" w="100%" maw={600} mt="md">
                <Stack>
                    <Title order={4} ta="center">Select Your Industry Manually</Title>
                    <MantineSelect
                        label="Industry"
                        placeholder="Select your primary industry"
                        data={industryOptions}
                        value={manualIndustry}
                        onChange={(value) => {
                            setManualIndustry(value);
                            setSelectedSuggestedCareer(null); // Clear AI suggestion
                        }}
                        searchable
                        clearable
                        required
                    />
                    {manualIndustry && availableSubIndustries.length > 0 && (
                        <MantineSelect
                            label="Sub-Industry / Specialization (Optional)"
                            placeholder="Select your specialization"
                            data={availableSubIndustries}
                            value={manualSubIndustry}
                            onChange={setManualSubIndustry}
                            searchable
                            clearable
                        />
                    )}
                     <Text size="xs" c="dimmed">
                        Note: Selecting manually will override AI suggestions for confirmation.
                        The "Industry" selected here will be used for insights.
                    </Text>
                </Stack>
            </Paper>
        )}


        {/* Confirmation Area */}
        {(selectedSuggestedCareer || (showManualSelection && manualIndustry)) && (
          <Stack align="center" mt="xl" gap="md" w="100%" maw={600}>
            <Alert icon={<IconInfoCircle size="1rem" />} title="Confirm Your Path" color="blue" radius="md">
              You've selected: <Text span fw={700}>{selectedSuggestedCareer || manualIndustry}</Text>.
              {manualSubIndustry && ` (Specialization: ${manualSubIndustry})`}.
              This will be set as your primary career focus for personalized insights and tools.
            </Alert>
            <Button
              size="lg"
              onClick={handleConfirmChoice}
              disabled={savingChoice || predicting}
              loading={savingChoice}
              loaderProps={{children: <IconDeviceFloppy size="1.2rem"/>}}
              leftSection={savingChoice ? null : <IconChevronRight size="1.2rem" />}
              fullWidth
            >
              {savingChoice ? "Saving..." : `Confirm & Proceed to Dashboard`}
            </Button>
          </Stack>
        )}

      </Stack>
    </Container>
  );
}