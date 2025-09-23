
import { DraftForm } from './draft-form';
import {
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Lead } from '@/lib/types';

async function getLeadById(id: string): Promise<Lead | null> {
    try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                name: data.name || '',
                email: data.email || '',
                whatsapp: data.whatsapp || '',
                language: data.language || '',
                amount: data.amount || '',
                createdAt: data.created_at?.toDate ? data.created_at.toDate().toISOString() : new Date(data.created_at).toISOString(),
                voice_transcript: data.voice_transcript || '',
                status: 'New',
                assignedTo: data.assignedTo,
                lead_type: data.lead_type,
                client_id: data.client_id,
                ticket_id: data.ticket_id,
                lead_source: data.lead_source,
            };
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching lead by ID:", error);
        return null;
    }
}


export default async function DraftsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const clientId = typeof searchParams.clientId === 'string' ? searchParams.clientId : undefined;
  const leadId = typeof searchParams.leadId === 'string' ? searchParams.leadId : undefined;
  
  let lead: Lead | null = null;
  if(leadId) {
      lead = await getLeadById(leadId);
  }
  
  // These are fallback for client page link
  const leadName = typeof searchParams.leadName === 'string' ? searchParams.leadName : undefined;
  const caseDetails = typeof searchParams.caseDetails === 'string' ? searchParams.caseDetails : undefined;

  return (
    <div>
        <CardHeader className="px-0">
            <CardTitle className="text-3xl font-bold tracking-tight">Legal Draft Generation Tool</CardTitle>
            <CardDescription>Use AI to generate initial legal drafts. Review and edit before sending.</CardDescription>
        </CardHeader>
        <DraftForm 
            clientId={clientId} 
            leadName={lead?.name ?? leadName} 
            caseDetails={lead?.voice_transcript ?? caseDetails} 
        />
    </div>
  );
}
