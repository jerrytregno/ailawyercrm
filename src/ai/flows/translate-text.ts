'use server';

/**
 * @fileOverview A text translation flow using Genkit.
 *
 * - translateText - A function that translates text to a specified language.
 * - TranslateTextInput - The input type for the translateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The language to translate the text into (e.g., "English", "Spanish").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  input: { schema: TranslateTextInputSchema },
  prompt: `Translate the following text to {{{targetLanguage}}}:\n\n{{{text}}}`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await ai.generate({
        prompt: `Translate the following text to ${input.targetLanguage}:\n\n${input.text}`,
      });
    return output?.text || '';
  }
);

export async function translateText(input: TranslateTextInput): Promise<string> {
  return translateTextFlow(input);
}
