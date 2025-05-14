"use client";

import React from "react";
import MDEditor from "@uiw/react-md-editor";
import { Box } from "@mantine/core"; // Optional: for consistent spacing if needed

const CoverLetterPreview = ({ content }) => {
  return (
    // data-color-mode="light" ensures MDEditor itself attempts to use light theme.
    // The surrounding Paper in the [id]/page.jsx provides the white background.
    <Box data-color-mode="light" py="md">
      <MDEditor
        value={content}
        preview="preview" // Only show the rendered HTML
        height={700}
        visibleDragbar={false}
        // You can further customize MDEditor preview style if needed
        previewOptions={{
          style: {
            padding: '15px 20px', // Standard padding
            // backgroundColor: '#fff', // Ensured by Paper container
            // color: '#1c1c1e', // Ensure text color is dark
          }
        }}
      />
    </Box>
  );
};

export default CoverLetterPreview;