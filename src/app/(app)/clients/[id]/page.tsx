import { notFound } from "next/navigation";
import Link from 'next/link';
import { format } from 'date-fns';
import { Mail, Phone, Video, FileText, PlusCircle, MessageSquare } from "lucide-react";

import { getClientById } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = getClientById(params.id);

  if (!client) {
    notFound();
  }

  const allCommunications = client.cases.flatMap(c => c.communications);
  allCommunications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getIcon = (type: string) => {
    switch (type) {
        case 'Appointment': return <Video className="h-5 w-5 text-muted-foreground" />;
        case 'Draft': return <FileText className="h-5 w-5 text-muted-foreground" />;
        default: return <MessageSquare className="h-5 w-5 text-muted-foreground" />;
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1 flex flex-col gap-8">
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={client.avatarUrl} alt={client.name} data-ai-hint="person photo" />
              <AvatarFallback className="text-3xl">{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{client.name}</CardTitle>
            <CardDescription>Client since {new Date().getFullYear() -1}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{client.phone}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Button>
                    <Video className="mr-2 h-4 w-4" /> Schedule Meeting
                </Button>
                <Button asChild variant="secondary">
                    <Link href={`/drafts?clientId=${client.id}`}>
                        <FileText className="mr-2 h-4 w-4" /> Generate Legal Draft
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle>Communication Log</CardTitle>
                <CardDescription>A record of all interactions and documents shared with {client.name}.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Type</TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allCommunications.map(comm => (
                             <TableRow key={comm.id}>
                                <TableCell>{getIcon(comm.type)}</TableCell>
                                <TableCell className="font-medium">{comm.summary}</TableCell>
                                <TableCell>{format(new Date(comm.date), "MMM d, yyyy")}</TableCell>
                                <TableCell className="text-right"><Badge variant="outline" className="capitalize">{comm.status}</Badge></TableCell>
                             </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
