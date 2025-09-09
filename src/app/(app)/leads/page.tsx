'use client';

import { useState, useEffect } from "react";
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { format } from "date-fns";
import { Loader2, Languages, Video, FileText } from "lucide-react";
import Link from 'next/link';

import { db } from "@/lib/firebase";
import { type Lead } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { translateText } from "@/ai/flows/translate-text";
import { ScrollArea } from "@/components/ui/scroll-area";

function LeadDetailPopup({ lead, isOpen, onClose }: { lead: Lead | null, isOpen: boolean, onClose: () => void }) {
    const [transcript, setTranscript] = useState('');
    const [isTranslated, setIsTranslated] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    
    useEffect(() => {
        if (lead) {
            setTranscript(lead.voice_transcript || '');
            setIsTranslated(false);
        }
    }, [lead]);

    if (!lead) return null;

    const handleTranslate = async () => {
        if (!transcript || isTranslated) return;
        const originalTranscript = transcript;
        setIsTranslating(true);
        try {
            const result = await translateText({ text: transcript, targetLanguage: 'English' });
            if (result) {
              setTranscript(result);
              setIsTranslated(true);
            } else {
              setTranscript("Sorry, translation failed. Please try again.");
            }
        } catch (error) {
            console.error("Translation failed:", error);
            setTranscript("Sorry, an error occurred during translation.");
        } finally {
            setIsTranslating(false);
        }
    };

    const handleClose = () => {
        // Reset state on close
        setTranscript('');
        setIsTranslated(false);
        setIsTranslating(false);
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Voice Transcript for {lead.name}</DialogTitle>
                    <DialogDescription>
                        Original language: {lead.language}
                        {isTranslated && " (Translated to English)"}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-48">
                    <p className="text-sm text-muted-foreground py-4">{transcript}</p>
                </ScrollArea>

                <DialogFooter>
                    <Button onClick={handleTranslate} disabled={isTranslating || isTranslated}>
                        {isTranslating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                        Translate to English
                    </Button>
                    <Button variant="outline" onClick={handleClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const leadsData: Lead[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
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
            }
        });
        setLeads(leadsData);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);
  
  const handleTranscriptClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleClosePopup = () => {
    setSelectedLead(null);
  };

  const createGoogleCalendarLink = (lead: Lead) => {
    const now = new Date();
    const startTime = now.toISOString().replace(/-|:|\.\d+/g, '');
    const endTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');

    const details = `Meeting with ${lead.name} (${lead.email}).\n\nLead Details:\nAmount: ${lead.amount}\nLanguage: ${lead.language}`;

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', `Meeting with ${lead.name}`);
    url.searchParams.set('dates', `${startTime}/${endTime}`);
    url.searchParams.set('details', details);
    url.searchParams.set('add', lead.email);
    url.searchParams.set('location', 'Google Meet');
    return url.toString();
  };


  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Leads</CardTitle>
            <CardDescription>
              Manage your leads and convert them to clients.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Voice Transcript</TableHead>
              <TableHead className="hidden md:table-cell">Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={8} className="text-center">Loading leads...</TableCell>
                </TableRow>
            ) : leads.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={8} className="text-center">No leads found.</TableCell>
                </TableRow>
            ) : (
                leads.map((lead) => (
                <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.whatsapp}</TableCell>
                    <TableCell>{lead.language}</TableCell>
                    <TableCell>{lead.amount}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      <button onClick={() => handleTranscriptClick(lead)} className="hover:underline text-left">
                        {lead.voice_transcript}
                      </button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                    {format(new Date(lead.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={createGoogleCalendarLink(lead)} target="_blank">
                                <Video className="mr-2 h-4 w-4" />
                                Schedule
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/drafts?leadName=${encodeURIComponent(lead.name)}`}>
                                <FileText className="mr-2 h-4 w-4" />
                                Write Draft
                            </Link>
                        </Button>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{leads.length}</strong> of{" "}
          <strong>{leads.length}</strong> leads
        </div>
      </CardFooter>
    </Card>
    <LeadDetailPopup lead={selectedLead} isOpen={!!selectedLead} onClose={handleClosePopup} />
    </>
  );
}
