// "use client";

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Box } from '@mantine/core'; // Using Mantine's Box for styling consistency if needed

// const RotatingText = ({ words, color, interval = 2500, isMobile = false }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
//     }, interval);
//     return () => clearInterval(timer);
//   }, [words.length, interval]);

//   const currentWord = words[currentIndex];
//   const isEnglish = currentWord.lang === 'en';

//   // Adjust font size slightly for mobile if needed, to prevent overflow
//   // This would ideally be part of the responsive design in hero.jsx's Title clamp
//   const fontSizeStyle = isMobile ? { fontSize: 'clamp(2.8rem, 6vw, 5rem)' } : {};


//   const variants = {
//     enter: (direction) => ({
//       y: direction > 0 ? "100%" : "-100%",
//       opacity: 0,
//       scale: 0.8,
//       // We could add a slight rotationX for more 3D, but keeping it simpler for now
//       // x: isEnglish ? 0 : (direction > 0 ? -5 : 5), // Slight horizontal shift for non-English to enhance right-align feel
//     }),
//     center: {
//       zIndex: 1,
//       y: 0,
//       opacity: 1,
//       scale: 1,
//       // x: 0,
//       transition: {
//         y: { type: "spring", stiffness: 200, damping: 25 },
//         opacity: { duration: 0.3 },
//         scale: { duration: 0.3 },
//         // x: { type: "spring", stiffness: 300, damping: 30}
//       },
//     },
//     exit: (direction) => ({
//       zIndex: 0,
//       y: direction < 0 ? "100%" : "-100%",
//       opacity: 0,
//       scale: 0.8,
//       // x: isEnglish ? 0 : (direction < 0 ? 5: -5),
//       transition: {
//         y: { type: "spring", stiffness: 200, damping: 25, duration: 0.4 }, // Ensure exit is smooth
//         opacity: { duration: 0.2 },
//         scale: { duration: 0.2 },
//         // x: { type: "spring", stiffness: 300, damping: 30}
//       },
//     }),
//   };

//   // Store previous index to determine animation direction
//   const [prevIndex, setPrevIndex] = useState(0);
//   useEffect(() => {
//     setPrevIndex(currentIndex);
//   }, [currentIndex]);
//   const direction = currentIndex > prevIndex || (currentIndex === 0 && prevIndex === words.length -1 ) ? 1 : -1;


//   return (
//     <Box
//       component="span"
//       style={{
//         display: 'inline-block', // Takes width of its content
//         position: 'relative',   // For AnimatePresence and absolute positioning of text
//         height: 'auto',      // Should match the line height of the title effectively.
//                                 // Set this to something like '1.2em' or calc(1em * titleLineHeight)
//                                 // For now, 'auto' will rely on the text's natural height.
//                                 // A fixed height is crucial for a smooth "slot machine".
//                                 // Let's try to derive it based on font size.
//                                 // The overall title line-height is 1.1.
//         lineHeight: '1em', // To contain the animated text within one line height effectively
//         verticalAlign: 'baseline', // Align with adjacent ".ai"
//         overflow: 'hidden', // Clip the exiting/entering text
//         textAlign: isEnglish ? 'center' : 'right', // Align text within this box
//         minWidth: isEnglish ? 'auto' : '0', // Allow it to shrink or grow.
//                                         // The text-align: right will handle leftward expansion for non-English.
//         ...fontSizeStyle,
//       }}
//     >
//       <AnimatePresence initial={false} custom={direction} mode="wait">
//         <motion.span
//           key={currentIndex} // Ensures remount and animation trigger
//           custom={direction}
//           variants={variants}
//           initial="enter"
//           animate="center"
//           exit="exit"
//           style={{
//             display: 'inline-block', // So it respects text-align of parent
//             color: color,
//             width: '100%', // Fill the parent Box (which has text-align)
//           }}
//           lang={currentWord.lang}
//         >
//           {currentWord.text}
//         </motion.span>
//       </AnimatePresence>
//     </Box>
//   );
// };

// export default RotatingText;