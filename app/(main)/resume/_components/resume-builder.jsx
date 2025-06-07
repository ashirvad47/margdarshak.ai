"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Button,
  Tabs as MantineTabs,
  TextInput,
  Textarea as MantineTextarea,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Divider,
  Box,
  LoadingOverlay,
  SimpleGrid,
} from "@mantine/core";
import {
  IconDownload,
  IconEdit,
  IconDeviceFloppy,
  IconDeviceDesktop,
} from '@tabler/icons-react';
import { saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import { ResumePreview } from "./ResumePreview";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";

// Helper to determine the source of default values.
const getInitialFormValues = (savedJson, profile) => {
  if (savedJson && typeof savedJson === 'object' && Object.keys(savedJson).length > 0) {
    return savedJson;
  }
  if (profile) {
    return {
      contactInfo: { email: profile.email || "", mobile: "", linkedin: "", twitter: "" },
      summary: profile.bio || "",
      skills: profile.skills?.join(', ') || "",
      experience: [], education: [], projects: []
    };
  }
  return {
    contactInfo: { email: "", mobile: "", linkedin: "", twitter: "" },
    summary: "", skills: "", experience: [], education: [], projects: []
  };
}

export default function ResumeBuilder({ initialResumeData, userProfile }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { user } = useUser();
  const html2pdfModule = useRef(null);

  const {
    control,
    register,
    handleSubmit: handleFormSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    // Set default values based on priority: Saved Resume > User Profile > Blank
    defaultValues: getInitialFormValues(initialResumeData?.jsonContent, userProfile),
  });
  
  const formValues = watch();

  useEffect(() => {
    import('html2pdf.js/dist/html2pdf.min.js').then(module => {
      html2pdfModule.current = module.default;
    }).catch(err => console.error("Failed to load html2pdf.js", err));
  }, []);

  const { loading: isSaving, fn: saveResumeFn, data: saveResult, error: saveError } = useFetch(saveResume);

  useEffect(() => {
    if (saveResult && !isSaving) toast.success("Resume saved successfully!");
    if (saveError) toast.error(saveError.message || "Failed to save resume");
  }, [saveResult, saveError, isSaving]);

  const getMarkdownContent = (data) => {
    const { summary, skills, experience, education, projects } = data;
    const contactInfo = `Email: ${data.contactInfo.email} | Mobile: ${data.contactInfo.mobile} | LinkedIn: ${data.contactInfo.linkedin}`;
    return [
      `# ${user?.fullName || 'Your Name'}\n\n${contactInfo}`,
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ].filter(Boolean).join("\n\n---\n\n");
  };

  const generatePDF = async () => {
    if (!html2pdfModule.current) {
      toast.error("PDF generation library is not loaded yet.");
      return;
    }
    setIsGeneratingPDF(true);
    toast.info("Generating PDF...");
    try {
      const element = document.getElementById("resume-live-preview");
      if (!element) throw new Error("Preview area not found for PDF generation.");
      const opt = {
        margin: [5, 5, 5, 5],
        filename: `${(user?.fullName || 'resume').replace(/ /g, '_')}_resume.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      await html2pdfModule.current().from(element).set(opt).save();
      toast.success("PDF generated successfully!");
    } catch (error) {
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const onSubmitHandler = async (data) => {
    const markdownContent = getMarkdownContent(data);
    if (!markdownContent) {
      toast.error("Cannot save an empty resume.");
      return;
    }
    await saveResumeFn(data, markdownContent); // Pass both JSON and Markdown
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={1} className="gradient-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          Resume Builder
        </Title>
        <Group>
          <Button variant="filled" color="blue" onClick={handleFormSubmit(onSubmitHandler)} loading={isSaving} leftSection={<IconDeviceFloppy size="1rem" />}>
            Save Resume
          </Button>
          <Button variant="outline" color="gray" onClick={generatePDF} loading={isGeneratingPDF} leftSection={<IconDownload size="1rem" />}>
            Download PDF
          </Button>
        </Group>
      </Group>

      <MantineTabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
        <MantineTabs.List grow>
          <MantineTabs.Tab value="edit" leftSection={<IconEdit size="1rem" />}>Form Editor</MantineTabs.Tab>
          <MantineTabs.Tab value="preview" leftSection={<IconDeviceDesktop size="1rem" />}>Live Preview</MantineTabs.Tab>
        </MantineTabs.List>

        <MantineTabs.Panel value="edit" pt="lg">
          <Paper withBorder shadow="xs" p="xl" radius="md">
            <form onSubmit={handleFormSubmit(onSubmitHandler)}>
              <Stack gap="xl">
                {/* Form fields remain the same */}
                <Box>
                  <Title order={3} mb="md">Contact Information</Title>
                  <Paper withBorder p="md" radius="sm" bg="var(--mantine-color-gray-0)">
                    <SimpleGrid cols={{base: 1, sm: 2}} spacing="md">
                      <TextInput label="Email" placeholder="your@email.com" {...register("contactInfo.email")} error={errors.contactInfo?.email?.message} />
                      <TextInput label="Mobile Number" placeholder="+1 234 567 8900" {...register("contactInfo.mobile")} error={errors.contactInfo?.mobile?.message} />
                      <TextInput label="LinkedIn URL" placeholder="https://linkedin.com/in/your-profile" {...register("contactInfo.linkedin")} error={errors.contactInfo?.linkedin?.message} />
                      <TextInput label="Twitter/X Profile" placeholder="https://twitter.com/your-handle" {...register("contactInfo.twitter")} error={errors.contactInfo?.twitter?.message} />
                    </SimpleGrid>
                  </Paper>
                </Box>
                <Divider />

                <Box>
                  <Title order={3} mb="sm">Professional Summary</Title>
                  <MantineTextarea placeholder="Write a compelling professional summary..." minRows={4} autosize {...register("summary")} error={errors.summary?.message} />
                </Box>
                <Divider />

                <Box>
                  <Title order={3} mb="sm">Skills</Title>
                  <MantineTextarea placeholder="List your key skills, separated by commas (e.g., JavaScript, React, Node.js)" minRows={3} autosize {...register("skills")} error={errors.skills?.message} />
                  <Text size="xs" c="dimmed" mt={4}>Separate multiple skills with commas.</Text>
                </Box>
                <Divider />

                {[
                  { title: "Work Experience", fieldName: "experience" },
                  { title: "Education", fieldName: "education" },
                  { title: "Projects", fieldName: "projects" },
                ].map(section => (
                  <Box key={section.fieldName}>
                    <Title order={3} mb="md">{section.title}</Title>
                    <Controller name={section.fieldName} control={control} render={({ field }) => ( <EntryForm type={section.title.replace('Work ', '')} entries={field.value || []} onChange={field.onChange} /> )}/>
                    {errors[section.fieldName] && <Text c="red" size="sm" mt="xs">{errors[section.fieldName].message || (errors[section.fieldName].root && errors[section.fieldName].root.message)}</Text>}
                    {section.fieldName !== "projects" && <Divider mt="xl" />}
                  </Box>
                ))}
              </Stack>
            </form>
          </Paper>
        </MantineTabs.Panel>

        <MantineTabs.Panel value="preview" pt="lg">
           <div id="resume-live-preview">
                <ResumePreview data={formValues} />
            </div>
        </MantineTabs.Panel>
      </MantineTabs>
      <LoadingOverlay visible={isSaving || isGeneratingPDF} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
    </Stack>
  );
}