"use client";

import { useState, useEffect } from "react";
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
  Group, // Keep if used elsewhere, not strictly needed for the fix itself
  Center,
} from "@mantine/core";
import { IconLoader } from '@tabler/icons-react';
import useFetch from "@/hooks/use-fetch";
import { onboardingSchema } from "@/app/lib/schema"; // Assuming this schema expects experience as string
import { updateUser } from "@/actions/user";

const OnboardingForm = ({ industries }) => {
  const router = useRouter();
  const [selectedMantineIndustry, setSelectedMantineIndustry] = useState(null);

  const {
    loading: updateLoading,
    fn: updateUserFn,
    data: updateResult,
  } = useFetch(updateUser);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      industry: "",
      subIndustry: "",
      experience: "", // MODIFIED: Default to empty string
      skills: "",
      bio: ""
    }
  });

  const onSubmitHandler = async (values) => {
    try {
      const formattedIndustry = `${values.industry}-${values.subIndustry
        .toLowerCase()
        .replace(/ /g, "-")}`;

      // If your backend expects 'experience' as a number, you might need to parse it here:
      // const payload = {
      //   ...values,
      //   industry: formattedIndustry,
      //   experience: values.experience === "" ? null : Number(values.experience), // Or handle as per backend needs
      // };
      // await updateUserFn(payload);

      await updateUserFn({ // As is, 'experience' will be a string (e.g., "5", "")
        ...values,
        industry: formattedIndustry,
      });
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Failed to complete profile. " + (error.message || "Please try again."));
    }
  };

  useEffect(() => {
    if (updateResult && !updateLoading) {
      toast.success("Profile completed successfully!");
      router.push("/dashboard");
      router.refresh();
    }
  }, [updateResult, updateLoading, router]);

  const watchedIndustryId = watch("industry");

  useEffect(() => {
    if (watchedIndustryId) {
      setSelectedMantineIndustry(
        industries.find((ind) => ind.id === watchedIndustryId)
      );
      // setValue("subIndustry", ""); // Reset subIndustry when industry changes
    } else {
      setSelectedMantineIndustry(null);
    }
  }, [watchedIndustryId, industries, setValue]);

  const industryOptions = industries.map(ind => ({ value: ind.id, label: ind.name }));
  const subIndustryOptions = selectedMantineIndustry?.subIndustries.map(sub => ({ value: sub, label: sub })) || [];

  return (
    <Center style={{ minHeight: 'calc(100vh - 60px)', paddingTop: 'var(--mantine-spacing-xl)', paddingBottom: 'var(--mantine-spacing-xl)' }}>
      <Paper shadow="md" p="xl" radius="md" withBorder style={{ maxWidth: '600px', width: '100%' }}>
        <LoadingOverlay visible={updateLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }}/>
        <Stack gap="lg">
          <Stack gap="xs" ta="center">
            <Title order={2} className="gradient-title">Complete Your Profile</Title>
            <Text c="dimmed" size="sm">
              Select your industry to get personalized career insights and recommendations.
            </Text>
          </Stack>

          <form onSubmit={handleFormSubmit(onSubmitHandler)} className="space-y-6">
            <Stack gap="md">
              <Controller
                name="industry"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <MantineSelect
                    label="Industry"
                    placeholder="Select an industry"
                    data={industryOptions}
                    value={field.value || ""}
                    onChange={(value) => {
                        field.onChange(value);
                        setValue("subIndustry", ""); // Reset subIndustry when industry changes
                    }}
                    searchable
                    nothingFoundMessage="Nothing found..."
                    error={error?.message}
                    required
                    clearable
                  />
                )}
              />

              {watchedIndustryId && (
                <Controller
                  name="subIndustry"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <MantineSelect
                      label="Specialization"
                      placeholder="Select your specialization"
                      data={subIndustryOptions}
                      value={field.value || ""}
                      onChange={field.onChange}
                      searchable
                      nothingFoundMessage="Nothing found..."
                      disabled={!watchedIndustryId || subIndustryOptions.length === 0}
                      error={error?.message}
                      required
                      clearable
                    />
                  )}
                />
              )}

              <Controller
                name="experience"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <NumberInput
                    {...field} // Spread field first
                    label="Years of Experience"
                    placeholder="Enter years of experience"
                    min={0}
                    max={50}
                    error={error?.message}
                    required
                    // MODIFIED: field.value is a string from react-hook-form (e.g., "", "5")
                    // NumberInput's value prop expects `number | ''`
                    value={field.value === "" ? "" : Number(field.value)}
                    // MODIFIED: NumberInput's onChange provides `number | ''` (e.g., 5, '')
                    // react-hook-form's field.onChange should receive a string for Zod
                    onChange={(valueFromNumberInput) => { // valueFromNumberInput is number | ''
                      field.onChange(String(valueFromNumberInput)); // Converts 5 to "5", or '' to ""
                    }}
                  />
                )}
              />

              <TextInput
                label="Skills"
                placeholder="E.g., Python, JavaScript, Project Management"
                description="Separate multiple skills with commas"
                {...register("skills")}
                error={errors.skills?.message}
              />

              <MantineTextarea
                label="Professional Bio (Optional)"
                placeholder="Tell us about your professional background, achievements, and career goals..."
                minRows={4}
                autosize
                {...register("bio")}
                error={errors.bio?.message}
              />

              <Button
                type="submit"
                fullWidth
                mt="md"
                loading={updateLoading}
                loaderProps={{ children: <IconLoader size="1rem" className="animate-spin"/> }}
              >
                {updateLoading ? "Saving..." : "Complete Profile"}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Center>
  );
};

export default OnboardingForm;