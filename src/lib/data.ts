import type { Client, Appointment, LegalDraft, Lead, Lawyer } from './types';

export const clients: Client[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    phone: '123-456-7890',
    avatarUrl: 'https://picsum.photos/id/1027/100/100',
    cases: [
      {
        id: 'c1',
        title: 'Corporate Restructuring',
        status: 'Open',
        communications: [
          { id: 'comm1', type: 'Appointment', date: '2024-08-15T10:00:00Z', summary: 'Initial Consultation', status: 'Completed', link: '#' },
          { id: 'comm2', type: 'Draft', date: '2024-08-20T14:30:00Z', summary: 'Shareholder Agreement Draft v1', status: 'Sent', link: '#' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Bob Williams',
    email: 'bob.w@example.com',
    phone: '234-567-8901',
    avatarUrl: 'https://picsum.photos/id/1005/100/100',
    cases: [
      {
        id: 'c2',
        title: 'Intellectual Property Claim',
        status: 'Open',
        communications: [
          { id: 'comm3', type: 'Appointment', date: '2024-08-18T11:00:00Z', summary: 'Strategy Session', status: 'Completed', link: '#' },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie.b@example.com',
    phone: '345-678-9012',
    avatarUrl: 'https://picsum.photos/id/1012/100/100',
    cases: [
      { id: 'c3', title: 'Real Estate Transaction', status: 'Closed', communications: [] },
    ],
  },
    {
    id: '4',
    name: 'Diana Prince',
    email: 'diana.p@example.com',
    phone: '456-789-0123',
    avatarUrl: 'https://picsum.photos/id/1011/100/100',
    cases: [
      { id: 'c4', title: 'Employment Contract Negotiation', status: 'Pending', communications: [] },
    ],
  },
];

export const appointments: Appointment[] = [
  {
    id: 'apt1',
    client: { id: '2', name: 'Bob Williams', avatarUrl: 'https://picsum.photos/id/1005/100/100' },
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'IP Follow-up',
    status: 'Upcoming',
  },
  {
    id: 'apt2',
    client: { id: '4', name: 'Diana Prince', avatarUrl: 'https://picsum.photos/id/1011/100/100' },
    dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Initial Contract Review',
    status: 'Upcoming',
  },
  {
    id: 'apt3',
    client: { id: '1', name: 'Alice Johnson', avatarUrl: 'https://picsum.photos/id/1027/100/100' },
    dateTime: '2024-08-15T10:00:00Z',
    title: 'Initial Consultation',
    status: 'Completed',
  },
];

export const legalDrafts: LegalDraft[] = [
    {
        id: 'd1',
        client: { id: '1', name: 'Alice Johnson' },
        documentType: 'Shareholder Agreement',
        createdAt: '2024-08-20T14:30:00Z',
        status: 'Sent',
    },
    {
        id: 'd2',
        client: { id: '2', name: 'Bob Williams' },
        documentType: 'Cease and Desist Letter',
        createdAt: '2024-08-22T09:00:00Z',
        status: 'Draft',
    },
     {
        id: 'd3',
        client: { id: '4', name: 'Diana Prince' },
        documentType: 'Employment Contract',
        createdAt: '2024-08-25T16:00:00Z',
        status: 'Draft',
    }
];

export const lawyers: Lawyer[] = [];


export const getClientById = (id: string) => clients.find(c => c.id === id);
