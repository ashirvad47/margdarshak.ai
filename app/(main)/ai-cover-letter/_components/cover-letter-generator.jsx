"use client";

// Removed useState as it's not used directly here anymore with react-hook-form handling state
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect } from "react"; // Added for side effect on generation
import { useRouter } from "next/navigation";
import {
  Button,
  TextInput,
  Textarea as MantineTextarea, // Aliased
  Paper, // Using Paper for Card
  Title,
  Text,
  Stack,
  Group,
  LoadingOverlay, // For loading state
  SimpleGrid, // For layout
} from "@mantine/core";
import { IconLoader, IconMailForward } from '@tabler/icons-react';
import { generateCoverLetter } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch";
import { coverLetterSchema } from "@/app/lib/schema"; // Ensure this schema is still appropriate

export default function CoverLetterGenerator() {
  const router = useRouter();

  const {
    register,
    handleSubmit: handleFormSubmit, // Renamed
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: { // Initialize default values
        companyName: "",
        jobTitle: "",
        jobDescription: "",
    }
  });

  const {
    loading: isGenerating, // Renamed from 'generating' for clarity
    fn: generateLetterFn,
    data: generatedLetter,
  } = useFetch(generateCoverLetter);

  useEffect(() => {
    if (generatedLetter?.id && !isGenerating) { // Check for id to ensure it's a valid letter object
      toast.success("Cover letter generated successfully!");
      router.push(`/ai-cover-letter/${generatedLetter.id}`);
      reset(); // Reset form after successful generation
    }
  }, [generatedLetter, isGenerating, router, reset]);

  const onSubmitHandler = async (data) => { // Renamed
    try {
      await generateLetterFn(data);
    } catch (error) {
      toast.error(error.message || "Failed to generate cover letter");
    }
  };

  return (
    <Paper shadow="md" p="xl" radius="md" withBorder>
      <LoadingOverlay visible={isGenerating} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <Stack gap="lg">
        <Stack gap="xs">
          <Title order={3}>Job Details</Title>
          <Text c="dimmed" size="sm">
            Provide information about the position you're applying for.
          </Text>
        </Stack>

        <form onSubmit={handleFormSubmit(onSubmitHandler)}>
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Company Name"
                placeholder="Enter company name"
                {...register("companyName")}
                error={errors.companyName?.message}
                required
                withAsterisk={false} // Mantine handles 'required' asterisk by default if label is present
              />
              <TextInput
                label="Job Title"
                placeholder="Enter job title"
                {...register("jobTitle")}
                error={errors.jobTitle?.message}
                required
                withAsterisk={false}
              />
            </SimpleGrid>

            <MantineTextarea
              label="Job Description"
              placeholder="Paste the full job description here..."
              minRows={6} // Increased rows
              autosize
              {...register("jobDescription")}
              error={errors.jobDescription?.message}
              required
              withAsterisk={false}
            />

            <Group justify="flex-end" mt="md">
              <Button
                type="submit"
                loading={isGenerating}
                loaderProps={{ children: <IconLoader size="1rem" className="animate-spin"/> }}
                leftSection={!isGenerating ? <IconMailForward size="1.125rem" /> : undefined}
              >
                {isGenerating ? "Generating..." : "Generate Cover Letter"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}