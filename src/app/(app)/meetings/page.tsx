
import {
    Card,
    CardContent,
    CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { meetings } from "@/lib/data";
import type { Meeting } from "@/lib/types";
import { format } from "date-fns";
import { Phone, Mail, Link as LinkIcon, Clock, Mic } from "lucide-react";
import Link from "next/link";

export default function MeetingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Meetings</CardTitle>
                <CardDescription>A log of all scheduled meetings and their details.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6">
                    {meetings.map((meeting: Meeting) => (
                        <Card key={meeting.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">{meeting.userName}</CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                <span>{meeting.userContact.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                <span>{meeting.userContact.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button asChild variant="outline">
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
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
