'use server';

/**
 * @fileOverview A text translation flow using Genkit.
 *
 * - translateText - A function that translates text to a specified language.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { TranslateTextInput, TranslateTextInputSchema } from '@/lib/types';


const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      const { text } = await ai.generate({
        prompt: `Translate the following text to ${input.targetLanguage}. Only return the translated text, with no additional commentary or explanation.\n\nText to translate:\n"${input.text}"`,
        model: 'googleai/gemini-2.5-flash',
      });
      return text;
    } catch (error) {
        console.error('Translation failed:', error);
        // Return an empty string on failure to prevent crashes.
        // The frontend will handle displaying an error message.
        return '';
    }
  }
);

export async function translateText(input: TranslateTextInput): Promise<string> {
  return translateTextFlow(input);
}
