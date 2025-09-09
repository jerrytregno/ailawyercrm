import { Gavel } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 text-sidebar-foreground transition-colors hover:text-sidebar-primary">
        <Gavel className="h-6 w-6" />
        <span className="text-lg font-semibold">LawLink</span>
    </Link>
  );
}
