

'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Calendar,
  Users,
  DollarSign,
  Gavel
} from "lucide-react";
import { format } from "date-fns";
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { type Lead, type Lawyer, type Appointment } from "@/lib/types";
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

import { appointments as staticAppointments, clients } from "@/lib/data";

type LeadWithLawyer = Lead & { allocatedTo: Lawyer | null };

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingLawyers, setLoadingLawyers] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [leadsWithLawyers, setLeadsWithLawyers] = useState<LeadWithLawyer[]>([]);
  
  useEffect(() => {
    const filteredAppointments = staticAppointments.filter(a => a.status === 'Upcoming').slice(0, 3);
    setUpcomingAppointments(filteredAppointments);
  }, []);

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
                status: 'New',
                assignedTo: data.assignedTo || undefined,
            }
        }).filter(lead => lead.email || lead.whatsapp);
        
        // Sort leads by creation date, newest first
        leadsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setLeads(leadsData);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoadingLeads(false);
      }
    }

    async function fetchLawyers() {
      try {
        const querySnapshot = await getDocs(collection(db, "lawyers"));
        const lawyersData: Lawyer[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            avatarUrl: data.avatarUrl || 'https://picsum.photos/seed/placeholder/100/100',
            specialty: data.specialty || 'General Practice',
            availability: data.availability || {},
          };
        });
        setLawyers(lawyersData);
      } catch (error) {
        console.error("Error fetching lawyers:", error);
      } finally {
        setLoadingLawyers(false);
      }
    }

    fetchLeads();
    fetchLawyers();
  }, []);

  useEffect(() => {
    if (!loadingLeads && !loadingLawyers) {
      const lawyerMap = new Map(lawyers.map(l => [l.id, l]));
      const combinedData = leads.map(lead => ({
        ...lead,
        allocatedTo: lead.assignedTo ? lawyerMap.get(lead.assignedTo) || null : null
      }));
      setLeadsWithLawyers(combinedData);
    }
  }, [leads, lawyers, loadingLeads, loadingLawyers]);


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
            <div className="text-2xl font-bold">+{leads.length}</div>
            <p className="text-xs text-muted-foreground">+5 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staticAppointments.filter(a => a.status === 'Upcoming').length}</div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lead Allocation</CardTitle>
                <CardDescription>
                  New leads assigned to available lawyers.
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/leads">
                  Manage Leads
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Assigned Lawyer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingLeads || loadingLawyers ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">Loading leads...</TableCell>
                  </TableRow>
                ) : leadsWithLawyers.length > 0 ? (
                  leadsWithLawyers.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-sm text-muted-foreground">{lead.email}</div>
                      </TableCell>
                      <TableCell>{format(new Date(lead.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        {lead.allocatedTo ? (
                          <div className="flex items-center justify-end gap-2">
                            <span>{lead.allocatedTo.name}</span>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={lead.allocatedTo.avatarUrl} alt={lead.allocatedTo.name} data-ai-hint="person portrait" />
                              <AvatarFallback>{lead.allocatedTo.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">No new leads found.</TableCell>
                  </TableRow>
                )}
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
