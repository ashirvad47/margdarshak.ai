// File: app/(main)/career-suggestions/page.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container, Title, Text, Paper, Group, Stack, Button, Loader, Center, SimpleGrid, Card, Badge, Alert, Modal, Select as MantineSelect, MultiSelect, ActionIcon, TextInput, Divider, useMantineTheme
} from '@mantine/core';
import {
    IconCpu, IconBulbFilled, IconChevronRight, IconAlertTriangle,
    IconRefresh, IconInfoCircle, IconDeviceFloppy, IconSparkles, IconPlus, IconX, IconEdit, IconSearch, // Added IconSearch for manual choice
} from '@tabler/icons-react';
import useFetch from "@/hooks/use-fetch";
import { getCareerPredictions, getUserMlProfile, saveFinalCareerChoice, generateSkillsForCareerWithGemini } from "@/actions/careerPrediction";
import { industries as allIndustriesData } from "@/data/industries";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getUserOnboardingStatus } from "@/actions/user";

// --- CAREER TO INDUSTRY/SUB-INDUSTRY MAPPING ---
const careerToIndustryAndSubIndustryMap = { /* ... Your existing comprehensive map ... */
  "Actuarial Analyst": { industryId: "Financial Services", subIndustryName: "Insurance" },
  "Advertising Manager": { industryId: "Media & Entertainment", subIndustryName: "Advertising" },
  "Aerospace Engineer": { industryId: "Manufacturing & Industrial", subIndustryName: "Aerospace & Defense" },
  "AI / Machine Learning Engineer": { industryId: "Technology", subIndustryName: "Artificial Intelligence/Machine Learning" },
  "Analytical Chemist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Pharmaceuticals" },
  "Animator": { industryId: "Media & Entertainment", subIndustryName: "Animation" },
  "Architect": { industryId: "Professional Services", subIndustryName: "Architecture" },
  "Art Director": { industryId: "Media & Entertainment", subIndustryName: "Advertising" },
  "Biochemist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Biotechnology" },
  "Biologist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Biotechnology" },
  "Biomedical Engineer": { industryId: "Healthcare & Life Sciences", subIndustryName: "Medical Devices" },
  "Brand Manager": { industryId: "Media & Entertainment", subIndustryName: "Advertising" },
  "Business Analyst": { industryId: "Professional Services", subIndustryName: "Business Advisory" },
  "Chartered Accountant": { industryId: "Financial Services", subIndustryName: "Banking" },
  "Chef / Culinary Artist": { industryId: "Hospitality & Tourism", subIndustryName: "Restaurants & Food Service" },
  "Chemical Engineer": { industryId: "Manufacturing & Industrial", subIndustryName: "Chemical Manufacturing" },
  "Civil Engineer": { industryId: "Construction & Real Estate", subIndustryName: "Infrastructure Development" },
  "Clinical Psychologist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Mental Health Services" },
  "Cloud Solutions Architect": { industryId: "Technology", subIndustryName: "Cloud Computing" },
  "Content Writer": { industryId: "Media & Entertainment", subIndustryName: "Digital Media" },
  "Corporate Lawyer": { industryId: "Professional Services", subIndustryName: "Legal Services" },
  "Cost Accountant": { industryId: "Financial Services", subIndustryName: "Banking" },
  "Counseling Psychologist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Mental Health Services" },
  "Credit Analyst": { industryId: "Financial Services", subIndustryName: "Credit Services" },
  "Curator / Gallery Manager": { industryId: "Media & Entertainment", subIndustryName: "Publishing" },
  "Curriculum Developer": { industryId: "Education & Training", subIndustryName: "Educational Publishing" },
  "Cybersecurity Analyst": { industryId: "Technology", subIndustryName: "Cybersecurity" },
  "Data Center Engineer": { industryId: "Technology", subIndustryName: "Cloud Computing" },
  "Data Scientist": { industryId: "Technology", subIndustryName: "Data Science & Analytics" },
  "Dentist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Healthcare Services" },
  "DevOps Engineer": { industryId: "Technology", subIndustryName: "Software Development" },
  "Digital Marketing Spec.": { industryId: "Media & Entertainment", subIndustryName: "Digital Marketing" },
  "Doctor (MBBS)": { industryId: "Healthcare & Life Sciences", subIndustryName: "Healthcare Services" },
  "Ecologist / Conservation Scientist": { industryId: "Energy & Utilities", subIndustryName: "Environmental Services" },
  "Education Administrator": { industryId: "Education & Training", subIndustryName: "K-12 Education" },
  "Electrical Engineer": { industryId: "Manufacturing & Industrial", subIndustryName: "Electronics Manufacturing" },
  "Electronics & Communication": { industryId: "Telecommunications", subIndustryName: "Telecom Equipment" },
  "Entrepreneur / Founder": { industryId: "Technology", subIndustryName: "Internet & Web Services" },
  "Environmental Engineer": { industryId: "Energy & Utilities", subIndustryName: "Environmental Services" },
  "Environmental Scientist": { industryId: "Energy & Utilities", subIndustryName: "Environmental Services" },
  "Fashion Designer": { industryId: "Retail & E-commerce", subIndustryName: "Fashion & Apparel" },
  "Film / Video Editor": { industryId: "Media & Entertainment", subIndustryName: "Film & Television" },
  "Financial Advisor": { industryId: "Financial Services", subIndustryName: "Wealth Management" },
  "Financial Analyst": { industryId: "Financial Services", subIndustryName: "Investment Banking" },
  "Financial Controller": { industryId: "Financial Services", subIndustryName: "Banking" },
  "Fine Artist / Painter": { industryId: "Media & Entertainment", subIndustryName: "Publishing" },
  "Geneticist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Genomics" },
  "Graphic Designer": { industryId: "Media & Entertainment", subIndustryName: "Digital Media" },
  "Hospitality Manager": { industryId: "Hospitality & Tourism", subIndustryName: "Hospitality Management" },
  "Hotel Operations Manager": { industryId: "Hospitality & Tourism", subIndustryName: "Hotels & Resorts" },
  "HR Manager": { industryId: "Professional Services", subIndustryName: "Human Resources" },
  "Illustrator": { industryId: "Media & Entertainment", subIndustryName: "Publishing" },
  "Industrial Engineer": { industryId: "Manufacturing & Industrial", subIndustryName: "Industrial Manufacturing" },
  "Inorganic Chemist": { industryId: "Manufacturing & Industrial", subIndustryName: "Chemical Manufacturing" },
  "Interior Designer": { industryId: "Construction & Real Estate", subIndustryName: "Interior Design" },
  "Investment Banker": { industryId: "Financial Services", subIndustryName: "Investment Banking" },
  "IT Project Manager": { industryId: "Technology", subIndustryName: "IT Services" },
  "Judge": { industryId: "Professional Services", subIndustryName: "Legal Services" },
  "Landscape Architect": { industryId: "Construction & Real Estate", subIndustryName: "Urban Planning" },
  "Lawyer": { industryId: "Professional Services", subIndustryName: "Legal Services" },
  "Legal Consultant": { industryId: "Professional Services", subIndustryName: "Legal Services" },
  "Management Consultant": { industryId: "Professional Services", subIndustryName: "Management Consulting" },
  "Market Research Analyst": { industryId: "Professional Services", subIndustryName: "Marketing Services" },
  "Marketing Manager": { industryId: "Professional Services", subIndustryName: "Marketing Services" },
  "Mathematician / Statistician": { industryId: "Financial Services", subIndustryName: "Risk Management" },
  "Mechanical Engineer": { industryId: "Manufacturing & Industrial", subIndustryName: "Machinery & Equipment" },
  "Medical Laboratory Technologist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Healthcare Services" },
  "Microbiologist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Pharmaceuticals" },
  "Mobile App Developer": { industryId: "Technology", subIndustryName: "Software Development" },
  "Music Teacher": { industryId: "Education & Training", subIndustryName: "K-12 Education" },
  "Music Therapist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Mental Health Services" },
  "Nuclear Physicist": { industryId: "Energy & Utilities", subIndustryName: "Nuclear Energy" },
  "Nurse": { industryId: "Healthcare & Life Sciences", subIndustryName: "Healthcare Services" },
  "Nutritionist / Dietitian": { industryId: "Healthcare & Life Sciences", subIndustryName: "Healthcare Services" },
  "Organic Chemist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Pharmaceuticals" },
  "Paralegal": { industryId: "Professional Services", subIndustryName: "Legal Services" },
  "Petroleum Engineer": { industryId: "Energy & Utilities", subIndustryName: "Oil & Gas" },
  "Pharmacist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Healthcare Services" },
  "Physicist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Medical Devices" },
  "Physiotherapist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Healthcare Services" },
  "Primary School Teacher": { industryId: "Education & Training", subIndustryName: "K-12 Education" },
  "Public Health Specialist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Healthcare Services" },
  "Quantum Physicist": { industryId: "Technology", subIndustryName: "Quantum Computing" },
  "Radiographer / Imaging Technologist": { industryId: "Healthcare & Life Sciences", subIndustryName: "Healthcare Services" },
  "Risk Analyst": { industryId: "Financial Services", subIndustryName: "Risk Management" },
  "School Counselor": { industryId: "Education & Training", subIndustryName: "K-12 Education" },
  "School Principal": { industryId: "Education & Training", subIndustryName: "K-12 Education" },
  "Secondary School Teacher": { industryId: "Education & Training", subIndustryName: "K-12 Education" },
  "Social Media Manager": { industryId: "Media & Entertainment", subIndustryName: "Social Media" },
  "Social Worker": { industryId: "Non-Profit & Social Services", subIndustryName: "Social Services" },
  "Software Developer": { industryId: "Technology", subIndustryName: "Software Development" },
  "Sound Engineer": { industryId: "Media & Entertainment", subIndustryName: "Music & Audio" },
  "Special Education Teacher": { industryId: "Education & Training", subIndustryName: "Special Education" },
  "Structural Engineer": { industryId: "Construction & Real Estate", subIndustryName: "Commercial Construction" },
  "Surgeon": { industryId: "Healthcare & Life Sciences", subIndustryName: "Healthcare Services" },
  "Talent Acquisition Spec.": { industryId: "Professional Services", subIndustryName: "Human Resources" },
  "University Professor": { industryId: "Education & Training", subIndustryName: "Higher Education" },
  "Urban Planner": { industryId: "Construction & Real Estate", subIndustryName: "Urban Planning" },
  "UX/UI Designer": { industryId: "Technology", subIndustryName: "Software Development" },
  "Web Developer": { industryId: "Technology", subIndustryName: "Internet & Web Services" }
};

