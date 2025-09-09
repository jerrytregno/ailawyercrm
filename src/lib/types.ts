import { z } from 'zod';

export type Communication = {
  id: string;
  type: 'Appointment' | 'Draft' | 'Message';
  date: string;
  summary: string;
  link?: string;
  status: 'Upcoming' | 'Completed' | 'Canceled' | 'Sent' | 'Draft' | 'Finalized';
};

export type Case = {
  id: string;
  title: string;
  status: 'Open' | 'Closed' | 'Pending';
  communications: Communication[];
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  cases: Case[];
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  language: string;
  amount: string;
  createdAt: string;
  voice_transcript: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Disqualified';
};

export type Appointment = {
  id: string;
  client: Pick<Client, 'id' | 'name' | 'avatarUrl'>;
  dateTime: string;
  title: string;
  status: 'Upcoming' | 'Completed' | 'Canceled';
};

export type LegalDraft = {
  id: string;
  client: Pick<Client, 'id' | 'name'>;
  documentType: string;
  createdAt: string;
  status: 'Draft' | 'Sent' | 'Finalized';
};

export const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The language to translate the text into (e.g., "English", "Spanish").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;
