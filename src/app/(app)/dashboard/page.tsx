import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Calendar,
  FileText,
  PlusCircle,
  Users,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

import { appointments, legalDrafts, clients } from "@/lib/data";

export default function DashboardPage() {
  const upcomingAppointments = appointments.filter(a => a.status === 'Upcoming').slice(0, 3);
  const recentDrafts = legalDrafts.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.filter(a => a.status === 'Upcoming').length}</div>
            <p className="text-xs text-muted-foreground">in the next 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts in Progress</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{legalDrafts.filter(d => d.status === 'Draft').length}</div>
            <p className="text-xs text-muted-foreground">+3 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5</div>
            <p className="text-xs text-muted-foreground">
              New communications logged today
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              You have {upcomingAppointments.length} upcoming appointments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={appointment.client.avatarUrl} alt="Avatar" />
                          <AvatarFallback>{appointment.client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{appointment.client.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.title}</TableCell>
                    <TableCell className="text-right">
                      {format(new Date(appointment.dateTime), "E, MMM d, yyyy 'at' h:mm a")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Drafts</CardTitle>
              <CardDescription>
                Legal documents recently created or updated.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/drafts">
                New Draft
                <PlusCircle className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-6">
            {recentDrafts.map((draft) => (
              <div key={draft.id} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {draft.documentType}
                    </p>
                    <p className="text-sm text-muted-foreground">{draft.client.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={draft.status === 'Draft' ? 'secondary' : 'default'} className="capitalize">{draft.status}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(draft.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
