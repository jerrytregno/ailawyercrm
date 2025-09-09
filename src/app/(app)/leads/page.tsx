import Link from "next/link";
import { MoreHorizontal, PlusCircle } from "lucide-react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { leads } from "@/lib/data";

export default function LeadsPage() {
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
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Avatar</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Created At</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="hidden sm:table-cell">
                  <Avatar>
                    <AvatarImage
                      src={lead.avatarUrl}
                      alt={`${lead.name} avatar`}
                      data-ai-hint="person photo"
                    />
                    <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>
                  <Badge variant={lead.status === 'New' ? 'default' : lead.status === 'Qualified' ? 'outline' : 'secondary'}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {lead.email}
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{leads.length}</strong> of <strong>{leads.length}</strong> leads
        </div>
      </CardFooter>
    </Card>
  );
}