// --- PROFILE DISPLAY CONFIG ---
const profileDisplayConfig = [ /* ... Your existing config ... */
    { key: 'fieldOfStudy', label: 'Field of Study' }, { key: 'gpa', label: 'GPA' },
    { key: 'experience', label: 'Years of Prof. Exp.' }, { key: 'extracurricularActivities', label: 'Extracurriculars (Count)' },
    { key: 'internships', label: 'Internships (Count)' }, { key: 'projects', label: 'Projects (Count)' },
    { key: 'leadershipPositions', label: 'Leadership Exp.' }, { key: 'fieldSpecificCourses', label: 'Relevant Courses (Count)' },
    { key: 'researchExperience', label: 'Research Exp.' }, { key: 'codingSkills', label: 'Coding (0-4)' },
    { key: 'communicationSkills', label: 'Communication (0-4)' }, { key: 'problemSolvingSkills', label: 'Problem Solving (0-4)' },
    { key: 'teamworkSkills', label: 'Teamwork (0-4)' }, { key: 'analyticalSkills', label: 'Analytical (0-4)' },
    { key: 'presentationSkills', label: 'Presentation (0-4)' }, { key: 'networkingSkills', label: 'Networking (0-4)' },
    { key: 'industryCertifications', label: 'Certifications' },
    { key: 'bio', label: 'Professional Bio', fullWidth: true },
];

