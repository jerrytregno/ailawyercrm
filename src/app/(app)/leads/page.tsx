'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal, PlusCircle, PlayCircle } from "lucide-react";
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { format } from "date-fns";

import { db } from "@/lib/firebase";
import { type Lead } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { textToSpeech } from "@/ai/flows/text-to-speech";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

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
                // Ensure createdAt is a string. Firestore Timestamps need to be converted.
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                voiceTranscript: data.voiceTranscript || data.voice || '',
                status: 'New' // Default status
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

  const playAudio = async (text: string, leadId: string) => {
    if (playingAudio === leadId) {
        setPlayingAudio(null);
        return;
    }
    setPlayingAudio(leadId);
    try {
        const { media } = await textToSpeech(text);
        if(media) {
            const audio = new Audio(media);
            audio.play();
            audio.onended = () => setPlayingAudio(null);
        }
    } catch (error) {
        console.error("Error playing audio:", error);
        setPlayingAudio(null);
    }
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Leads</CardTitle>
            <CardDescription>
              Manage your leads and convert them to clients.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="#">
              <PlusCircle className="h-4 w-4 mr-2" /> Add Lead
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead className="hidden md:table-cell">Created At</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading leads...</TableCell>
                </TableRow>
            ) : leads.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center">No leads found.</TableCell>
                </TableRow>
            ) : (
                leads.map((lead) => (
                <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                    {lead.email}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" onClick={() => playAudio(lead.voiceTranscript, lead.id)} disabled={playingAudio === lead.id}>
                                <PlayCircle className="h-5 w-5" />
                            </Button>
                            <span className="truncate max-w-xs">{lead.voiceTranscript}</span>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                    {format(new Date(lead.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Convert to Client</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
  );
}
