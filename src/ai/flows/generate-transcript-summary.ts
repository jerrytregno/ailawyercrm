'use server';

/**
 * @fileOverview Generates a summary from a voice transcript.
 *
 * - generateTranscriptSummary - A function that generates the summary.
 * - GenerateTranscriptSummaryInput - The input type for the generateTranscriptSummary function.
 * - GenerateTranscriptSummaryOutput - The return type for the generateTranscriptSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTranscriptSummaryInputSchema = z.object({
  transcript: z.string().describe('The voice transcript to summarize.'),
  language: z.string().describe('The language of the transcript (e.g., "tamil", "english").'),
});
export type GenerateTranscriptSummaryInput = z.infer<typeof GenerateTranscriptSummaryInputSchema>;

const GenerateTranscriptSummaryOutputSchema = z.object({
  summary: z.string().describe('The summarized version of the transcript in English.'),
});
export type GenerateTranscriptSummaryOutput = z.infer<typeof GenerateTranscriptSummaryOutputSchema>;

export async function generateTranscriptSummary(
  input: GenerateTranscriptSummaryInput
): Promise<GenerateTranscriptSummaryOutput> {
  return generateTranscriptSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTranscriptSummaryPrompt',
  input: { schema: GenerateTranscriptSummaryInputSchema },
  output: { schema: GenerateTranscriptSummaryOutputSchema },
  prompt: `You are an expert multilingual assistant. Your task is to summarize a voice transcript provided by a user.
  The user is a potential lead for a law firm.
  The transcript is in {{{language}}}.
  Please provide a concise summary of the user's issue in English.

  Transcript:
  {{{transcript}}}

  Summary:`,
});

const generateTranscriptSummaryFlow = ai.defineFlow(
  {
    name: 'generateTranscriptSummaryFlow',
    inputSchema: GenerateTranscriptSummaryInputSchema,
    outputSchema: GenerateTranscriptSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
