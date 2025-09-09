'use server';

/**
 * @fileOverview A text translation flow using Genkit.
 *
 * - translateText - A function that translates text to a specified language.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { TranslateTextInput, TranslateTextInputSchema } from '@/lib/types';


const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  input: { schema: TranslateTextInputSchema },
  output: { schema: z.string() },
  prompt: `Translate the following text to {{{targetLanguage}}}:\n\n{{{text}}}`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await translatePrompt(input);
    return output || '';
  }
);

export async function translateText(input: TranslateTextInput): Promise<string> {
  return translateTextFlow(input);
}
