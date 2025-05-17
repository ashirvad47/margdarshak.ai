// File: app/(main)/dashboard/_component/dashboard-view.jsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } // Added useCallback
    from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
    IconBriefcase, IconChartLine, IconTrendingUp, IconTrendingDown, IconBrain, IconUserScan, IconEdit,
    IconCircleCheck, IconCircleDashed,
} from '@tabler/icons-react';
import { format, formatDistanceToNow } from "date-fns";
import {
    Paper, Text, Title, Badge as MantineBadge, Progress as MantineProgress, SimpleGrid, Group, Stack, useMantineTheme, Alert, Button, Divider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EditSkillsModal from './edit-skills-modal';
import { useRouter } from 'next/navigation'; // Import useRouter
import { toast } from 'sonner'; // Assuming you have a toast library for notifications

const DashboardView = ({ userSkills: initialUserSkills, userIndustry, insights }) => {
    const theme = useMantineTheme();
    const router = useRouter(); // For page refresh if needed
    const [isSkillsModalOpened, { open: openSkillsModal, close: closeSkillsModal }] = useDisclosure(false);
    
    // This state holds the skills displayed on the dashboard and passed to the modal
    const [currentUserSkills, setCurrentUserSkills] = useState(initialUserSkills || []);

    // Effect to update local state if the initial prop from the server changes
    // This is important for initial load and if the page re-fetches data via Next.js navigation
    useEffect(() => {
    console.log("DashboardView: initialUserSkills prop received on load/refresh:", initialUserSkills);
    setCurrentUserSkills(Array.isArray(initialUserSkills) ? [...initialUserSkills] : []);
    }, [initialUserSkills]);

    const handleSkillsSaved = useCallback((updatedSkillsFromModal) => {
        console.log("DashboardView: handleSkillsSaved called with:", updatedSkillsFromModal);
        setCurrentUserSkills(updatedSkillsFromModal || []);
        closeSkillsModal();
        // Consider a full page refresh if you want to ensure all server data is re-fetched,
        // though just updating skills locally should be fine for the skills display.
        // router.refresh(); // Uncomment if you face deep state issues or need to reload everything
        toast.success("Your skills have been updated!"); // Moved toast here for consistency
    }, [closeSkillsModal, router]);


    const currentUserSkillsSet = useMemo(() => {
        return new Set((currentUserSkills || []).map(skill => skill.toLowerCase()));
    }, [currentUserSkills]);

    if (!insights) {
        return (
            <Paper p="xl" withBorder shadow="sm" ta="center">
                <Stack align="center" gap="md">
                    <IconChartLine size="3rem" color={theme.colors.gray[5]} />
                    <Title order={3}>Industry Insights Unavailable</Title>
                    <Text c="dimmed">
                        We couldn't load the insights for {userIndustry || "your industry"} at the moment.
                    </Text>
                </Stack>
            </Paper>
        );
    }

    const salaryData = (insights.salaryRanges || []).map((range) => ({
        name: range.role, min: range.min / 1000, max: range.max / 1000, median: range.median / 1000,
    }));
    const getDemandLevelColor = (level) => {
        switch (level?.toLowerCase()) {
            case "high": return theme.colors.green[6]; case "medium": return theme.colors.yellow[6];
            case "low": return theme.colors.red[6]; default: return theme.colors.gray[5];
        }
    };
    const getMarketOutlookInfo = (outlook) => {
        switch (outlook?.toLowerCase()) {
            case "positive": return { Icon: IconTrendingUp, color: theme.colors.green[6] };
            case "neutral": return { Icon: IconChartLine, color: theme.colors.yellow[6] };
            case "negative": return { Icon: IconTrendingDown, color: theme.colors.red[6] };
            default: return { Icon: IconChartLine, color: theme.colors.gray[6] };
        }
    };

    const outlookInfo = getMarketOutlookInfo(insights.marketOutlook);
    const OutlookIcon = outlookInfo.Icon;
    const outlookColor = outlookInfo.color;
    const lastUpdatedDate = insights.lastUpdated ? format(new Date(insights.lastUpdated), "dd MMM yyyy") : 'N/A';
    const nextUpdateDistance = insights.nextUpdate ? formatDistanceToNow(new Date(insights.nextUpdate), { addSuffix: true }) : 'N/A';
    const recommendedIndustrySkills = insights.recommendedSkills || [];

    const allDisplayableSkills = useMemo(() => {
        const skillMap = new Map();
        recommendedIndustrySkills.forEach(skill => {
            const lowerSkill = skill.toLowerCase();
            skillMap.set(lowerSkill, { name: skill, isRecommended: true, userHas: currentUserSkillsSet.has(lowerSkill) });
        });
        (currentUserSkills || []).forEach(skill => {
            const lowerSkill = skill.toLowerCase();
            if (skillMap.has(lowerSkill)) {
                skillMap.get(lowerSkill).userHas = true;
            } else {
                skillMap.set(lowerSkill, { name: skill, isRecommended: false, userHas: true });
            }
        });
        return Array.from(skillMap.values()).sort((a,b) => a.name.localeCompare(b.name));
    }, [recommendedIndustrySkills, currentUserSkills, currentUserSkillsSet]);

    return (
        <>
            <Stack gap="lg">
                <Group justify="space-between" align="center">
                    <Title order={2}>{insights.industry || userIndustry} Insights</Title>
                    <MantineBadge variant="light" color="gray" size="md">Last updated: {lastUpdatedDate}</MantineBadge>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                    {/* Market Overview Cards ... no change from your code */}
                    <Paper withBorder p="md" radius="md" shadow="sm">
                        <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Market Outlook</Text><OutlookIcon style={{ color: outlookColor }} size="1.2rem" stroke={1.5} /></Group>
                        <Title order={3}>{insights.marketOutlook || 'N/A'}</Title><Text size="xs" c="dimmed">Next update {nextUpdateDistance}</Text>
                    </Paper>
                    <Paper withBorder p="md" radius="md" shadow="sm">
                        <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Industry Growth</Text><IconTrendingUp style={{ color: theme.colors.gray[6] }} size="1.2rem" stroke={1.5} /></Group>
                        <Title order={3}>{(insights.growthRate || 0).toFixed(1)}%</Title><MantineProgress value={insights.growthRate || 0} mt="sm" size="sm" radius="sm" />
                    </Paper>
                    <Paper withBorder p="md" radius="md" shadow="sm">
                        <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Demand Level</Text><IconBriefcase style={{ color: theme.colors.gray[6] }} size="1.2rem" stroke={1.5} /></Group>
                        <Title order={3}>{insights.demandLevel || 'N/A'}</Title><div style={{ height: '0.5rem', width: '100%', borderRadius: 'var(--mantine-radius-sm)', marginTop: 'var(--mantine-spacing-sm)', backgroundColor: getDemandLevelColor(insights.demandLevel)}} />
                    </Paper>
                </SimpleGrid>

                <Paper withBorder p="md" radius="md" shadow="sm"> {/* Salary Chart ... no change */}
                    <Stack gap="xs" mb="md"><Title order={4}>Salary Ranges by Role</Title><Text size="sm" c="dimmed">Displaying salaries (in thousands) for common roles in {insights.industry || userIndustry}.</Text></Stack>
                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%"><BarChart data={salaryData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke={theme.colors.gray[3]} /><XAxis dataKey="name" tick={{ fontSize: 12, fill: theme.colors.gray[7] }} /><YAxis tick={{ fontSize: 12, fill: theme.colors.gray[7] }} /><Tooltip contentStyle={{ backgroundColor: theme.white, borderColor: theme.colors.gray[3], borderRadius: theme.radius.md,}} labelStyle={{ color: theme.black, fontWeight: 500 }} /><Bar dataKey="min" fill={theme.colors.blue[2]} name="Min Salary (K)" radius={[4, 4, 0, 0]} /><Bar dataKey="median" fill={theme.colors.blue[4]} name="Median Salary (K)" radius={[4, 4, 0, 0]} /><Bar dataKey="max" fill={theme.colors.blue[6]} name="Max Salary (K)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                    </div>
                </Paper>

                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                    <Paper withBorder p="md" radius="md" shadow="sm">
                        <Group justify="space-between" align="center" mb="sm">
                            <Title order={4}>Skills Overview: {insights.industry || userIndustry}</Title>
                            <Button variant="subtle" size="xs" onClick={openSkillsModal} leftSection={<IconEdit size="0.9rem" />}>Edit My Skills</Button>
                        </Group>
                        <Text size="sm" c="dimmed" mb="md">Review your skills against industry recommendations.</Text>
                        {allDisplayableSkills.length > 0 ? (
                            <Group gap="xs" wrap="wrap">
                                {allDisplayableSkills.map((skillData) => {
                                    let badgeColor = "gray"; let badgeVariant = "outline"; let leftSection = <IconCircleDashed size="0.9rem" />;
                                    if (skillData.userHas && skillData.isRecommended) {
                                        badgeColor = "teal"; badgeVariant = "filled"; leftSection = <IconCircleCheck size="0.9rem" />;
                                    } else if (skillData.userHas && !skillData.isRecommended) {
                                        badgeColor = "blue"; badgeVariant = "light"; leftSection = <IconUserScan size="0.9rem" />;
                                    }
                                    return (
                                        <MantineBadge key={`skill-${skillData.name}`} variant={badgeVariant} color={badgeColor} size="sm" radius="sm" leftSection={leftSection}>
                                            {skillData.name}
                                        </MantineBadge>
                                    );
                                })}
                            </Group>
                        ) : (
                            <Text size="sm" c="dimmed" ta="center" py="md">No skills information available. Edit your skills or check industry recommendations.</Text>
                        )}
                    </Paper>

                    <Paper withBorder p="md" radius="md" shadow="sm"> {/* Key Industry Trends ... no change */}
                        <Title order={4} mb="sm">Key Industry Trends</Title><Text size="sm" c="dimmed" mb="md">Current trends shaping {insights.industry || userIndustry}.</Text>
                        <Stack gap="sm">
                            {(insights.keyTrends || []).map((trend, index) => (
                                <Group key={index} gap="xs" wrap="nowrap" align="flex-start"><div style={{ minWidth: '0.5rem', height: '0.5rem', marginTop: '0.3rem', borderRadius: '50%', backgroundColor: 'var(--mantine-color-grape-filled)'}} /><Text size="sm">{trend}</Text></Group>
                            ))}
                            {!(insights.keyTrends && insights.keyTrends.length > 0) && <Text size="sm" c="dimmed">N/A</Text>}
                        </Stack>
                    </Paper>
                </SimpleGrid>
            </Stack>

            <EditSkillsModal
                opened={isSkillsModalOpened}
                onClose={closeSkillsModal}
                currentSkills={currentUserSkills} // Pass the state variable
                onSkillsSave={handleSkillsSaved}
            />
        </>
    );
};

export default DashboardView;