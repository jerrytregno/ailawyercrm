
'use client';

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { format } from "date-fns";
import { Phone, Mail, Link as LinkIcon, Clock, Mic, Loader2 } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/firebase";
import type { Meeting } from "@/lib/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const usersCollection = collection(db, "users");
                const q = query(usersCollection, where("calendar_status", "==", "scheduled"));
                const querySnapshot = await getDocs(q);
                const meetingsData: Meeting[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        userName: data.name || 'N/A',
                        userContact: {
                            email: data.email || '',
                            phone: data.whatsapp || '',
                        },
                        meetingLink: data.meeting_link || '',
                        startTime: data.start_time || new Date().toISOString(),
                        endTime: data.end_time || new Date().toISOString(),
                        voiceTranscript: data.voice_transcript || 'No transcript available.'
                    }
                });
                setMeetings(meetingsData);
            } catch (error) {
                console.error("Error fetching meetings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMeetings();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Meetings</CardTitle>
                <CardDescription>A log of all scheduled meetings and their details.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                            <p>No scheduled meetings found.</p>
                        </div>
                    ) : (
                        meetings.map((meeting: Meeting) => (
                            <Card key={meeting.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">{meeting.userName}</CardTitle>
                                            <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-muted-foreground mt-2">
                                                {meeting.userContact.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4" />
                                                        <span>{meeting.userContact.email}</span>
                                                    </div>
                                                )}
                                                {meeting.userContact.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4" />
                                                        <span>{meeting.userContact.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button asChild variant="outline" disabled={!meeting.meetingLink}>
                                            <Link href={meeting.meetingLink} target="_blank">
                                                <LinkIcon className="mr-2 h-4 w-4" /> Join Meeting
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1 space-y-4">
                                            <div>
                                                <h4 className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4" /> Timings</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Start: {format(new Date(meeting.startTime), "MMM d, yyyy 'at' h:mm a")}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    End: {format(new Date(meeting.endTime), "MMM d, yyyy 'at' h:mm a")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                             <h4 className="font-semibold flex items-center gap-2"><Mic className="h-4 w-4" /> Voice Transcript</h4>
                                             <ScrollArea className="h-24 mt-2">
                                                <p className="text-sm text-muted-foreground pr-4">
                                                    {meeting.voiceTranscript}
                                                </p>
                                             </ScrollArea>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
