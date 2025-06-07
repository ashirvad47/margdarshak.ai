"use client";

import { Container, Title, Text, Stack, TextInput, Textarea, Button, Group, LoadingOverlay } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { sendContactEmail } from '@/actions/contact'; // Import the new server action
import useFetch from '@/hooks/use-fetch'; // Import the useFetch hook

const contactFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'A valid email is required' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters long' }),
});


export default function ContactUsPage() {
    const { loading, fn: sendEmailFn, error } = useFetch(sendContactEmail);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            message: ''
        }
    });
    
    const onSubmit = async (values) => {
        try {
            await sendEmailFn(values);
            toast.success('Your message has been sent! We will get back to you shortly.');
            reset();
        } catch (e) {
            toast.error(e.message || "An unexpected error occurred.");
        }
    };

  return (
    <Container size="md" py="xl">
      <Stack gap="lg" pos="relative">
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <Title order={1} ta="center" className="gradient-title">
          Contact Us
        </Title>
        <Text c="dimmed" ta="center">
          Have a question, feedback, or just want to say hello? Drop us a line!
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
                <TextInput
                    label="Full Name"
                    placeholder="Your Name"
                    required
                    {...register('name')}
                    error={errors.name?.message}
                />
                <TextInput
                    label="Email Address"
                    placeholder="your@email.com"
                    required
                    {...register('email')}
                    error={errors.email?.message}
                />
                <Textarea
                    mt="md"
                    label="Your Message"
                    placeholder="Please include all the details here."
                    required
                    minRows={4}
                    {...register('message')}
                    error={errors.message?.message}
                />

                <Group justify="center" mt="xl">
                    <Button type="submit" size="md" variant="gradient" loading={loading}>
                        Send Message
                    </Button>
                </Group>
            </Stack>
        </form>
      </Stack>
    </Container>
  );
}