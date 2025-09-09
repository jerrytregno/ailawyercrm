'use server';

import { db } from '@/lib/firebase';
import type { Lead } from '@/lib/types';
import { z } from 'zod';
import { generateTranscriptSummary } from '@/ai/flows/generate-transcript-summary';

const LeadSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  whatsapp: z.string(),
  language: z.string(),
  amount: z.string(),
  created_at: z.string(),
  voice_transcript: z.string(),
});

export async function getLeads(): Promise<Lead[]> {
  const usersSnapshot = await db.collection('users').get();
  const users: Lead[] = [];

  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    const parsed = LeadSchema.safeParse(data);

    if (parsed.success) {
      const summaryResult = await generateTranscriptSummary({
        transcript: parsed.data.voice_transcript,
        language: parsed.data.language,
      });

      users.push({
        id: doc.id,
        name: parsed.data.name,
        email: parsed.data.email,
        whatsapp: parsed.data.whatsapp,
        language: parsed.data.language,
        amount: parsed.data.amount,
        createdAt: new Date(parsed.data.created_at).toISOString(),
        voiceTranscript: summaryResult.summary,
        status: 'New', // Default status
      });
    } else {
      console.error('Invalid lead data:', parsed.error);
    }
  }

  return users;
}
