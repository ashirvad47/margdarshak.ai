"use client";

import { useState, useEffect, useRef } from "react"; // Ensure useState, useEffect, useRef are imported
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
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
  Tooltip,
  SimpleGrid,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconDownload,
  IconEdit,
  IconDeviceFloppy,
  IconLoader,
  IconDeviceDesktop,
} from '@tabler/icons-react';
import { saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
// Dynamically import html2pdf, so no static import here

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState(initialContent ? "preview" : "edit");
  const [previewContent, setPreviewContent] = useState(initialContent || "");
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // <<< CORRECTLY DECLARED HERE
  const html2pdfModule = useRef(null);

  const {
    control,
    register,
    handleSubmit: handleFormSubmit,
    watch,
    formState: { errors },
    reset: resetForm,
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: { email: "", mobile: "", linkedin: "", twitter: "" },
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  useEffect(() => {
    if (initialContent) {
      setPreviewContent(initialContent);
      setActiveTab("preview");
    }
  }, [initialContent, resetForm]);

  // Dynamically import html2pdf
  useEffect(() => {
    import('html2pdf.js/dist/html2pdf.min.js').then(module => {
      html2pdfModule.current = module.default;
    }).catch(err => {
      console.error("Failed to load html2pdf.js", err);
      toast.error("PDF generation feature might be unavailable.");
    });
  }, []);


  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValues = watch();

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent || initialContent || "");
    }
  }, [formValues, activeTab, initialContent]);

  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    if (!user || !contactInfo) return "";
    const parts = [];
    if (contactInfo.email) parts.push(`Email: ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`Mobile: ${contactInfo.mobile}`);
    if (contactInfo.linkedin) parts.push(`LinkedIn: [${contactInfo.linkedin}](${contactInfo.linkedin})`);
    if (contactInfo.twitter) parts.push(`Twitter: [${contactInfo.twitter}](${contactInfo.twitter})`);

    return parts.length > 0
      ? `## <div align="center">${user.fullName || 'Your Name'}</div>\n\n<div align="center" style="font-size: 0.9em;">\n\n${parts.join(" &nbsp; | &nbsp; ")}\n\n</div>`
      : "";
  };


  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills.split(',').map(s => `- ${s.trim()}`).join('\n')}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n---\n\n");
  };

  const generatePDF = async () => {
    if (!html2pdfModule.current) {
      toast.error("PDF generation library is not loaded yet. Please try again shortly.");
      return;
    }
    setIsGeneratingPDF(true);
    toast.info("Generating PDF... Please wait.");
    try {
      const element = document.getElementById("resume-pdf-preview-area");
      if (!element) {
          toast.error("Preview area not found for PDF generation.");
          setIsGeneratingPDF(false);
          return;
      }
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${(user?.fullName || 'resume').replace(/ /g, '_')}_resume.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdfModule.current().from(element).set(opt).save();
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. " + (error.message || "Unknown error"));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const onSubmitHandler = async () => {
    if (!previewContent.trim()) {
        toast.error("Cannot save an empty resume.");
        return;
    }
    await saveResumeFn(previewContent);
  };


  return (
    <Stack gap="lg" data-color-mode="light">
      <Group justify="space-between" align="center">
        <Title order={1} className="gradient-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          Resume Builder
        </Title>
        <Group>
          <Button
            variant="filled"
            color="blue"
            onClick={handleFormSubmit(onSubmitHandler)}
            loading={isSaving}
            leftSection={<IconDeviceFloppy size="1rem" />}
          >
            Save Resume
          </Button>
          <Button
            variant="outline"
            color="gray"
            onClick={generatePDF}
            loading={isGeneratingPDF} // This now uses the correctly declared state
            leftSection={<IconDownload size="1rem" />}
          >
            Download PDF
          </Button>
        </Group>
      </Group>

      <MantineTabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
        <MantineTabs.List grow>
          <MantineTabs.Tab value="edit" leftSection={<IconEdit size="1rem" />}>
            Form Editor
          </MantineTabs.Tab>
          <MantineTabs.Tab value="preview" leftSection={<IconDeviceDesktop size="1rem" />}>
            Markdown Preview
          </MantineTabs.Tab>
        </MantineTabs.List>

        <MantineTabs.Panel value="edit" pt="lg">
          <Paper withBorder shadow="xs" p="xl" radius="md">
            <form onSubmit={handleFormSubmit(onSubmitHandler)}>
              <Stack gap="xl">
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
                  <MantineTextarea
                    placeholder="Write a compelling professional summary..."
                    minRows={4}
                    autosize
                    {...register("summary")}
                    error={errors.summary?.message}
                  />
                </Box>
                <Divider />

                <Box>
                  <Title order={3} mb="sm">Skills</Title>
                  <MantineTextarea
                    placeholder="List your key skills, separated by commas (e.g., JavaScript, React, Node.js)"
                    minRows={3}
                    autosize
                    {...register("skills")}
                    error={errors.skills?.message}
                  />
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
                    <Controller
                      name={section.fieldName}
                      control={control}
                      render={({ field }) => (
                        <EntryForm
                          type={section.title.replace('Work ', '')}
                          entries={field.value || []}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {errors[section.fieldName] && (
                      <Text c="red" size="sm" mt="xs">
                        {errors[section.fieldName].message || (errors[section.fieldName].root && errors[section.fieldName].root.message)}
                      </Text>
                    )}
                    {section.fieldName !== "projects" && <Divider mt="xl" />}
                  </Box>
                ))}
              </Stack>
            </form>
          </Paper>
        </MantineTabs.Panel>

        <MantineTabs.Panel value="preview" pt="lg">
          {activeTab === "preview" && (
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              mb="sm"
              onClick={() => setResumeMode(resumeMode === "preview" ? "edit" : "preview")}
              leftSection={resumeMode === "preview" ? <IconEdit size="0.9rem" /> : <IconDeviceDesktop size="0.9rem" />}
            >
              {resumeMode === "preview" ? "Edit Markdown" : "Show Preview"}
            </Button>
          )}

          {activeTab === "preview" && resumeMode === "edit" && (
            <Paper withBorder p="xs" mb="sm" bg="var(--mantine-color-yellow-0)" c="var(--mantine-color-yellow-7)">
              <Group gap="xs">
                <IconAlertTriangle size="1.1rem" />
                <Text size="sm" fw={500}>
                  Manual edits to Markdown will be overwritten if you update the form. Save Markdown separately if needed.
                </Text>
              </Group>
            </Paper>
          )}
          <Paper withBorder radius="md" shadow="sm" p="xs" id="resume-pdf-preview-area">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode === "preview" ? "preview" : "edit"}
              visibleDragbar={false}
              previewOptions={{
                style: { padding: '20px', backgroundColor: '#fff', color: '#000' }
              }}
            />
          </Paper>
        </MantineTabs.Panel>
      </MantineTabs>
      {/* Correctly use isGeneratingPDF for the LoadingOverlay condition */}
      <LoadingOverlay visible={isSaving || isGeneratingPDF} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
    </Stack>
  );
}