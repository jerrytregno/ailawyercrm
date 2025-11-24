"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { 
  Download, 
  ArrowUpDown, 
  Video, 
  FileText, 
  Smartphone, 
  Monitor, 
  Info, 
  Globe, 
  CheckCircle2,
  MessageSquare,
  Languages,
  Copy,
  X,
  Mic
} from "lucide-react"
import { format } from "date-fns"
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore"
import { db } from "@/lib/firebase" // Adjust if your firebase config is elsewhere

// UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// --- 1. Interfaces ---

interface BrowserInfo {
  cookiesEnabled: boolean
  language: string
  platform: string
  screenResolution: string
  timeZone: string
  userAgent: string
  vendor: string
  windowSize: string
}

interface Lead {
  id: string
  name: string
  email: string
  whatsapp: string
  language: string
  amount: string
  createdAt: string
  voice_transcript: string
  status: string
  assignedTo?: string
  lead_type?: string
  client_id?: string
  ticket_id?: string
  calendar_status?: string
  meeting_link?: string
  start_time?: string
  end_time?: string
  lead_source?: string
  clarityUserId?: string
  deviceType?: "Mobile" | "Web/Desktop" | string
  browserInfo?: BrowserInfo
  tags?: string[]
}

interface Lawyer {
  id: string
  name: string
  avatarUrl: string
  specialty: string
  availability: Record<string, any>
}

// --- 2. Helper Components ---

