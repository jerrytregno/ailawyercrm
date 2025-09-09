import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Calendar,
  FileText,
  Users,
  DollarSign
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Leads
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{clients.length}</div>
            <p className="text-xs text-muted-foreground">+5 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.filter(a => a.status === 'Upcoming').length}</div>
            <p className="text-xs text-muted-foreground">in the next 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.reduce((acc, c) => acc + c.cases.filter(cs => cs.status === 'Open').length, 0)}</div>
            <p className="text-xs text-muted-foreground">
              +2 since last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>
              A list of recent leads from your database.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Active Cases</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.slice(0,5).map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={client.avatarUrl} alt="Avatar" data-ai-hint="person photo" />
                          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{client.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={client.cases.some(c => c.status === 'Open') ? 'outline' : 'secondary'}>
                        {client.cases.some(c => c.status === 'Open') ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        {client.cases.filter(c => c.status === 'Open').length}
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
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>
                You have {upcomingAppointments.length} upcoming appointments.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/clients">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-6">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={appointment.client.avatarUrl} alt={appointment.client.name} data-ai-hint="person photo" />
                    <AvatarFallback>{appointment.client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {appointment.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{appointment.client.name}</p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium">
                        {format(new Date(appointment.dateTime), "MMM d, yyyy")}
                    </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(appointment.dateTime), "h:mm a")}
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
