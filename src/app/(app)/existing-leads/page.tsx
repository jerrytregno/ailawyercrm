
'use client';

import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query, where, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { format } from "date-fns";
import { Loader2, Languages, UserCheck, FileText, Video, ArrowUpDown } from "lucide-react";
import Link from 'next/link';

import { db } from "@/lib/firebase";
import { type Lead, type Lawyer } from "@/lib/types";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";


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

export default function ExistingLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Lead | 'createdAt'; direction: 'ascending' | 'descending' }>({ key: 'createdAt', direction: 'descending' });

  useEffect(() => {
    const fetchLeads = async () => {
        try {
          const usersCollection = collection(db, "users");
          const q = query(usersCollection, where("lead_type", "==", "existing_lead"));
          const querySnapshot = await getDocs(q);
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
                  status: 'New',
                  assignedTo: data.assignedTo,
                  lead_type: data.lead_type,
                  client_id: data.client_id,
                  ticket_id: data.ticket_id,
                  lead_source: data.lead_source,
              }
          });
          setLeads(leadsData);
        } catch (error) {
          console.error("Error fetching existing leads:", error);
        }
      };
    
      const fetchLawyers = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "lawyers"));
          const lawyersData: Lawyer[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || '',
              avatarUrl: data.avatarUrl || '',
              specialty: data.specialty || '',
              availability: data.availability || {},
            };
          });
          setLawyers(lawyersData);
        } catch (error) {
          console.error("Error fetching lawyers:", error);
        }
      };

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchLeads(), fetchLawyers()]);
        setLoading(false);
    }
    fetchData();
  }, []);
  
  const sortedAndFilteredLeads = useMemo(() => {
    let filteredLeads = leads;
    if (filter) {
        filteredLeads = leads.filter(lead => 
            lead.name.toLowerCase().includes(filter.toLowerCase()) ||
            (lead.email && lead.email.toLowerCase().includes(filter.toLowerCase())) ||
            (lead.ticket_id && lead.ticket_id.toLowerCase().includes(filter.toLowerCase())) ||
            (lead.client_id && lead.client_id.toLowerCase().includes(filter.toLowerCase()))
        );
    }

    const sortedLeads = [...filteredLeads].sort((a, b) => {
        const key = sortConfig.key;
        if (key === 'createdAt') {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }

        const valueA = a[key] ?? '';
        const valueB = b[key] ?? '';

        if (valueA < valueB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valueA > valueB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    return sortedLeads;
  }, [leads, filter, sortConfig]);

  const requestSort = (key: keyof Lead | 'createdAt') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const handleTranscriptClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleClosePopup = () => {
    setSelectedLead(null);
  };

  const getAssignedLawyerName = (lawyerId: string) => {
    const lawyer = lawyers.find(l => l.id === lawyerId);
    return lawyer ? lawyer.name : 'Unknown';
  };

  const generateGoogleCalendarLink = (lead: Lead) => {
    const baseUrl = "https://calendar.google.com/calendar/render";
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `Meeting with ${lead.name}`,
      details: `Scheduled meeting to discuss: ${lead.voice_transcript}`,
      add: lead.email,
    });
    return `${baseUrl}?${params.toString()}`;
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Existing Leads</CardTitle>
            <CardDescription>
              A list of all existing leads from your database.
            </CardDescription>
          </div>
           <Input 
            placeholder="Filter by name, email, ticket, or client ID..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('name')}>
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('language')}>
                    Language <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('ticket_id')}>
                    Ticket ID <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('client_id')}>
                    Client ID <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Voice Transcript</TableHead>
              <TableHead className="hidden md:table-cell">
                <Button variant="ghost" onClick={() => requestSort('createdAt')}>
                    Created At <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">Loading existing leads...</TableCell>
                </TableRow>
            ) : sortedAndFilteredLeads.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">No existing leads found.</TableCell>
                </TableRow>
            ) : (
                sortedAndFilteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                        <div className="text-sm">{lead.email}</div>
                        <div className="text-sm text-muted-foreground">{lead.whatsapp}</div>
                    </TableCell>
                    <TableCell>{lead.language}</TableCell>
                    <TableCell>{lead.ticket_id}</TableCell>
                    <TableCell>{lead.client_id}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      <button onClick={() => handleTranscriptClick(lead)} className="hover:underline text-left">
                        {lead.voice_transcript}
                      </button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(lead.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      {lead.assignedTo ? (
                        <Badge variant="secondary">Assigned to {getAssignedLawyerName(lead.assignedTo)}</Badge>
                      ) : (
                        <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                                <a href={generateGoogleCalendarLink(lead)} target="_blank" rel="noopener noreferrer">
                                    <Video className="mr-2 h-4 w-4" /> Schedule Meeting
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/drafts?leadId=${lead.id}`}>
                                    <FileText className="mr-2 h-4 w-4" /> Write Draft
                                </Link>
                            </Button>
                        </div>
                      )}
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{sortedAndFilteredLeads.length}</strong> of{" "}
          <strong>{leads.length}</strong> leads
        </div>
      </CardFooter>
    </Card>
    <LeadDetailPopup lead={selectedLead} isOpen={!!selectedLead} onClose={handleClosePopup} />
    </>
  );
}
