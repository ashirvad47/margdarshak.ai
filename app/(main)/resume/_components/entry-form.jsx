"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"; // No Controller needed here directly for this change
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import {
  Button,
  TextInput,
  Textarea as MantineTextarea,
  Card as MantineCard,
  Group,
  Stack,
  Checkbox,
  Text,
  Title,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconSparkles,
  IconPlus,
  IconX,
  IconPencil, // Added for edit button
  IconLoader,
} from '@tabler/icons-react';
import { entrySchema } from "@/app/lib/schema";
import { improveWithAI } from "@/actions/resume";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

// Date formatting functions (ensure they are robust)
const formatInputDate = (dateString) => {
  if (!dateString) return "";
  // Tries to parse "yyyy-MM" or "MMM yyyy"
  let date = parse(dateString, "yyyy-MM", new Date());
  if (isNaN(date.getTime())) {
    date = parse(dateString, "MMM yyyy", new Date());
  }
  return isNaN(date.getTime()) ? dateString : format(date, "yyyy-MM");
};

const formatDisplayDate = (dateString) => {
    if (!dateString || dateString === "Present") return dateString;
    let date = parse(dateString, "yyyy-MM", new Date());
    if (isNaN(date.getTime())) {
        date = parse(dateString, "MMM yyyy", new Date());
    }
    return isNaN(date.getTime()) ? dateString : format(date, "MMM yyyy");
};

