"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Paper,
  Button,
  TextInput,
  Textarea as MantineTextarea,
  Select as MantineSelect,
  NumberInput,
  Title,
  Text,
  Stack,
  LoadingOverlay,
  Center,
  Radio,
  SegmentedControl,
  Grid,
  Group,
} from "@mantine/core";
import { IconLoader } from '@tabler/icons-react';
import useFetch from "@/hooks/use-fetch";
import { mlOnboardingSchema } from "@/app/lib/schema"; // Use the new schema
import { updateUser } from "@/actions/user";
import { degreeFieldOptions } from "@/data/degreeFields"; // Import degree options

const OnboardingForm = () => { // Removed 'industries' prop as it's not used here anymore
  const router = useRouter();

  const {
    loading: updateLoading,
    fn: updateUserFn,
    data: updateResult,
  } = useFetch(updateUser);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    control,
    setValue, // Keep setValue if needed for dynamic updates
  } = useForm({
    resolver: zodResolver(mlOnboardingSchema),
    defaultValues: {
      experience: "", // Default to empty string
      bio: "",
      fieldOfStudy: "",
      gpa: "",
      extracurricularActivities: "",
      internships: "",
      projects: "",
      leadershipPositions: "", // Default to empty string for NumberInput expecting string
      fieldSpecificCourses: "",
      researchExperience: "", // Default to empty string
      codingSkills: "", // Default to empty string
      communicationSkills: "",
      problemSolvingSkills: "",
      teamworkSkills: "",
      analyticalSkills: "",
      presentationSkills: "",
      networkingSkills: "",
      industryCertifications: "", // Default to empty string
    },
  });

  const onSubmitHandler = async (values) => {
    try {
      // Transform string values from NumberInput to actual numbers or null for the backend if necessary
      // The Zod schema already transforms empty strings to undefined, and numbers to numbers.
      // So, the 'values' object here should be correctly typed for the updateUserFn.
      await updateUserFn(values);
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Failed to complete profile. " + (error.message || "Please try again."));
    }
  };

  useEffect(() => {
    if (updateResult && !updateLoading) {
      toast.success("Profile details saved successfully!");
      // Redirect to the new career suggestion page (we'll create this in Step 2)
      // For now, let's assume it's '/career-suggestions'
      router.push("/career-suggestions"); // TODO: Update this route later
      router.refresh();
    }
  }, [updateResult, updateLoading, router]);

  const skillRatingOptions = [
    { label: "0 (None)", value: "0" },
    { label: "1 (Beginner)", value: "1" },
    { label: "2 (Intermediate)", value: "2" },
    { label: "3 (Advanced)", value: "3" },
    { label: "4 (Expert)", value: "4" },
  ];

  const binaryOptions = [
    { label: "No", value: "0" },
    { label: "Yes", value: "1" },
  ];

  return (
    <Center style={{ minHeight: 'calc(100vh - 120px)', paddingTop: 'var(--mantine-spacing-xl)', paddingBottom: 'var(--mantine-spacing-xl)' }}>
      <Paper shadow="md" p="xl" radius="md" withBorder style={{ maxWidth: '800px', width: '100%' }}>
        <LoadingOverlay visible={updateLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <Stack gap="lg">
          <Stack gap="xs" ta="center" mb="lg">
            <Title order={2} className="gradient-title">Tell Us About Yourself</Title>
            <Text c="dimmed" size="sm">
              This information will help us predict the best career paths for you.
            </Text>
          </Stack>

          <form onSubmit={handleFormSubmit(onSubmitHandler)}>
            <Stack gap="xl">

              {/* Academic and General Experience Section */}
              <Title order={4} c="dimmed">Academic & General Profile</Title>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Controller
                    name="fieldOfStudy"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <MantineSelect
                        label="Field of Study (Degree)"
                        placeholder="Select your degree"
                        data={degreeFieldOptions}
                        value={field.value || ""}
                        onChange={field.onChange}
                        searchable
                        nothingFoundMessage="Nothing found..."
                        error={error?.message}
                        required
                        clearable
                      />
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Controller
                    name="gpa"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <NumberInput
                        {...field}
                        label="GPA"
                        placeholder="Enter your GPA (e.g., 8.5 or 3.5)"
                        min={0}
                        max={10} // Assuming a scale of 10. Adjust if it's 4.
                        decimalScale={2}
                        error={error?.message}
                        value={field.value === "" ? "" : Number(field.value)}
                        onChange={(val) => field.onChange(val === "" ? "" : String(val))}
                      />
                    )}
                  />
                </Grid.Col>
                 <Grid.Col span={{ base: 12, md: 6 }}>
                    <Controller
                        name="experience"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                        <NumberInput
                            {...field}
                            label="Years of Professional Experience"
                            placeholder="Enter total years"
                            min={0}
                            max={60}
                            error={error?.message}
                            value={field.value === "" ? "" : Number(field.value)}
                            onChange={(val) => field.onChange(val === "" ? "" : String(val))}
                        />
                        )}
                    />
                </Grid.Col>
                 <Grid.Col span={{ base: 12, md: 6 }}>
                  <Controller
                    name="extracurricularActivities"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <NumberInput
                        {...field}
                        label="Extracurricular Activities (Count)"
                        placeholder="Number of significant activities"
                        min={0}
                        max={100}
                        error={error?.message}
                        value={field.value === "" ? "" : Number(field.value)}
                        onChange={(val) => field.onChange(val === "" ? "" : String(val))}
                      />
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Controller
                    name="internships"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <NumberInput
                        {...field}
                        label="Internships (Count)"
                        placeholder="Number of internships completed"
                        min={0}
                        max={50}
                        error={error?.message}
                        value={field.value === "" ? "" : Number(field.value)}
                        onChange={(val) => field.onChange(val === "" ? "" : String(val))}
                      />
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Controller
                    name="projects"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <NumberInput
                        {...field}
                        label="Projects (Count)"
                        placeholder="Number of significant projects"
                        min={0}
                        max={100}
                        error={error?.message}
                        value={field.value === "" ? "" : Number(field.value)}
                        onChange={(val) => field.onChange(val === "" ? "" : String(val))}
                      />
                    )}
                  />
                </Grid.Col>
                 <Grid.Col span={{ base: 12, md: 6 }}>
                  <Controller
                    name="fieldSpecificCourses"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <NumberInput
                        {...field}
                        label="Field Specific Courses (Count)"
                        placeholder="Number of relevant courses taken"
                        min={0}
                        max={100}
                        error={error?.message}
                        value={field.value === "" ? "" : Number(field.value)}
                        onChange={(val) => field.onChange(val === "" ? "" : String(val))}
                      />
                    )}
                  />
                </Grid.Col>
              </Grid>

              {/* Binary Yes/No Section */}
              <Title order={4} c="dimmed" mt="md">Achievements & Certifications</Title>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Controller
                    name="leadershipPositions"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Radio.Group
                        {...field}
                        label="Leadership Positions Held?"
                        error={error?.message}
                        // required by schema if not optional
                      >
                        <Group mt="xs">
                          <Radio value="1" label="Yes" />
                          <Radio value="0" label="No" />
                        </Group>
                      </Radio.Group>
                    )}
                  />
                </Grid.Col>
                 <Grid.Col span={{ base: 12, md: 4 }}>
                  <Controller
                    name="researchExperience"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                       <Radio.Group
                        {...field}
                        label="Research Experience?"
                        error={error?.message}
                      >
                        <Group mt="xs">
                          <Radio value="1" label="Yes" />
                          <Radio value="0" label="No" />
                        </Group>
                      </Radio.Group>
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                   <Controller
                    name="industryCertifications"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Radio.Group
                        {...field}
                        label="Industry Certifications?"
                        error={error?.message}
                      >
                        <Group mt="xs">
                          <Radio value="1" label="Yes" />
                          <Radio value="0" label="No" />
                        </Group>
                      </Radio.Group>
                    )}
                  />
                </Grid.Col>
              </Grid>

              {/* Skills Rating Section */}
              <Title order={4} c="dimmed" mt="md">Skills Assessment (Rate 0-4)</Title>
              <Grid gutter="md">
                {[
                  {name: "codingSkills", label: "Coding Skills"},
                  {name: "communicationSkills", label: "Communication Skills"},
                  {name: "problemSolvingSkills", label: "Problem Solving Skills"},
                  {name: "teamworkSkills", label: "Teamwork Skills"},
                  {name: "analyticalSkills", label: "Analytical Skills"},
                  {name: "presentationSkills", label: "Presentation Skills"},
                  {name: "networkingSkills", label: "Networking Skills"},
                ].map(skill => (
                    <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={skill.name}>
                        <Controller
                        name={skill.name}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <MantineSelect
                            {...field}
                            label={skill.label}
                            placeholder={`Rate ${skill.label.toLowerCase()}`}
                            data={skillRatingOptions}
                            error={error?.message}
                            // required by schema if not optional
                            />
                        )}
                        />
                    </Grid.Col>
                ))}
              </Grid>

              <MantineTextarea
                label="Professional Bio (Optional)"
                placeholder="Briefly describe your career aspirations, key strengths, or any other relevant information (max 1000 characters)."
                minRows={3}
                autosize
                {...register("bio")}
                error={errors.bio?.message}
                maxLength={1000}
              />

              <Button
                type="submit"
                fullWidth
                mt="xl"
                size="md"
                loading={updateLoading}
                loaderProps={{ children: <IconLoader size="1rem" className="animate-spin"/> }}
              >
                {updateLoading ? "Saving Profile..." : "Save and Proceed"}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Center>
  );
};

export default OnboardingForm;