"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react'; // <<< ADDED useState and useEffect (if needed)
import { format } from "date-fns";
import { toast } from "sonner";
import Link from 'next/link'; // Was missing in previous full example, but needed for the <Button component={Link}>
import {
  Paper,
  Button,
  Text,
  Title,
  Group,
  Stack,
  ActionIcon,
  Tooltip,
  Modal,
  Highlight,
} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { IconEye, IconTrash, IconAlertTriangle, IconPlayerPlay } from '@tabler/icons-react'; // Added IconPlayerPlay for consistency
import { deleteCoverLetter } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch"; // Assuming useFetch is still relevant

export default function CoverLetterList({ coverLetters }) {
  const router = useRouter();
  const [opened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [selectedLetterId, setSelectedLetterId] = useState(null);

  const { loading: isDeleting, fn: deleteLetterFn } = useFetch(deleteCoverLetter);

  const handleDeleteClick = (id) => {
    setSelectedLetterId(id);
    openModal();
  };

  const confirmDelete = async () => {
    if (selectedLetterId && !isDeleting) {
      try {
        await deleteLetterFn(selectedLetterId);
        toast.success("Cover letter deleted successfully!");
        router.refresh(); // Refresh data on the page
      } catch (error) {
        toast.error(error.message || "Failed to delete cover letter");
      } finally {
        closeModal();
        setSelectedLetterId(null);
      }
    }
  };

  if (!coverLetters?.length) {
    return (
      <Paper shadow="sm" p="xl" withBorder ta="center" radius="md">
        <Title order={3} mb="xs">No Cover Letters Yet</Title>
        <Text c="dimmed">
          Create your first cover letter to get started.
        </Text>
        <Button
          component={Link}
          href="/ai-cover-letter/new"
          mt="md"
          variant="light"
        >
          Create New Cover Letter
        </Button>
      </Paper>
    );
  }

  return (
    <>
      <Stack gap="lg">
        {coverLetters.map((letter) => (
          <Paper key={letter.id} shadow="sm" p="lg" radius="md" withBorder className="group relative">
            <Group justify="space-between" align="flex-start">
              <Stack gap="xs">
                <Title order={4} className="gradient-title">
                  {letter.jobTitle} at {letter.companyName}
                </Title>
                <Text size="xs" c="dimmed">
                  Created {format(new Date(letter.createdAt), "PPP")}
                </Text>
                <Text size="sm" c="dimmed" lineClamp={3} mt="xs">
                  {letter.jobDescription}
                </Text>
              </Stack>
              <Group gap="xs">
                <Tooltip label="View/Edit Letter" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => router.push(`/ai-cover-letter/${letter.id}`)}
                  >
                    <IconEye size="1.125rem" />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete Letter" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDeleteClick(letter.id)}
                  >
                    <IconTrash size="1.125rem" />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Paper>
        ))}
      </Stack>

      {/* Deletion Confirmation Modal */}
      <Modal
        opened={opened}
        onClose={closeModal}
        title={
          <Group gap="xs">
            <IconAlertTriangle color="var(--mantine-color-red-7)" />
            <Title order={4}>Delete Cover Letter?</Title>
          </Group>
        }
        centered
        size="md"
        overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
        }}
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete this cover letter? This action cannot be undone.
          </Text>
          <Text fw={500}>
            "{coverLetters.find(l => l.id === selectedLetterId)?.jobTitle} at {coverLetters.find(l => l.id === selectedLetterId)?.companyName}"
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="default" color="gray" onClick={closeModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete} loading={isDeleting}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}