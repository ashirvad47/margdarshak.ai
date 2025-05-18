// File: app/(main)/dashboard/_component/dashboard-view.jsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
    IconBriefcase, IconChartLine, IconTrendingUp, IconTrendingDown,
    IconEdit,
    IconCircleCheckFilled,
    IconCirclePlus,
    IconSparkles,
    IconAlertTriangle,
    IconAtom2,
    IconNetwork,
    IconDeviceHeartMonitor,
    IconBuildingFactory2,
    IconShoppingCart,
    IconWorldShare,
    IconUserCog,
    IconChartDots3,
    IconRecycle,
    IconArrowBadgeRight,
    IconLoader,
    IconInfoCircle,
} from '@tabler/icons-react';
import { format, formatDistanceToNow } from "date-fns";
import {
    Paper, Text, Title, Badge as MantineBadge, Progress as MantineProgress,
    SimpleGrid, Group, Stack, useMantineTheme, Alert, Button, Divider, Box,
    ThemeIcon, Center,Loader
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EditSkillsModal from './edit-skills-modal';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getTrendExplanationsWithGemini } from "@/actions/dashboard";
import useFetch from "@/hooks/use-fetch";

const DashboardView = ({ userSkills: initialUserSkills, userIndustry, insights }) => {
    const theme = useMantineTheme();
    const router = useRouter();
    const [isSkillsModalOpened, { open: openSkillsModal, close: closeSkillsModal }] = useDisclosure(false);
    const [currentUserSkills, setCurrentUserSkills] = useState(initialUserSkills || []);

    const [trendExplanations, setTrendExplanations] = useState({});
    const {
        loading: loadingExplanations,
        fn: fetchExplanationsFn,
        error: explanationsError,
        data: fetchedExplanationsData,
    } = useFetch(getTrendExplanationsWithGemini);

    useEffect(() => {
        setCurrentUserSkills(Array.isArray(initialUserSkills) ? [...initialUserSkills] : []);
    }, [initialUserSkills]);

    useEffect(() => {
        const keyTrends = insights?.keyTrends;
        const industry = insights?.industry;

        if (keyTrends?.length > 0 && industry) {
            const currentTrendKeysString = keyTrends.slice().sort().join(',');
            const loadedTrendKeysString = Object.keys(trendExplanations).slice().sort().join(',');
            if (Object.keys(trendExplanations).length === 0 || currentTrendKeysString !== loadedTrendKeysString) {
                fetchExplanationsFn(keyTrends, industry);
            }
        } else {
            if (Object.keys(trendExplanations).length > 0) {
                setTrendExplanations({});
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [insights?.industry, insights?.keyTrends?.join(','), fetchExplanationsFn]);


    useEffect(() => {
        if (fetchedExplanationsData) {
            setTrendExplanations(fetchedExplanationsData);
        }
        if (explanationsError) {
            console.error("Failed to load trend explanations:", explanationsError);
            toast.error("Could not load details for industry trends.");
            if (insights?.keyTrends?.length > 0) {
                const errorExplanations = insights.keyTrends.reduce((acc, trend) => {
                    acc[trend] = "Explanation currently unavailable due to an error.";
                    return acc;
                }, {});
                setTrendExplanations(errorExplanations);
            }
        }
    }, [fetchedExplanationsData, explanationsError, insights?.keyTrends]);

    const handleSkillsSaved = useCallback((updatedSkillsFromModal) => {
        setCurrentUserSkills(updatedSkillsFromModal || []);
        closeSkillsModal();
        toast.success("Your skills have been updated!");
    }, [closeSkillsModal]);

    const currentUserSkillsSet = useMemo(() => {
        return new Set((currentUserSkills || []).map(skill => skill.toLowerCase()));
    }, [currentUserSkills]);

    if (!insights) {
        return (
            <Paper p="xl" withBorder shadow="sm" ta="center">
                <Stack align="center" gap="md">
                    <IconAlertTriangle size="3rem" color={theme.colors.gray[5]} />
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
            case "high": return theme.colors.green[6];
            case "medium": return theme.colors.yellow[6];
            case "low": return theme.colors.red[6];
            default: return theme.colors.gray[4];
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
    const lastUpdatedDate = insights.lastUpdated ? format(new Date(insights.lastUpdated), "dd MMM yy") : 'N/A';
    const nextUpdateDistance = insights.nextUpdate ? formatDistanceToNow(new Date(insights.nextUpdate), { addSuffix: true }) : 'N/A';
    const recommendedIndustrySkills = insights.recommendedSkills || [];
    const keyIndustryTrendsToDisplay = insights.keyTrends || [];

    const categorizedSkills = useMemo(() => {
        const skillsMap = { matched: [], missing: [], unique: [] };
        const recommendedLower = new Set(recommendedIndustrySkills.map(s => s.toLowerCase()));
        const userSkillsLower = currentUserSkillsSet;
        recommendedIndustrySkills.forEach(skill => {
            if (userSkillsLower.has(skill.toLowerCase())) skillsMap.matched.push(skill);
            else skillsMap.missing.push(skill);
        });
        (currentUserSkills || []).forEach(skill => {
            if (!recommendedLower.has(skill.toLowerCase())) skillsMap.unique.push(skill);
        });
        for (const key in skillsMap) skillsMap[key].sort((a, b) => a.localeCompare(b));
        return skillsMap;
    }, [recommendedIndustrySkills, currentUserSkills, currentUserSkillsSet]);

    const SkillBadge = ({ skill, type }) => {
        let badgeColorName, badgeVariant, LeftIcon, iconColorHex;

        switch (type) {
            case 'matched':
                badgeColorName = 'green'; badgeVariant = 'light'; LeftIcon = IconCircleCheckFilled; iconColorHex = theme.colors.green[7]; break;
            case 'missing':
                badgeColorName = 'blue'; badgeVariant = 'outline'; LeftIcon = IconCirclePlus; iconColorHex = theme.colors.blue[7]; break;
            case 'unique':
                badgeColorName = 'grape'; badgeVariant = 'light'; LeftIcon = IconSparkles; iconColorHex = theme.colors.grape[7]; break;
            default:
                badgeColorName = 'gray'; badgeVariant = 'light'; LeftIcon = null; iconColorHex = theme.colors.gray[7];
        }

        // For 'light' variant, Mantine typically derives background from the color prop.
        // If more specific control needed, you can use theme.fn.rgba or a style object.
        // The `color` prop on MantineBadge for 'light' and 'outline' variants primarily affects text and border.
        // Background for 'light' variant is often theme.{colorName}[0] or similar light shade.
        let customBgStyle = {};
        if (badgeVariant === 'light') {
            if (type === 'matched') customBgStyle.backgroundColor = theme.colors.green[0];
            else if (type === 'unique') customBgStyle.backgroundColor = theme.colors.grape[0];
            // For 'missing' (outline), background is usually transparent.
        }


        return (
            <MantineBadge
                variant={badgeVariant}
                color={badgeColorName} // Use the color name (e.g., "green", "blue")
                size="lg"
                radius="sm"
                styles={{
                    root: {
                        ...customBgStyle, // Apply custom background for light variants
                        borderColor: type === 'missing' ? theme.colors.blue[4] : undefined, // Slightly darker border for outline
                        color: type === 'missing' ? theme.colors.blue[8] : (type === 'matched' ? theme.colors.green[8] : type === 'unique' ? theme.colors.grape[8] : theme.colors.gray[8]),
                        paddingLeft: LeftIcon ? '0.5rem' : '0.75rem',
                        paddingRight: '0.75rem',
                        height: '2rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                    },
                    label: { fontSize: theme.fontSizes.sm },
                    leftSection: { marginRight: '0.35rem', display: 'flex', alignItems: 'center' }
                }}
                leftSection={LeftIcon ? <LeftIcon size="1rem" style={{ color: iconColorHex }} /> : undefined}
            >
                {skill}
            </MantineBadge>
        );
    };

    const TrendItem = ({ trend, explanation, isLoadingExplanation }) => {
        const theme = useMantineTheme();
        let TrendIcon = IconArrowBadgeRight;
        const lowerTrend = trend.toLowerCase();
        if (lowerTrend.includes("ai") || lowerTrend.includes("machine learning") || lowerTrend.includes("ml")) TrendIcon = IconAtom2;
        else if (lowerTrend.includes("cloud") || lowerTrend.includes("saas") || lowerTrend.includes("digital transformation")) TrendIcon = IconNetwork;
        else if (lowerTrend.includes("cybersecurity") || lowerTrend.includes("security") || lowerTrend.includes("privacy")) TrendIcon = IconAlertTriangle;
        else if (lowerTrend.includes("remote work") || lowerTrend.includes("collaboration") || lowerTrend.includes("globalization")) TrendIcon = IconWorldShare;
        else if (lowerTrend.includes("devops") || lowerTrend.includes("agile") || lowerTrend.includes("methodologies")) TrendIcon = IconUserCog;
        else if (lowerTrend.includes("data") || lowerTrend.includes("analytics") || lowerTrend.includes("big data")) TrendIcon = IconChartDots3;
        else if (lowerTrend.includes("sustainability") || lowerTrend.includes("green tech") || lowerTrend.includes("esg")) TrendIcon = IconRecycle;
        else if (lowerTrend.includes("e-commerce") || lowerTrend.includes("retail")) TrendIcon = IconShoppingCart;
        else if (lowerTrend.includes("health") || lowerTrend.includes("medical") || lowerTrend.includes("pharma")) TrendIcon = IconDeviceHeartMonitor;
        else if (lowerTrend.includes("manufacturing") || lowerTrend.includes("industrial")) TrendIcon = IconBuildingFactory2;

        return (
            <Box>
                <Group wrap="nowrap" align="flex-start" gap="md">
                    <ThemeIcon variant="light" color={theme.colors.gray[5]} size={38} radius="md">
                        <TrendIcon size="1.3rem" stroke={1.5} />
                    </ThemeIcon>
                    <Stack gap={3}>
                        <Text size="sm" fw={500} lh={1.3}>{trend}</Text>
                        {isLoadingExplanation && <Loader size="xs" color="gray" mt={2} />}
                        {!isLoadingExplanation && explanation && (
                            <Text size="xs" c="dimmed" lh={1.4}>{explanation}</Text>
                        )}
                        {!isLoadingExplanation && !explanation && (
                            <Text size="xs" c="dimmed" fs="italic">Explanation not available.</Text>
                        )}
                    </Stack>
                </Group>
            </Box>
        );
    };

    return (
        <>
            <Stack gap="xl">
                <Group justify="space-between" align="center">
                    <Title order={2}>{insights.industry || userIndustry} Insights</Title>
                    <MantineBadge variant="light" color="gray" size="md">Last updated: {lastUpdatedDate}</MantineBadge>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
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
                        <Title order={3}>{insights.demandLevel || 'N/A'}</Title><div style={{ height: '0.5rem', width: '100%', borderRadius: theme.radius.sm, marginTop: theme.spacing.sm, backgroundColor: getDemandLevelColor(insights.demandLevel)}} />
                    </Paper>
                </SimpleGrid>

                <Paper withBorder p="lg" radius="md" shadow="sm">
                    <Stack gap="xs" mb="md"><Title order={4}>Salary Ranges by Role</Title><Text size="sm" c="dimmed">Displaying salaries (in thousands) for common roles in {insights.industry || userIndustry}.</Text></Stack>
                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%"><BarChart data={salaryData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke={theme.colors.gray[3]} /><XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.colors.gray[7] }} angle={-20} textAnchor="end" height={60} interval={0} /><YAxis tick={{ fontSize: 12, fill: theme.colors.gray[7] }} label={{ value: 'Salary (K)', angle: -90, position: 'insideLeft', offset: -5, style: {fontSize: '12px', fill: theme.colors.gray[7]} }} /><Tooltip contentStyle={{ backgroundColor: theme.white, borderColor: theme.colors.gray[3], borderRadius: theme.radius.md,}} labelStyle={{ color: theme.black, fontWeight: 500 }} /><Bar dataKey="min" fill={theme.colors.blue[2]} name="Min Salary (K)" radius={[4, 4, 0, 0]} /><Bar dataKey="median" fill={theme.colors.blue[4]} name="Median Salary (K)" radius={[4, 4, 0, 0]} /><Bar dataKey="max" fill={theme.colors.blue[6]} name="Max Salary (K)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                    </div>
                </Paper>

                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
                    <Paper withBorder p="lg" radius="md" shadow="sm">
                        <Group justify="space-between" align="center" mb="md">
                            <Title order={4}>Skills Overview: {insights.industry || userIndustry}</Title>
                            <Button variant="subtle" size="xs" onClick={openSkillsModal} leftSection={<IconEdit size="0.9rem" />}>Edit My Skills</Button>
                        </Group>
                        {(categorizedSkills.matched.length === 0 && categorizedSkills.missing.length === 0 && categorizedSkills.unique.length === 0) ? (
                             <Text size="sm" c="dimmed" ta="center" py="md">No skills information available. Add your skills or check industry recommendations.</Text>
                        ) : (
                            <Stack gap="lg">
                                {categorizedSkills.matched.length > 0 && ( <Box> <Text size="sm" fw={500} mb="xs">Matched Skills (You Have & Recommended):</Text> <Group gap="xs" wrap="wrap"> {categorizedSkills.matched.map(skill => <SkillBadge key={`matched-${skill}`} skill={skill} type="matched" />)} </Group> </Box> )}
                                {categorizedSkills.missing.length > 0 && ( <Box> <Text size="sm" fw={500} mb="xs">Development Areas (Recommended, You Lack):</Text> <Group gap="xs" wrap="wrap"> {categorizedSkills.missing.map(skill => <SkillBadge key={`missing-${skill}`} skill={skill} type="missing" />)} </Group> </Box> )}
                                {categorizedSkills.unique.length > 0 && ( <Box> <Text size="sm" fw={500} mb="xs">Your Unique Skills (Not Specifically Recommended):</Text> <Group gap="xs" wrap="wrap"> {categorizedSkills.unique.map(skill => <SkillBadge key={`unique-${skill}`} skill={skill} type="unique" />)} </Group> </Box> )}
                            </Stack>
                        )}
                    </Paper>

                    {/* THIS IS THE CORRECTED SECTION FOR KEY INDUSTRY TRENDS */}
                    <Paper withBorder p="lg" radius="md" shadow="sm">
                        <Title order={4} mb="sm">Key Industry Trends</Title>
                        <Text size="sm" c="dimmed" mb="lg">
                            Current trends shaping {insights.industry || userIndustry}.
                        </Text>
                        <Stack gap="md">
                            {keyIndustryTrendsToDisplay.length > 0 ? (
                                keyIndustryTrendsToDisplay.map((trend, index) => (
                                    <TrendItem
                                        key={index}
                                        trend={trend}
                                        explanation={trendExplanations[trend]}
                                        isLoadingExplanation={loadingExplanations && !trendExplanations[trend]}
                                    />
                                ))
                            ) : (
                                <Text size="sm" c="dimmed" ta="center" py="xl">
                                    No key trends available for this industry at the moment.
                                </Text>
                            )}
                            {loadingExplanations && keyIndustryTrendsToDisplay.length > 0 && Object.keys(trendExplanations).length < keyIndustryTrendsToDisplay.length && (
                                 <Center mt="md">
                                    <Loader color="gray" size="sm"/> 
                                    <Text ml="xs" size="sm" c="dimmed">Loading trend details...</Text>
                                 </Center>
                            )}
                        </Stack>
                    </Paper>
                </SimpleGrid>
            </Stack>

            <EditSkillsModal
                opened={isSkillsModalOpened}
                onClose={closeSkillsModal}
                currentSkills={currentUserSkills}
                onSkillsSave={handleSkillsSaved}
            />
        </>
    );
};

export default DashboardView;