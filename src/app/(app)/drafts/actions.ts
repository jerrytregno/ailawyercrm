'use server';

import { z } from 'zod';
import { generateLegalDraft } from '@/ai/flows/generate-legal-draft';

const DraftSchema = z.object({
  clientName: z.string().min(1, 'Client name is required.'),
  caseDetails: z.string().min(10, 'Case details must be at least 10 characters.'),
  documentType: z.string().min(1, 'Document type is required.'),
  relevantJurisdiction: z.string().min(1, 'Jurisdiction is required.'),
});

export type FormState = {
  message: string;
  draft: string | null;
  error: boolean;
};

export async function createDraft(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const validatedFields = DraftSchema.safeParse({
      clientName: formData.get('clientName'),
      caseDetails: formData.get('caseDetails'),
      documentType: formData.get('documentType'),
      relevantJurisdiction: formData.get('relevantJurisdiction'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Validation failed. Please check your inputs.',
        draft: null,
        error: true,
      };
    }

    const result = await generateLegalDraft(validatedFields.data);

    if (result && result.legalDraft) {
      return {
        message: 'Draft generated successfully.',
        draft: result.legalDraft,
        error: false,
      };
    } else {
      throw new Error('Failed to generate legal draft from the AI model.');
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      message: `Error: ${errorMessage}`,
      draft: null,
      error: true,
    };
  }
}
