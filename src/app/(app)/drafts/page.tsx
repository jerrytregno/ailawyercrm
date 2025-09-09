import { DraftForm } from './draft-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DraftsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const clientId = typeof searchParams.clientId === 'string' ? searchParams.clientId : undefined;

  return (
    <div>
        <CardHeader className="px-0">
            <CardTitle className="text-3xl font-bold tracking-tight">Legal Draft Generation Tool</CardTitle>
            <CardDescription>Use AI to generate initial legal drafts. Review and edit before sending.</CardDescription>
        </CardHeader>
        <DraftForm clientId={clientId} />
    </div>
  );
}
