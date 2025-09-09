'use server';

/**
 * @fileOverview Generates a legal draft based on client information and case details.
 *
 * - generateLegalDraft - A function that generates the legal draft.
 * - GenerateLegalDraftInput - The input type for the generateLegalDraft function.
 * - GenerateLegalDraftOutput - The return type for the generateLegalDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLegalDraftInputSchema = z.object({
  clientName: z.string().describe('The full name of the client.'),
  caseDetails: z.string().describe('Detailed information about the legal case.'),
  documentType: z.string().describe('The type of legal document to generate (e.g., contract, will, etc.).'),
  relevantJurisdiction: z.string().describe('The relevant jurisdiction for the legal document (e.g., California, New York, etc.).'),
});
export type GenerateLegalDraftInput = z.infer<typeof GenerateLegalDraftInputSchema>;

const GenerateLegalDraftOutputSchema = z.object({
  legalDraft: z.string().describe('The generated legal draft.'),
});
export type GenerateLegalDraftOutput = z.infer<typeof GenerateLegalDraftOutputSchema>;

export async function generateLegalDraft(input: GenerateLegalDraftInput): Promise<GenerateLegalDraftOutput> {
  return generateLegalDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLegalDraftPrompt',
  input: {schema: GenerateLegalDraftInputSchema},
  output: {schema: GenerateLegalDraftOutputSchema},
  prompt: `You are an AI legal assistant tasked with generating initial drafts of legal documents.

  Based on the information provided, create a draft of the legal document.  The draft should be well-structured and contain all necessary sections and clauses for the given document type and jurisdiction.

  Client Name: {{{clientName}}}
  Case Details: {{{caseDetails}}}
  Document Type: {{{documentType}}}
  Relevant Jurisdiction: {{{relevantJurisdiction}}}

  Legal Draft:`,
});

const generateLegalDraftFlow = ai.defineFlow(
  {
    name: 'generateLegalDraftFlow',
    inputSchema: GenerateLegalDraftInputSchema,
    outputSchema: GenerateLegalDraftOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
