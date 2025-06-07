"use server";

import { Resend } from 'resend';

// Initialize Resend with the API key from your environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(formData) {
  const { name, email, message } = formData;

  if (!name || !email || !message) {
    throw new Error("All fields are required.");
  }

  try {
    const data = await resend.emails.send({
      // IMPORTANT: Replace with your desired "from" address.
      // Note: Resend requires you to verify this domain. For testing, you can use the default "onboarding@resend.dev".
      from: 'Margdarshak.ai Contact Form <onboarding@resend.dev>',
      
      // IMPORTANT: Replace with the email address where you want to receive messages.
      to: ['dimitri170947@gmail.com'], 
      
      subject: `New Message from ${name} via Margdarshak.ai`,
      
      // The email body, which can be simple text or styled HTML.
      html: `
        <p>You have received a new message from the Margdarshak.ai contact form.</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send message. Please try again later.");
  }
}