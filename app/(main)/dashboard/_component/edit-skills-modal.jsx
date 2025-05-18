// File: app/(main)/dashboard/_component/edit-skills-modal.jsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Modal, Button, TextInput, Group, Stack, Badge, ActionIcon, Text, LoadingOverlay, ScrollArea, Paper // Paper is imported
} from '@mantine/core';
import { IconPlus, IconX, IconDeviceFloppy } from '@tabler/icons-react'; // IconAlertCircle removed if not used
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';
import { updateUserSkills } from '@/actions/user';

const EditSkillsModal = ({ opened, onClose, currentSkills = [], onSkillsSave }) => {
  const [skills, setSkills] = useState([]); // Initialize as empty, will be set by useEffect
  const [newSkill, setNewSkill] = useState('');

  const { loading: savingSkills, fn: saveSkillsFn, error: saveError, data: savedData } = useFetch(updateUserSkills);

  // This effect correctly re-initializes the modal's internal 'skills' state
  // whenever the modal is opened or the currentSkills prop changes.
  useEffect(() => {
    if (opened) {
      console.log("Modal opened, received currentSkills:", currentSkills);
      setSkills(Array.isArray(currentSkills) ? [...currentSkills] : []); 
      setNewSkill(''); // Clear input field when modal opens
    }
  }, [currentSkills, opened]);

  useEffect(() => {
    if (savedData && !savingSkills) {
        toast.success("Skills updated successfully!");
        if (onSkillsSave) onSkillsSave(savedData.skills || []); // Pass updated skills back
        onClose();
    }
    if (saveError) {
        toast.error(saveError.message || "Failed to save skills.");
    }
  }, [savedData, savingSkills, saveError, onClose, onSkillsSave]);


  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill) {
        if (!skills.some(s => s.toLowerCase() === trimmedSkill.toLowerCase())) {
            if (skills.length < 25) {
                setSkills(prev => [...prev, trimmedSkill]);
                setNewSkill('');
            } else {
                toast.error("You can add a maximum of 25 skills.");
            }
        } else {
            toast.info(`Skill "${trimmedSkill}" already added.`);
        }
    } else {
        toast.error("Please enter a skill to add.");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const handleSave = async () => {
    await saveSkillsFn(skills);
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        // setNewSkill(''); // Already handled in useEffect based on 'opened'
        onClose();
      }}
      title="Edit Your Skills"
      size="lg"
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <LoadingOverlay visible={savingSkills} />
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Add or remove skills that best represent your expertise.
        </Text>
        <Group>
          <TextInput
            placeholder="Enter a skill (e.g., Python)"
            value={newSkill}
            onChange={(event) => setNewSkill(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAddSkill();
              }
            }}
            style={{ flexGrow: 1 }}
            error={skills.length >= 25 ? "Max 25 skills" : undefined}
          />
          <Button onClick={handleAddSkill} leftSection={<IconPlus size="1rem" />} disabled={skills.length >=25}>
            Add Skill
          </Button>
        </Group>

        {skills.length > 0 ? (
          <Paper withBorder p="sm" radius="sm" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <ScrollArea h={180}>
                <Group gap="xs" wrap="wrap">
                {skills.map((skill, index) => (
                    <Badge
                    key={index}
                    variant="light" // Using 'light' for user's skills in modal, can be 'filled' too
                    color="blue"
                    size="lg"
                    rightSection={
                        <ActionIcon 
                            size="xs" 
                            color="blue" // This will make the X icon blue
                            variant="transparent" 
                            onClick={() => handleRemoveSkill(skill)}
                            aria-label={`Remove ${skill}`}
                        >
                        <IconX size="0.8rem" stroke={1.5} />
                        </ActionIcon>
                    }
                    >
                    {skill}
                    </Badge>
                ))}
                </Group>
            </ScrollArea>
          </Paper>
        ) : (
          <Text c="dimmed" ta="center" py="md">No skills added yet. Type a skill and click "Add Skill".</Text>
        )}

        {skills.length > 25 && (
            <Text c="red" size="xs" mt="xs">
                You have exceeded the maximum limit of 25 skills.
            </Text>
        )}

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} leftSection={<IconDeviceFloppy size="1rem"/>} disabled={savingSkills || skills.length > 25}>
            {savingSkills ? "Saving..." : "Save Skills"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default EditSkillsModal;