export function EntryForm({ type, entries = [], onChange }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const {
    register,
    handleSubmit: validateEntryForm, // Renamed for clarity
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "", organization: "", startDate: "",
      endDate: "", description: "", current: false,
    },
  });

  const currentFieldValue = watch("current");
  const descriptionFieldValue = watch("description");

  useEffect(() => {
    if (editingIndex !== null && entries[editingIndex]) {
      const entryToEdit = entries[editingIndex];
      reset({
        ...entryToEdit,
        startDate: formatInputDate(entryToEdit.startDate),
        endDate: entryToEdit.current ? "" : formatInputDate(entryToEdit.endDate),
      });
      setIsAdding(true);
    } else {
        // When not editing, or editingIndex is cleared, reset to defaults
        // This prevents stale data if user cancels an edit and then clicks "Add New"
        if (!isAdding) { // Only reset if the form isn't meant to be open for a new entry
            reset({ title: "", organization: "", startDate: "", endDate: "", description: "", current: false });
        }
    }
  }, [editingIndex, entries, reset, isAdding]);


  const handleSaveEntry = (data) => { // This function is called on successful validation of entry form
    const formattedEntry = {
      ...data,
      startDate: formatDisplayDate(data.startDate),
      endDate: data.current ? "Present" : formatDisplayDate(data.endDate), // Use "Present"
    };

    let newEntries;
    if (editingIndex !== null) {
      newEntries = entries.map((entry, index) =>
        index === editingIndex ? formattedEntry : entry
      );
    } else {
      newEntries = [...entries, formattedEntry];
    }
    onChange(newEntries);
    reset({ title: "", organization: "", startDate: "", endDate: "", description: "", current: false });
    setIsAdding(false);
    setEditingIndex(null);
  };

  const handleDelete = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
    if (index === editingIndex) { // If deleting the entry being edited
        handleCancel();
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    // useEffect will handle populating the form
  };

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
  } = useFetch(improveWithAI);

  useEffect(() => {
    if (improvedContent && !isImproving) {
      setValue("description", improvedContent);
      toast.success("Description improved successfully!");
    }
  }, [improvedContent, isImproving, setValue]);

  const handleImproveDescription = async () => {
    if (!descriptionFieldValue) {
      toast.error("Please enter a description first");
      return;
    }
    await improveWithAIFn({
      current: descriptionFieldValue,
      type: type.toLowerCase(),
    });
  };

  const handleCancel = () => {
    reset({ title: "", organization: "", startDate: "", endDate: "", description: "", current: false });
    setIsAdding(false);
    setEditingIndex(null);
  }

  return (
    <Stack gap="md">
      {entries.map((item, index) => (
        <MantineCard key={index} shadow="xs" padding="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Stack gap={0} style={{flex: 1, overflow: 'hidden'}}>
              <Title order={5} lineClamp={1}>{item.title} @ {item.organization}</Title>
              <Text size="xs" c="dimmed">
                {item.current && item.endDate === "Present" // Ensure "Present" is used for current
                  ? `${formatDisplayDate(item.startDate)} - Present`
                  : `${formatDisplayDate(item.startDate)} - ${formatDisplayDate(item.endDate)}`}
              </Text>
            </Stack>
            <Group gap="xs" wrap="nowrap">
              <Tooltip label={`Edit ${type}`} withArrow>
                 <ActionIcon variant="subtle" color="gray" onClick={() => handleEdit(index)}>
                  <IconPencil size="1rem" />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={`Delete ${type}`} withArrow>
                <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(index)}>
                  <IconX size="1rem" />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
            {item.description}
          </Text>
        </MantineCard>
      ))}

      {isAdding && (
        <MantineCard withBorder shadow="xs" p="lg" radius="md">
          {/* NO <form> TAG HERE */}
          <Stack gap="md">
            <Title order={4}>
              {editingIndex !== null ? `Edit ${type}` : `Add New ${type}`}
            </Title>
            <Group grow>
              <TextInput
                label="Title/Position"
                placeholder="E.g., Software Engineer, BSc Computer Science"
                {...register("title")}
                error={errors.title?.message}
                // required // react-hook-form handles this via schema
              />
              <TextInput
                label="Organization/Company/School"
                placeholder="E.g., Google, MIT"
                {...register("organization")}
                error={errors.organization?.message}
                // required
              />
            </Group>

            <Group grow>
              <TextInput
                label="Start Date"
                type="month"
                {...register("startDate")}
                error={errors.startDate?.message}
                // required
              />
              <TextInput
                label="End Date"
                type="month"
                {...register("endDate")}
                disabled={currentFieldValue}
                error={errors.endDate?.message}
              />
            </Group>

            <Checkbox
              label={`I currently ${type === 'Experience' ? 'work' : (type === 'Education' ? 'study' : 'work on this project')} here`}
              {...register("current")}
              // No need for onChange here if react-hook-form handles it with watch
            />

            <MantineTextarea
              label="Description"
              placeholder={`Describe your role, responsibilities, and achievements...`}
              minRows={4}
              autosize
              {...register("description")}
              error={errors.description?.message}
              // required
            />
            <Button
              variant="light"
              color="blue"
              size="xs"
              leftSection={isImproving ? <IconLoader size="0.9rem" className="animate-spin" /> : <IconSparkles size="0.9rem" />}
              onClick={handleImproveDescription} // No type="button" needed if not in a form
              disabled={isImproving || !descriptionFieldValue}
              fullWidth={false}
              style={{ alignSelf: 'flex-start' }}
            >
              {isImproving ? "Improving..." : "Improve with AI"}
            </Button>

            <Group justify="flex-end" mt="md">
              <Button variant="default" color="gray" onClick={handleCancel} type="button">
                Cancel
              </Button>
              {/* This button now triggers validation for this specific entry's fields */}
              <Button
                onClick={validateEntryForm(handleSaveEntry)} // Use the renamed handleSubmit
                leftSection={<IconPlus size="1rem" />}
                type="button" // Ensure it's not submitting the outer form
              >
                {editingIndex !== null ? `Save ${type}` : `Add ${type}`}
              </Button>
            </Group>
          </Stack>
          {/* NO </form> TAG HERE */}
        </MantineCard>
      )}

      {!isAdding && (
        <Button
          fullWidth
          variant="outline"
          color="gray"
          leftSection={<IconPlus size="1.125rem" />}
          onClick={() => {
            reset({ title: "", organization: "", startDate: "", endDate: "", description: "", current: false }); // Reset before opening for new
            setEditingIndex(null);
            setIsAdding(true);
          }}
          type="button"
        >
          Add New {type}
        </Button>
      )}
    </Stack>
  );
}