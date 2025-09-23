
'use server';

/**
 * @fileOverview Generates a legal draft based on client information and case details.
 *
 * - generateLegalDraft - A function that generates the legal draft.
 * - GenerateLegalDraftInput - The input type for the generateLegaldraft function.
 * - GenerateLegalDraftOutput - The return type for the generateLegalDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLegalDraftInputSchema = z.object({
  clientName: z.string().describe('The full name of the client.'),
  caseDetails: z.string().describe('Detailed information about the legal case, including all relevant facts, involved parties, and desired outcomes.'),
  documentType: z.string().describe('The type of legal document to generate (e.g., Legal Notice, Contract, Will).'),
  relevantJurisdiction: z.string().describe('The relevant jurisdiction for the legal document (e.g., California, New York, Chennai).'),
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
  Your output MUST be a single string containing the entire formatted document.
  Use markdown for formatting, and be sure to use newline characters (\\n) to separate paragraphs, headings, and list items.

  **Template to follow:**
  
  **Header:**
  Email Id: legaltrishulaconsultancy@gmail.com
  Address: A-5th Floor, Prince Info Park, Ambattur Industrial Estate Rd, Ambattur, Chennai, Tamil Nadu 600058
  *Intellectual Property Rights | Civil & criminal litigation | Legal documentation | Corporate advisory | Legal Compliance*
  
  ---
  
  ### LEGAL NOTICE
  
  **By RPAD/By E-Mail**
  **Ref. No.** [Generate a unique reference number]
  **Date:** [Current Date]
  
  **To,**
  [Recipient's Name/Title and Address - Extract from Case Details]
  
  **WITHOUT PREJUDICE**
  
  **Subject:** [Generate a concise subject line based on Case Details]
  **Reference:** [Extract any relevant reference numbers or documents from Case Details]
  
  I write this under instructions from and on behalf of my client, **{{{clientName}}}**, (herein referred to as “my Client”). I am hereby serving you with this legal notice in unequivocal terms.
  
  **Body of the Notice:**
  Based on the Case Details provided, construct a series of numbered paragraphs.
  1.  Start by introducing the client and the context of the issue.
  2.  Detail the sequence of events and facts clearly.
  3.  If specific rules, laws, or contract clauses are violated, cite them as shown in the example.
  4.  Clearly state the grievance or problem caused by the recipient's actions.
  5.  Mention any prior attempts to resolve the issue (e.g., support tickets, emails).
  6.  State the demands clearly, specifying a timeframe for compliance (e.g., "within 15 days").
      a. [Demand 1]
      b. [Demand 2]
  7.  Describe the legal consequences of non-compliance.
  8.  Include a "without prejudice" clause to reserve your client's rights.
  9.  Specify the address for reply and future correspondence.
  
  ---
  
  **User Provided Information:**
  
  Client Name: {{{clientName}}}
  Document Type: {{{documentType}}}
  Relevant Jurisdiction: {{{relevantJurisdiction}}}
  Case Details: {{{caseDetails}}}

  ---

  Begin the generated draft now. Ensure all text is properly formatted with newlines.`,
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
