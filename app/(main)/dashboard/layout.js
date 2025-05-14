import React, { Suspense } from "react";
import { BarLoader } from "react-spinners";
import { Title, Container, Box, Center } from '@mantine/core'; // IMPORT Center HERE

export default function DashboardLayout({ children }) {
  return (
    <Container fluid px="md" py="md">
      <Box mb="xl">
        <Title
          order={1}
          className="gradient-title"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}
        >
          Industry Insights
        </Title>
      </Box>
      <Suspense
        fallback={
          <Center style={{ height: '200px' }}> {/* Now Center is defined */}
            <BarLoader width={"80%"} color="var(--mantine-color-gray-5)" />
          </Center>
        }
      >
        {children}
      </Suspense>
    </Container>
  );
}