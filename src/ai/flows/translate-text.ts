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
  output: { schema: z.string().describe('The translated text.') },
  prompt: `You are a translation expert. Translate the following text to {{{targetLanguage}}}.
  
  Only return the translated text, with no additional commentary or explanation.
  
  Text to translate:
  "{{{text}}}"
  `,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
        const { output } = await translatePrompt(input);
        return output || '';
    } catch (error) {
        console.error('Translation prompt failed:', error);
        // If the prompt fails for any reason, return an empty string
        // to avoid crashing the client application.
        return '';
    }
  }
);

export async function translateText(input: TranslateTextInput): Promise<string> {
  return translateTextFlow(input);
}
