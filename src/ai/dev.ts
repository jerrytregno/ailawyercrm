import { config } from 'dotenv';
config();

import '@/ai/flows/generate-legal-draft.ts';
import '@/ai/flows/generate-transcript-summary.ts';
import '@/ai/flows/text-to-speech.ts';
