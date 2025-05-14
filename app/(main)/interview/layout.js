import React, { Suspense } from "react"; // Import React
import { BarLoader } from "react-spinners";
import { Container, Center } from '@mantine/core'; // Mantine components

export default function InterviewLayout({ children }) { // Renamed for clarity
  return (
    // No specific container needed here if the child pages (page.jsx, mock/page.jsx) define their own full-width containers.
    // The pt-16 from the root main layout should handle header spacing.
    // <Container fluid px={0} py={0}>
      <Suspense
        fallback={
          <Center style={{ height: 'calc(100vh - 60px)', width: '100%' }}> {/* 60px for header height */}
            <BarLoader width={"80%"} color="var(--mantine-color-gray-5)" />
          </Center>
        }
      >
        {children}
      </Suspense>
    // </Container>
  );
}