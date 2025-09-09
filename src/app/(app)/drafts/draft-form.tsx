
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Copy, Download, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

import { createDraft } from './actions';
import { db } from "@/lib/firebase";
import { type Lead } from "@/lib/types";
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

const DraftSchema = z.object({
  clientName: z.string().min(1, 'Client name is required.'),
  caseDetails: z.string().min(10, 'Case details must be at least 10 characters.'),
  documentType: z.string().min(1, 'Document type is required.'),
  relevantJurisdiction: z.string().min(1, 'Jurisdiction is required.'),
});

type DraftFormValues = z.infer<typeof DraftSchema>;

function SubmitButton() {
    // Note: A simple loading state is used here as a workaround for useFormStatus
    // limitations with useActionState in the same component.
    const [pending, setPending] = useState(false);

    useEffect(() => {
        const form = document.querySelector('form');
        const handleSubmit = () => setPending(true);
        
        form?.addEventListener('submit', handleSubmit);
        
        // A more robust solution would listen for the form submission result.
        // For now, reset after a timeout as a simple UX improvement.
        const timer = setTimeout(() => setPending(false), 5000);

        return () => {
            form?.removeEventListener('submit', handleSubmit);
            clearTimeout(timer);
        };
    }, []);

    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Draft
        </Button>
    );
}

export function DraftForm({ clientId, leadName }: { clientId?: string, leadName?: string }) {
  const { toast } = useToast();
  const [formState, formAction] = useActionState(createDraft, {
    message: '',
    draft: null,
    error: false,
  });
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  const form = useForm<DraftFormValues>({
    resolver: zodResolver(DraftSchema),
    defaultValues: {
      clientName: leadName || '',
      caseDetails: '',
      documentType: '',
      relevantJurisdiction: '',
    },
  });

  const selectedClientName = useWatch({
    control: form.control,
    name: 'clientName',
  });

  useEffect(() => {
    async function fetchLeads() {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const leadsData: Lead[] = querySnapshot.docs
            .map((doc: QueryDocumentSnapshot<DocumentData>) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || '',
                    email: data.email || '',
                    whatsapp: data.whatsapp || '',
                    language: data.language || '',
                    amount: data.amount || '',
                    createdAt: data.created_at?.toDate ? data.created_at.toDate().toISOString() : new Date(data.created_at).toISOString(),
                    voice_transcript: data.voice_transcript || '',
                    status: 'New'
                } as Lead
            })
            .filter(lead => lead.name); // Filter out leads with no name
        setLeads(leadsData);
        if (leadName) {
            const selectedLead = leadsData.find(lead => lead.name === leadName);
            if (selectedLead && selectedLead.voice_transcript) {
                form.setValue('caseDetails', selectedLead.voice_transcript);
            }
        }
      } catch (error) {
        console.error("Error fetching leads:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load leads data.',
        });
      } finally {
        setLoadingLeads(false);
      }
    }
    fetchLeads();
  }, [leadName, form, toast]);

  useEffect(() => {
    if(selectedClientName) {
        const selectedLead = leads.find(lead => lead.name === selectedClientName);
        if (selectedLead && selectedLead.voice_transcript) {
            form.setValue('caseDetails', selectedLead.voice_transcript);
        } else {
            form.setValue('caseDetails', '');
        }
    }
  }, [selectedClientName, leads, form]);


  useEffect(() => {
    if (formState.message) {
      toast({
        variant: formState.error ? 'destructive' : 'default',
        title: formState.error ? 'Error' : 'Success',
        description: formState.message,
      });
    }
  }, [formState, toast]);

  const handleCopy = () => {
    if(formState.draft) {
        navigator.clipboard.writeText(formState.draft);
        toast({ title: "Copied to clipboard!" });
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
          <CardDescription>Fill in the details to generate a legal document.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form action={formAction} className="space-y-6">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger disabled={loadingLeads}>
                                <SelectValue placeholder={loadingLeads ? "Loading leads..." : "Select a client"} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {leads.map(lead => (
                                <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Input placeholder="e.g., Non-Disclosure Agreement, Employment Contract" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="relevantJurisdiction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevant Jurisdiction</FormLabel>
                    <Input placeholder="e.g., State of California" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="caseDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide all relevant facts, terms, and conditions for the document..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SubmitButton />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Generated Draft</CardTitle>
          <CardDescription>Review, edit, and share the AI-generated document.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-4rem)]">
          {formState.draft ? (
            <>
              <Textarea
                readOnly
                className="flex-grow bg-muted/50 text-sm font-mono h-[400px]"
                defaultValue={formState.draft}
              />
              <div className="flex items-center gap-2 mt-4">
                <Button onClick={handleCopy} variant="outline" size="sm"><Copy className="mr-2 h-4 w-4"/>Copy</Button>
                <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4"/>Download</Button>
                <Button size="sm"><Send className="mr-2 h-4 w-4"/>Send to Client</Button>
              </div>
            </>
          ) : (
             <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full bg-muted/20">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Your draft will appear here</h3>
                <p className="text-sm text-muted-foreground">Fill out the form to generate a legal document.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