// Browser Info Popup Component
const BrowserInfoPopup = ({ 
  lead, 
  isOpen, 
  onClose 
}: { 
  lead: Lead | null,
  isOpen: boolean 
  onClose: () => void 
}) => {
  const [copied, setCopied] = useState(false)

  if (!lead || !lead.browserInfo) return null
  
  const info = lead.browserInfo

  const handleCopyId = () => {
    if (lead.clarityUserId) {
      navigator.clipboard.writeText(lead.clarityUserId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <DialogTitle className="flex items-center gap-2">
              Device & Browser Details
              <Badge variant="outline">{info.platform}</Badge>
            </DialogTitle>
          </div>
          <DialogDescription>
            Technical details captured during the session.
          </DialogDescription>
        </DialogHeader>

        {/* Clarity ID Section */}
        <div className="bg-slate-100 p-4 rounded-lg flex items-center justify-between border border-slate-200">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clarity User ID</span>
            <span className="text-lg font-mono font-medium text-slate-800">{lead.clarityUserId || "N/A"}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyId}
            className="flex items-center gap-2 hover:bg-white"
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy ID"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Device Details */}
          <div className="space-y-4 border p-4 rounded-lg bg-muted/10">
            <h4 className="font-semibold flex items-center gap-2 text-primary">
              <Smartphone className="h-4 w-4" /> Device Configuration
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">OS / Platform:</span>
              <span className="font-medium text-right">{info.platform}</span>
              
              <span className="text-muted-foreground">Screen Res:</span>
              <span className="font-medium text-right">{info.screenResolution}</span>
              
              <span className="text-muted-foreground">Window Size:</span>
              <span className="font-medium text-right">{info.windowSize}</span>
              
              <span className="text-muted-foreground">Vendor:</span>
              <span className="font-medium text-right">{info.vendor}</span>
            </div>
          </div>

          {/* Browser Details */}
          <div className="space-y-4 border p-4 rounded-lg bg-muted/10">
            <h4 className="font-semibold flex items-center gap-2 text-primary">
              <Globe className="h-4 w-4" /> Browser Settings
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Language:</span>
              <span className="font-medium text-right">{info.language}</span>
              
              <span className="text-muted-foreground">Timezone:</span>
              <span className="font-medium text-right">{info.timeZone}</span>
              
              <span className="text-muted-foreground">Cookies:</span>
              <span className="font-medium text-right">
                {info.cookiesEnabled ? (
                  <span className="text-green-600 flex justify-end items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Enabled</span>
                ) : (
                  <span className="text-red-600">Disabled</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Raw User Agent */}
        <div className="mt-2 p-3 bg-secondary/50 rounded-md">
          <p className="text-xs font-mono text-muted-foreground break-all">
            <span className="font-bold block mb-1">User Agent String:</span>
            {info.userAgent}
          </p>
        </div>
        
        <div className="flex justify-end mt-2">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Transcript Popup
const TranscriptPopup = ({ lead, isOpen, onClose }: { lead: Lead | null, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !lead) return null

  const renderTranscriptContent = (text: string) => {
    if (!text) return <p className="text-muted-foreground italic">No transcript available.</p>;

    const rawLines = text.split('\n');
    const uniqueMessages: { role: string; content: string }[] = [];
    
    let lastRole = '';
    let lastNormalizedContent = ''; // Store the "cleaned" version for comparison

    // Helper to clean text for comparison (removes punctuation/spaces/case)
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    rawLines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      let role = 'system';
      let content = cleanLine;

      if (cleanLine.toLowerCase().startsWith('user:')) {
        role = 'user';
        content = cleanLine.substring(5).trim();
      } else if (cleanLine.toLowerCase().startsWith('assistant:')) {
        role = 'assistant';
        content = cleanLine.substring(10).trim();
      }

      // Generate a normalized version for checking
      const currentNormalized = normalize(content);

      // ⚡️ ENHANCED DEDUPLICATION ⚡️
      // 1. Check if roles match
      // 2. Check if normalized content is identical OR if one contains the other
      // (This catches "Hello." vs "Hello" vs "Hello -")
      if (role === lastRole && (
          currentNormalized === lastNormalizedContent || 
          (lastNormalizedContent.length > 3 && lastNormalizedContent.includes(currentNormalized)) ||
          (currentNormalized.length > 3 && currentNormalized.includes(lastNormalizedContent))
      )) {
        return; // Skip duplicate
      }

      if (role === 'user' || role === 'assistant') {
        uniqueMessages.push({ role, content });
        lastRole = role;
        lastNormalizedContent = currentNormalized;
      } else {
        // Handle system messages / multiline appends
        if (uniqueMessages.length > 0) {
           uniqueMessages[uniqueMessages.length - 1].content += '\n' + content;
           // Update the normalized content to include the appended text
           lastNormalizedContent += normalize(content);
        } else {
           uniqueMessages.push({ role: 'system', content });
        }
      }
    });

    // Rendering logic remains the same...
    return uniqueMessages.map((msg, index) => {
      const formatContent = (content: string) => {
        return content.split(/(\*\*.*?\*\*)/).map((part, i) => 
          part.startsWith('**') && part.endsWith('**') 
            ? <strong key={i}>{part.slice(2, -2)}</strong> 
            : part
        );
      };

      if (msg.role === 'user') {
        return (
          <div key={index} className="mb-4 flex flex-col items-start mr-12">
            <div className="bg-blue-50 border border-blue-100 rounded-lg rounded-tl-none p-3 w-full shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">User</span>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        );
      }

      if (msg.role === 'assistant') {
        return (
          <div key={index} className="mb-4 flex flex-col items-end ml-12">
            <div className="bg-green-50 border border-green-100 rounded-lg rounded-tr-none p-3 w-full shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Vakilsearch AI</span>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{formatContent(msg.content)}</p>
            </div>
          </div>
        );
      }

      return <div key={index} className="mb-2 text-xs text-center text-slate-400 italic">{msg.content}</div>;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Conversation Transcript
          </DialogTitle>
          <DialogDescription>Full conversation history for {lead.name}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4 border rounded-md bg-white/50">
           {renderTranscriptContent(lead.voice_transcript)}
        </div>
        <div className="flex items-center justify-between pt-4 mt-2 border-t">
          <Button variant="outline" className="gap-2" onClick={() => alert("Translation feature coming soon")}>
            <Languages className="h-4 w-4" /> Translate
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const LeadDetailPopup = ({ lead, isOpen, onClose }: { lead: Lead | null, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !lead) return null
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Lead Details: {lead.name}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Email:</span>
            <span className="col-span-3">{lead.email}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">WhatsApp:</span>
            <span className="col-span-3">{lead.whatsapp}</span>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- 3. Main Page Component ---

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [loading, setLoading] = useState(true)
  
  // State for popups
  const [selectedTranscriptLead, setSelectedTranscriptLead] = useState<Lead | null>(null)
  const [selectedDetailLead, setSelectedDetailLead] = useState<Lead | null>(null)
  
  // Stores the whole Lead object to access ID + BrowserInfo
  const [selectedDeviceLead, setSelectedDeviceLead] = useState<Lead | null>(null)

  const [filter, setFilter] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: keyof Lead | "createdAt"; direction: "ascending" | "descending" }>({ key: "createdAt", direction: "descending" })

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"))
        const leadsData: Lead[] = querySnapshot.docs
          .map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data()
            return {
              id: doc.id,
              name: data.name || "",
              email: data.email || "",
              whatsapp: data.whatsapp || "",
              language: data.language || "",
              amount: data.amount || "",
              createdAt: data.created_at?.toDate ? data.created_at.toDate().toISOString() : new Date(data.created_at).toISOString(),
              voice_transcript: data.voice_transcript || "",
              status: "New",
              assignedTo: data.assignedTo,
              lead_type: data.lead_type,
              client_id: data.client_id,
              ticket_id: data.ticket_id,
              calendar_status: data.calendar_status,
              meeting_link: data.meeting_link,
              start_time: data.start_time,
              end_time: data.end_time,
              lead_source: data.lead_source,
              clarityUserId: data?.clarity_user_id,
              deviceType: data?.device_type,
              browserInfo: data?.browser_info,
              tags: data.tags,
            }
          })
          .filter((lead) => lead.email || lead.whatsapp)
          .filter((lead) => lead.lead_source !== "GST" && (!lead.tags || !lead.tags.includes("gst")))

        const mergedLeadsMap = new Map<string, Lead>()
        leadsData.forEach((lead) => {
          if(lead.email === 'test@gmail.com') console.log(lead)
          if (lead.email) {
            const existingLead = mergedLeadsMap.get(lead.email)
            if (existingLead) {
              if (new Date(lead.createdAt) > new Date(existingLead.createdAt)) {
                mergedLeadsMap.set(lead.email, { ...lead, lead_type: "existing_lead" })
              } else {
                mergedLeadsMap.set(lead.email, { ...existingLead, lead_type: "existing_lead" })
              }
            } else {
              mergedLeadsMap.set(lead.email, lead)
            }
          } else {
            mergedLeadsMap.set(lead.id, lead)
          }
        })
        setLeads(Array.from(mergedLeadsMap.values()))
      } catch (error) {
        console.error("Error fetching leads:", error)
      }
    }

    const fetchLawyers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "lawyers"))
        const lawyersData: Lawyer[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || "",
            avatarUrl: data.avatarUrl || "",
            specialty: data.specialty || "",
            availability: data.availability || {},
          }
        })
        setLawyers(lawyersData)
      } catch (error) {
        console.error("Error fetching lawyers:", error)
      }
    }

    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchLeads(), fetchLawyers()])
      setLoading(false)
    }
    fetchData()
  }, [])

  const sortedAndFilteredLeads = useMemo(() => {
    let filteredLeads = leads
    if (filter) {
      filteredLeads = leads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(filter.toLowerCase()) ||
          (lead.email && lead.email.toLowerCase().includes(filter.toLowerCase())) ||
          (lead.ticket_id && lead.ticket_id.toLowerCase().includes(filter.toLowerCase())) ||
          (lead.client_id && lead.client_id.toLowerCase().includes(filter.toLowerCase()))
      )
    }

    return [...filteredLeads].sort((a, b) => {
      const key = sortConfig.key
      if (key === "createdAt") {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        if (dateA < dateB) return sortConfig.direction === "ascending" ? -1 : 1
        if (dateA > dateB) return sortConfig.direction === "ascending" ? 1 : -1
        return 0
      }

      const valueA = a[key] ?? ""
      const valueB = b[key] ?? ""

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortConfig.direction === "ascending" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      }

      if (valueA < valueB) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (valueA > valueB) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }, [leads, filter, sortConfig])

  const handleTranscriptClick = (lead: Lead) => {
    setSelectedTranscriptLead(lead)
  }
  const handleNameClick = (lead: Lead) => {
    setSelectedDetailLead(lead)
  }

  const getAssignedLawyerName = (lawyerId: string) => {
    const lawyer = lawyers.find((l) => l.id === lawyerId)
    return lawyer ? lawyer.name : "Unknown"
  }

  const generateGoogleCalendarLink = (lead: Lead) => {
    const baseUrl = "https://calendar.google.com/calendar/render"
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `Meeting with ${lead.name}`,
      details: `Scheduled meeting to discuss: ${lead.voice_transcript}`,
      add: lead.email,
    })
    return `${baseUrl}?${params.toString()}`
  }

  const requestSort = (key: keyof Lead | "createdAt") => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Quick copy function for the table row icon
  const handleQuickCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  }

  const downloadAsCSV = (data: Lead[]) => {
    const headers = ["ID", "Name", "Email", "WhatsApp", "Language", "Amount", "Created At", "Status", "Assigned To", "Lead Type", "Client ID", "Ticket ID", "Voice Transcript", "Device", "Clarity ID"]

    const csvRows = [headers.join(",")]

    const escapeCSV = (str: string) => `"${String(str || "").replace(/"/g, '""')}"`

    for (const lead of data) {
      const assignedToName = lead.assignedTo ? getAssignedLawyerName(lead.assignedTo) : "Unassigned"
      const values = [
        escapeCSV(lead.id),
        escapeCSV(lead.name),
        escapeCSV(lead.email),
        escapeCSV(lead.whatsapp),
        escapeCSV(lead.language),
        escapeCSV(lead.amount),
        escapeCSV(format(new Date(lead.createdAt), "yyyy-MM-dd HH:mm:ss")),
        escapeCSV(lead.status),
        escapeCSV(assignedToName),
        escapeCSV(lead.lead_type || "New"),
        escapeCSV(lead.client_id || ""),
        escapeCSV(lead.ticket_id || ""),
        escapeCSV(lead.voice_transcript),
        escapeCSV(lead.deviceType || ""),
        escapeCSV(lead.clarityUserId || ""),
      ]
      csvRows.push(values.join(","))
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", "leads.csv")
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>Manage all your new and existing leads.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Filter by name, email, ticket, or client ID..." 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)} 
                className="max-w-sm" 
              />
              <Button onClick={() => downloadAsCSV(sortedAndFilteredLeads)} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {/* Updated Name Column Header */}
                <TableHead className="w-[280px]">
                  <Button variant="ghost" onClick={() => requestSort("name")}>
                    Name & Device <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("lead_type")}>
                    Type <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("ticket_id")}>
                    Ticket ID <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("client_id")}>
                    Client ID <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Voice Transcript</TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button variant="ghost" onClick={() => requestSort("createdAt")}>
                    Created At <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    Loading leads...
                  </TableCell>
                </TableRow>
              ) : sortedAndFilteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    No leads found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedAndFilteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    {/* Name Column with Device Icon and Clarity ID */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleNameClick(lead)} className="font-semibold hover:underline text-left text-base">
                          {lead.name}
                        </button>
                        <div className="flex items-center gap-2">
                          {/* Device Icon */}
                          <div className="text-muted-foreground" title={lead.deviceType || "Unknown Device"}>
                            {lead.deviceType === 'Mobile' ? (
                              <Smartphone size={16} className="text-blue-500" />
                            ) : lead.deviceType === 'Web/Desktop' ? (
                              <Monitor size={16} className="text-slate-500" />
                            ) : ''}
                          </div>
                          
                          {/* Clickable Clarity ID Badge */}
                          {lead.clarityUserId ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSelectedDeviceLead(lead)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 transition-colors border cursor-pointer"
                                title="View Device Details"
                              >
                                <span className="font-mono">{lead.clarityUserId}</span>
                                <Info size={10} />
                              </button>
                              {/* Quick Copy Button in Table */}
                              <button 
                                onClick={(e) => handleQuickCopy(e, lead.clarityUserId!)}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                title="Copy ID"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          ) : ''}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={lead.lead_type === "existing_lead" ? "secondary" : "outline"}>{lead.lead_type === "existing_lead" ? "Existing" : "New"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{lead.email}</div>
                      <div className="text-xs text-muted-foreground">{lead.whatsapp}</div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{lead.ticket_id || "-"}</TableCell>
                    <TableCell className="text-xs font-mono">{lead.client_id || "-"}</TableCell>
                    
                    {/* ✨ UPDATED TRANSCRIPT COLUMN with FIX ✨ */}
                    <TableCell>
                      {lead.voice_transcript && 
                       lead.voice_transcript.length > 10 && 
                       !lead.voice_transcript.includes("transcript not available") ? (
                        <button onClick={() => handleTranscriptClick(lead)} className="cursor-pointer">
                          <Badge className="bg-green-100 hover:bg-green-200 text-green-700 border-green-200 flex items-center gap-1 px-2 py-1">
                            <Mic size={12} /> Available
                          </Badge>
                        </button>
                      ) : (
                        <Badge variant="outline" className="text-slate-400 border-slate-200 bg-slate-50 cursor-default">
                          Not Available
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <span>{format(new Date(lead.createdAt), "MMM d, yyyy")}</span>
                        <span>{format(new Date(lead.createdAt), "hh:mm a")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {lead.assignedTo ? (
                        <Badge variant="secondary">Assigned to {getAssignedLawyerName(lead.assignedTo)}</Badge>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <a href={generateGoogleCalendarLink(lead)} target="_blank" rel="noopener noreferrer">
                              <Video className="mr-2 h-4 w-4" /> Schedule Meeting
                            </a>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/drafts?leadId=${lead.id}`}>
                              <FileText className="mr-2 h-4 w-4" /> Write Draft
                            </Link>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{sortedAndFilteredLeads.length}</strong> of <strong>{leads.length}</strong> leads
          </div>
        </CardFooter>
      </Card>

      {/* Popup Components */}
      <TranscriptPopup 
        lead={selectedTranscriptLead} 
        isOpen={!!selectedTranscriptLead} 
        onClose={() => setSelectedTranscriptLead(null)} 
      />
      
      <LeadDetailPopup 
        lead={selectedDetailLead} 
        isOpen={!!selectedDetailLead} 
        onClose={() => setSelectedDetailLead(null)} 
      />

      <BrowserInfoPopup 
        lead={selectedDeviceLead} 
        isOpen={!!selectedDeviceLead} 
        onClose={() => setSelectedDeviceLead(null)} 
      />
    </>
  )
}