import { Inter } from "next/font/google";
import "./globals.css"; // Your global styles, Tailwind base
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";


import '@mantine/core/styles.css'; 

import { MantineProvider, ColorSchemeScript, mantineHtmlProps, createTheme } from '@mantine/core';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Career Coach",
  description: "Your AI-powered guide to professional success.",
  icons: {
    icon: '/logo.png',
  },
};

// Define your basic Mantine light theme
const theme = createTheme({
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  primaryColor: 'gray', // Example: Using gray as a primary for a neutral, Apple-like feel
  primaryShade: 6, // For light mode, a shade like 6 or 7 for gray is often good
  // You can define other colors, spacing, radii, etc. here
  defaultRadius: 'md', // Example: sets default border-radius for many components
});

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        // baseTheme: undefined, // Let Clerk use its default light theme
        elements: {
          formButtonPrimary: "mantine-Button-root mantine-Button-filled mantine-Button-md mantine-Group-child",
          button: "mantine-Button-root mantine-Button-filled mantine-Button-md",
          avatarBox: "w-10 h-10", // Tailwind class for Clerk component
          userButtonPopoverCard: "shadow-xl",
          userPreviewMainIdentifier: "font-semibold",
        },
      }}
    >
      {/* Correct usage of mantineHtmlProps as an object */}
      <html lang="en" {...mantineHtmlProps}>
        <head>
          <ColorSchemeScript defaultColorScheme="light" />
        </head>
        <body className={inter.className}>
          {/*
            withNormalizeCSS: Applies Mantine's NormalizeCSS
            withGlobalStyles: Applies Mantine's default global styles (fonts, body styles, etc.)
            These are good to include for a consistent base.
          */}
          <MantineProvider
            theme={theme}
            defaultColorScheme="light"
            withNormalizeCSS
            withGlobalStyles
          >
            <Header />
            <main className="min-h-screen pt-16"> {/* pt-16 for fixed header */}
              {children}
            </main>
            <Toaster richColors theme="light" />
            <footer className="bg-gray-50 py-8 text-center">
              <div className="container mx-auto px-4 text-sm text-gray-500">
                <p>All Rights Reserved</p> 
              </div>
            </footer>
          </MantineProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}