// ProfileDataItem component (no changes from your last version)
const ProfileDataItem = ({ label, value: rawValue, fullWidth = false }) => { /* ... No change ... */
  let displayValue = rawValue;
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    displayValue = <Text span c="dimmed" fs="italic">N/A</Text>;
  } else if (typeof rawValue === 'number') {
    const isBinaryInterpretation = ['Leadership Exp.', 'Research Exp.', 'Certifications'].includes(label);
    const isRatingInterpretation = label.includes('(0-4)');

    if (isBinaryInterpretation) {
      displayValue = rawValue === 1 ? "Yes" : "No";
    } else if (isRatingInterpretation) {
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
  return <Paper withBorder p="sm" radius="sm" miw={120} style={{ flexGrow: 1 }}>{itemContent}</Paper>;
};


export default function CareerSuggestionsPage() {
  const theme = useMantineTheme();
  const router = useRouter();
  const [predictedCareers, setPredictedCareers] = useState([]);
  const [selectedAICareerName, setSelectedAICareerName] = useState(null);
  const [isManualSelectionMode, setIsManualSelectionMode] = useState(false);
  const [manualIndustry, setManualIndustry] = useState("");
  const [manualSubIndustry, setManualSubIndustry] = useState("");
  const [availableSubIndustries, setAvailableSubIndustries] = useState([]);
  const [onboardingStatusChecked, setOnboardingStatusChecked] = useState(false);
  const [currentSkills, setCurrentSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  const { data: userProfile, loading: profileLoading, error: profileError, fn: fetchUserProfile } = useFetch(getUserMlProfile);
  const { loading: predicting, fn: fetchPredictionsFn, error: predictionError } = useFetch(getCareerPredictions);
  const { loading: savingChoice, fn: saveChoiceFn, error: saveChoiceError, data: saveChoiceResult } = useFetch(saveFinalCareerChoice);
  const { loading: suggestingSkills, fn: suggestSkillsFn, error: suggestSkillsError, data: suggestedSkillsResult } = useFetch(generateSkillsForCareerWithGemini);

  // --- Effects for initial status check, profile loading, and error handling ---
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await getUserOnboardingStatus();
        if (status.isFullyOnboarded) router.push('/dashboard');
        else if (!status.isMlProfileCompleted) router.push('/onboarding');
        else fetchUserProfile();
      } catch (err) {
        toast.error("Could not verify onboarding status."); fetchUserProfile();
      } finally {
        setOnboardingStatusChecked(true);
      }
    };
    checkStatus();
  }, [router]);

   useEffect(() => {
    if (onboardingStatusChecked && !userProfile && !profileLoading && !profileError) {
        fetchUserProfile();
    }
  }, [onboardingStatusChecked, userProfile, profileLoading, profileError, fetchUserProfile]);


  useEffect(() => {
    setCurrentSkills(userProfile?.skills && Array.isArray(userProfile.skills) ? userProfile.skills : []);
  }, [userProfile]);

  useEffect(() => {
    if (profileError) toast.error(profileError.message || "Failed to load profile.");
    if (predictionError) {
        toast.error(predictionError.message || "Could not fetch career predictions.");
        setIsManualSelectionMode(true); // If AI predictions fail, go to manual mode
    }
    if (saveChoiceError) toast.error(saveChoiceError.message || "Failed to save choice.");
    if (suggestSkillsError) toast.error(suggestSkillsError.message || "Could not suggest skills.");
  }, [profileError, predictionError, saveChoiceError, suggestSkillsError]);

  useEffect(() => {
    if (saveChoiceResult && !savingChoice) {
      toast.success(`Career choice and skills saved! Redirecting...`);
      router.push('/dashboard');
      router.refresh();
    }
  }, [saveChoiceResult, savingChoice, router]);

  useEffect(() => {
    if (suggestedSkillsResult && Array.isArray(suggestedSkillsResult) && !suggestingSkills) {
        setCurrentSkills(prevSkills => {
            const currentSkillSet = new Set(prevSkills.map(s => s.toLowerCase()));
            const newSkillsToAdd = suggestedSkillsResult.filter(s => !currentSkillSet.has(s.toLowerCase()));
            const combined = [...prevSkills, ...newSkillsToAdd].slice(0, 20);
            return combined;
        });
        toast.success("AI suggested skills added!");
    }
  }, [suggestedSkillsResult, suggestingSkills]);

  const industryOptions = useMemo(() => allIndustriesData.map(ind => ({ value: ind.name, label: ind.name })), []);

  useEffect(() => {
    const selectedIndustryData = allIndustriesData.find(ind => ind.name === manualIndustry);
    const subs = selectedIndustryData?.subIndustries.map(sub => ({ value: sub, label: sub })) || [];
    setAvailableSubIndustries(subs);
    if (manualSubIndustry && !subs.find(s => s.value === manualSubIndustry)) {
      setManualSubIndustry("");
    }
  }, [manualIndustry, manualSubIndustry]);

  const handleStartPrediction = useCallback(async () => {
    setSelectedAICareerName(null);
    setManualIndustry(""); 
    setManualSubIndustry("");
    setPredictedCareers([]);
    setIsManualSelectionMode(false);
    setCurrentSkills([]);
    
    const predictions = await fetchPredictionsFn();
    if (predictions && Array.isArray(predictions)) {
      setPredictedCareers(predictions.slice(0, 5));
      if (predictions.length === 0 && !predictionError) { // Check !predictionError here
        toast.info("No specific AI career predictions. You can choose manually below.");
        setIsManualSelectionMode(true);
      }
    } else if (!predictionError) { // Also check !predictionError
      toast.error("Failed to get AI predictions.");
      setIsManualSelectionMode(true);
    }
  }, [fetchPredictionsFn, predictionError]); // predictionError added as dep

  const handleSelectSuggestedCareer = (careerName) => {
    const mappedData = careerToIndustryAndSubIndustryMap[careerName];
    if (mappedData) {
      setSelectedAICareerName(careerName);
      setManualIndustry(mappedData.industryId);
      setManualSubIndustry(mappedData.subIndustryName);
      setIsManualSelectionMode(false); 
      setCurrentSkills([]);
    } else {
      toast.error(`Industry mapping not found for ${careerName}. Please choose manually.`);
      setSelectedAICareerName(null);
      setManualIndustry("");
      setManualSubIndustry("");
      setIsManualSelectionMode(true); // Force manual mode if mapping fails
    }
  };

  const handleIndustryDropdownChange = (value) => {
    setManualIndustry(value || "");
    setManualSubIndustry(""); 
    setSelectedAICareerName(null); 
    setIsManualSelectionMode(true); 
    setCurrentSkills([]);
  };
  
  const handleSubIndustryDropdownChange = (value) => {
    setManualSubIndustry(value || "");
    setIsManualSelectionMode(true); 
  };

  const handleAddSkillManually = () => { /* no change */ 
    const trimmedSkill = newSkillInput.trim();
    if (trimmedSkill) {
        if (!currentSkills.some(s => s.toLowerCase() === trimmedSkill.toLowerCase())) {
            if (currentSkills.length < 20) {
                setCurrentSkills(prevSkills => [...prevSkills, trimmedSkill]);
                setNewSkillInput('');
            } else {
                toast.info("Maximum of 20 skills can be added.");
            }
        } else {
            toast.info(`Skill "${trimmedSkill}" is already added.`);
        }
    } else {
        toast.error("Please enter a skill to add.");
    }
  };
  const handleRemoveSkill = (skillToRemove) => { /* no change */
     setCurrentSkills(prevSkills => prevSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSuggestSkills = async () => { /* no change */
    const industryForSkills = manualIndustry;
    const subIndustryForSkills = manualSubIndustry;
    const careerNameForSkillContext = selectedAICareerName || manualSubIndustry || manualIndustry;

    if (!industryForSkills) {
      toast.error("Please select an industry first to get skill suggestions.");
      return;
    }
    const industryData = allIndustriesData.find(ind => ind.name === industryForSkills);
    if (industryData && industryData.subIndustries.length > 0 && !subIndustryForSkills) {
        toast.error(`Please select a sub-industry for ${industryForSkills} to get relevant skill suggestions.`);
        return;
    }
    await suggestSkillsFn(careerNameForSkillContext, industryForSkills, subIndustryForSkills, userProfile?.bio || "", userProfile?.experience || 0);
  };

  const handleConfirmChoice = async () => { /* no change */
    if (!manualIndustry) {
      toast.error("Please select an industry.");
      return;
    }
    const industryData = allIndustriesData.find(ind => ind.name === manualIndustry);
    if (industryData && industryData.subIndustries.length > 0 && !manualSubIndustry) {
        toast.error(`Please select a sub-industry for ${manualIndustry}.`);
        return;
    }
    if (currentSkills.length === 0) {
        toast.error("Please add or generate at least one skill for your chosen path.");
        return;
    }
    const careerNameForSkillContext = selectedAICareerName || manualSubIndustry || manualIndustry;
    await saveChoiceFn(manualIndustry, manualSubIndustry || null, currentSkills, careerNameForSkillContext);
  };
  
  const triggerManualSelectionMode = () => {
    // If not already in manual mode by other means, and AI suggestion was active, clear it.
    if (!isManualSelectionMode && selectedAICareerName) {
        setSelectedAICareerName(null);
        // Keep manualIndustry and manualSubIndustry if they were derived from AI,
        // so user can edit them.
    } else if (!isManualSelectionMode) { // If no AI suggestion was active
        setManualIndustry("");
        setManualSubIndustry("");
    }
    setCurrentSkills([]); // Clear skills when mode changes
    setIsManualSelectionMode(true);
  };


  if (!onboardingStatusChecked || (profileLoading && !userProfile && !profileError)) {
    return <Center style={{ height: 'calc(100vh - 120px)' }}><Loader size="lg" /></Center>;
  }

   if (profileError && !userProfile) { /* Error UI */
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
  
  const showSkillsSection = manualIndustry && (availableSubIndustries.length === 0 || manualSubIndustry);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl" align="center">
        <Title order={1} ta="center" className="gradient-title">
          Finalize Your Career Path & Skills
        </Title>
        <Text ta="center" c="dimmed" maw={650}>
          Review AI suggestions, or choose your industry and specialization manually. Then, define your skills.
        </Text>

        {userProfile && ( /* Profile Display */
             <Paper withBorder p="lg" radius="md" shadow="xs" w="100%">
                <Title order={4} mb="md">Your Profile Summary</Title>
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

        {/* Get AI Suggestions Button */}
        <Stack align="center" mt="lg" w="100%">
          {!predicting && (
            <Button
              size="lg" onClick={handleStartPrediction} leftSection={<IconCpu size="1.2rem" />}
              disabled={profileLoading || !userProfile} loading={predicting}
              loaderProps={{children: <Loader size="sm" color="white"/>}}
            >
              {profileLoading ? "Loading Profile..." : (predicting ? "Analyzing..." : "Get AI Career Suggestions")}
            </Button>
          )}
          {predicting && <Loader mt="md" />}
        </Stack>

        {/* AI Suggestions Display */}
        {predictedCareers.length > 0 && (
          <Stack gap="lg" align="center" w="100%" mt="md">
            <Title order={3} ta="center">Top AI-Powered Suggestions</Title>
            <SimpleGrid cols={{base: 1, sm: 2, md: 3}} spacing="lg" w="100%" maw={900} verticalSpacing="lg">
              {predictedCareers.map((prediction, index) => (
                <Card key={index} shadow="sm" padding="lg" radius="md" withBorder
                  style={{
                    cursor: 'pointer',
                    borderColor: selectedAICareerName === prediction.career ? 'var(--mantine-color-blue-filled)' : 'var(--mantine-color-gray-3)',
                    backgroundColor: selectedAICareerName === prediction.career ? 'var(--mantine-color-blue-light)' : 'var(--mantine-color-body)',
                  }}
                  onClick={() => handleSelectSuggestedCareer(prediction.career)}
                >
                  <Stack align="center" gap="xs">
                    <IconBulbFilled size="2rem" color={selectedAICareerName === prediction.career ? 'var(--mantine-color-blue-filled)' : 'var(--mantine-color-yellow-filled)'} />
                    <Text fw={700} size="lg" ta="center">{prediction.career}</Text>
                    <Badge color="gray" variant="light">
                      {(prediction.probability * 100).toFixed(0)}% Match
                    </Badge>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
             {/* Button to switch to manual mode if AI suggestions are shown */}
            <Button variant="subtle" onClick={triggerManualSelectionMode} mt="md">
                Not satisfied with suggestions? Choose manually.
            </Button>
          </Stack>
        )}
        
        {/* Selected AI Career Info (Display Only) OR Manual Selection Header */}
        {selectedAICareerName && !isManualSelectionMode && manualIndustry && (
            <Paper withBorder p="lg" radius="md" shadow="xs" w="100%" maw={700} mt="xl">
                <Stack>
                    <Group justify="space-between">
                        <Stack gap={0}>
                            <Title order={4}>Selected Path: <Text span c="blue" fw={700}>{selectedAICareerName}</Text></Title>
                            <Text size="sm"><strong>Industry:</strong> {manualIndustry}</Text>
                            {manualSubIndustry && <Text size="sm"><strong>Specialization:</strong> {manualSubIndustry}</Text>}
                        </Stack>
                        <Button variant="outline" onClick={triggerManualSelectionMode} leftSection={<IconEdit size="1rem"/>} size="xs">
                            Change
                        </Button>
                    </Group>
                </Stack>
            </Paper>
        )}

        {/* Manual Industry/Sub-Industry Selection Form - Shown if isManualSelectionMode is true */}
        {isManualSelectionMode && !predicting && (
             <Paper withBorder p="lg" radius="md" shadow="xs" w="100%" maw={700} mt={predictedCareers.length > 0 || selectedAICareerName ? "sm" : "xl"}>
                <Stack>
                    <Title order={4} ta="center">
                        Choose Your Industry & Specialization
                    </Title>
                    <MantineSelect
                        label="Industry"
                        placeholder="Select your primary industry"
                        data={industryOptions}
                        value={manualIndustry}
                        onChange={handleIndustryDropdownChange}
                        searchable clearable required
                        error={!manualIndustry ? "Industry is required" : undefined}
                    />
                    {manualIndustry && (
                        <MantineSelect
                            label="Sub-Industry / Specialization"
                            placeholder="Select your specialization"
                            data={availableSubIndustries}
                            value={manualSubIndustry}
                            onChange={handleSubIndustryDropdownChange}
                            searchable clearable
                            required={availableSubIndustries.length > 0}
                            disabled={availableSubIndustries.length === 0}
                            error={availableSubIndustries.length > 0 && !manualSubIndustry ? "Sub-industry is required" : undefined}
                            description={availableSubIndustries.length === 0 && manualIndustry ? "This industry has no defined sub-specializations." : ""}
                        />
                    )}
                </Stack>
            </Paper>
        )}
        
        {/* Trigger for manual selection if no AI suggestions were loaded or prediction failed */}
        {predictedCareers.length === 0 && !predicting && !manualIndustry && (
            <Paper withBorder p="lg" radius="md" shadow="xs" w="100%" maw={700} mt="xl">
                <Stack align="center" gap="md">
                    <IconSearch size="2.5rem" color={theme.colors.gray[6]} />
                    <Text c="dimmed" ta="center">
                        AI career suggestions are unavailable or you chose not to use them.
                    </Text>
                    <Button variant="filled" onClick={triggerManualSelectionMode}>
                        Choose Your Industry & Specialization Manually
                    </Button>
                </Stack>
            </Paper>
        )}


        {/* Skills Section - Conditional on having a valid industry and sub-industry (if applicable) */}
        {showSkillsSection && (
          <Paper withBorder p="lg" radius="md" shadow="xs" w="100%" maw={700} mt="xl">
            <Stack gap="md">
              <Title order={4} ta="center">
                Your Skills for <Text span fw={700} c="blue">{selectedAICareerName || manualSubIndustry || manualIndustry}</Text>
              </Title>
               <Group>
                <TextInput
                  label="Add Skill" placeholder="e.g., Python, Communication"
                  value={newSkillInput} onChange={(event) => setNewSkillInput(event.currentTarget.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddSkillManually(); } }}
                  style={{ flexGrow: 1 }} error={currentSkills.length >= 20 ? "Max 20 skills" : undefined}
                />
                <Button onClick={handleAddSkillManually} mt="auto" leftSection={<IconPlus size="1rem"/>} disabled={currentSkills.length >=20}>Add</Button>
              </Group>
              <Button
                onClick={handleSuggestSkills} variant="light" leftSection={<IconSparkles size="1rem"/>}
                loading={suggestingSkills}
                disabled={suggestingSkills || (!manualIndustry) || (availableSubIndustries.length > 0 && !manualSubIndustry) }
                fullWidth mt="xs"
              >
                {suggestingSkills ? "Thinking..." : "Suggest Skills with AI"}
              </Button>
              {currentSkills.length > 0 && (
                <Paper p="sm" radius="sm" mt="xs" withBorder bg="var(--mantine-color-gray-0)">
                  <Group gap="xs" wrap="wrap">
                    {currentSkills.map((skill, index) => (
                      <Badge key={index} variant="filled" size="lg" color="blue"
                        rightSection={
                          <ActionIcon size="xs" color="white" variant="transparent" onClick={() => handleRemoveSkill(skill)} aria-label={`Remove skill ${skill}`}>
                            <IconX size="0.8rem" stroke={1.5}/>
                          </ActionIcon>
                        }
                      >{skill}</Badge>
                    ))}
                  </Group>
                </Paper>
              )}
               {currentSkills.length === 0 && !suggestingSkills && (
                <Text c="dimmed" ta="center" py="sm">Add your skills or let AI suggest some.</Text>
               )}
            </Stack>
          </Paper>
        )}

        {/* Confirmation Area */}
        {showSkillsSection && currentSkills.length > 0 && (
          <Stack align="center" mt="xl" gap="md" w="100%" maw={600}>
            <Alert icon={<IconInfoCircle size="1rem" />} title="Confirm Your Path & Skills" color="blue" radius="md">
              You've chosen: <Text span fw={700}>{manualIndustry}</Text>
              {manualSubIndustry && <Text span> (Specialization: <Text span fw={700}>{manualSubIndustry}</Text>)</Text>}.
              Your skills: <Text span fw={500}>{currentSkills.join(', ')}</Text>.
              This will finalize your profile.
            </Alert>
            <Button
              size="lg" onClick={handleConfirmChoice}
              disabled={savingChoice || predicting || suggestingSkills} loading={savingChoice}
              loaderProps={{children: <IconDeviceFloppy size="1.2rem"/>}}
              leftSection={savingChoice ? null : <IconChevronRight size="1.2rem" />} fullWidth
            >
              {savingChoice ? "Saving..." : `Confirm & Proceed to Dashboard`}
            </Button>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}