"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where, QueryDocumentSnapshot, DocumentData } from "firebase/firestore"
import { format } from "date-fns"
import { Phone, Mail, Link as LinkIcon, Clock, Mic, Loader2, MessageSquare, Languages } from "lucide-react"
import Link from "next/link"

import { db } from "@/lib/firebase"
import type { Meeting } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// --- Helper Component: Transcript Popup ---
const TranscriptPopup = ({ transcript, userName, isOpen, onClose }: { transcript: string | null; userName: string; isOpen: boolean; onClose: () => void }) => {
  if (!isOpen || !transcript) return null

  // Helper to parse and style the transcript lines
  const renderTranscriptContent = (text: string) => {
    if (!text) return <p className="text-muted-foreground italic">No transcript available.</p>

    // 1. Group lines into message blocks
    const lines = text.split("\n")
    const messages: { role: string; content: string }[] = []
    let currentMessage: { role: string; content: string } | null = null

    lines.forEach((line) => {
      const cleanLine = line.trim()
      if (!cleanLine) return

      const isUser = cleanLine.toLowerCase().startsWith("user:")
      const isAssistant = cleanLine.toLowerCase().startsWith("assistant:")

      if (isUser || isAssistant) {
        if (currentMessage) {
          messages.push(currentMessage)
        }
        currentMessage = {
          role: isUser ? "user" : "assistant",
          content: cleanLine.replace(/^(user|assistant):/i, "").trim(),
        }
      } else {
        if (currentMessage) {
          currentMessage.content += "\n" + cleanLine
        } else {
          messages.push({ role: "system", content: cleanLine })
        }
      }
    })

    if (currentMessage) {
      messages.push(currentMessage)
    }

    // 2. Render the grouped messages
    return messages.map((msg, index) => {
      // Helper to render simple markdown bolding (**text**)
      const formatContent = (content: string) => {
        return content.split(/(\*\*.*?\*\*)/).map((part, i) => (part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part))
      }

      if (msg.role === "user") {
        return (
          <div key={index} className="mb-4 flex flex-col items-start mr-12">
            <div className="bg-blue-50 border border-blue-100 rounded-lg rounded-tl-none p-3 w-full shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">User</span>
              </div>
              <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        )
      }

      if (msg.role === "assistant") {
        return (
          <div key={index} className="mb-4 flex flex-col items-end ml-12">
            <div className="bg-green-50 border border-green-100 rounded-lg rounded-tr-none p-3 w-full shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Vakilsearch AI</span>
              </div>
              <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{formatContent(msg.content)}</div>
            </div>
          </div>
        )
      }

      return (
        <div key={index} className="mb-2 text-xs text-center text-slate-400 italic py-2">
          {msg.content}
        </div>
      )
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Conversation Transcript
          </DialogTitle>
          <DialogDescription>Full conversation history for {userName}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 border rounded-md bg-white/50">{renderTranscriptContent(transcript)}</div>

        <div className="flex items-center justify-between pt-4 mt-2 border-t">
          <Button variant="outline" className="gap-2" onClick={() => alert("Translation logic to be implemented")}>
            <Languages className="h-4 w-4" />
            Translate to English
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Main Page Component ---

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  // State for popup
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const usersCollection = collection(db, "users")
        const q = query(usersCollection, where("calendar_status", "==", "scheduled"))
        const querySnapshot = await getDocs(q)
        let meetingsData: Meeting[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data()
          return {
            id: doc.id,
            userName: data.name || "N/A",
            userContact: {
              email: data.email || "",
              phone: data.whatsapp || "",
            },
            meetingLink: data.meeting_link || "",
            startTime: data.start_time || new Date().toISOString(),
            endTime: data.end_time || new Date().toISOString(),
            voiceTranscript: data.voice_transcript || "No transcript available.",
          }
        })

        // Sort meetings by start time in descending order
        meetingsData.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

        setMeetings(meetingsData)
      } catch (error) {
        console.error("Error fetching meetings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMeetings()
  }, [])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Meetings</CardTitle>
          <CardDescription>A log of all scheduled meetings and their details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p>No scheduled meetings found.</p>
              </div>
            ) : (
              meetings.map((meeting: Meeting) => (
                <Card key={meeting.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{meeting.userName}</CardTitle>
                        <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-muted-foreground mt-2">
                          {meeting.userContact.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{meeting.userContact.email}</span>
                            </div>
                          )}
                          {meeting.userContact.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{meeting.userContact.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button asChild variant="outline" disabled={!meeting.meetingLink}>
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
                          <h4 className="font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Timings
                          </h4>
                          <p className="text-sm text-muted-foreground">Start: {format(new Date(meeting.startTime), "MMM d, yyyy 'at' h:mm a")}</p>
                          <p className="text-sm text-muted-foreground">End: {format(new Date(meeting.endTime), "MMM d, yyyy 'at' h:mm a")}</p>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Mic className="h-4 w-4" /> Voice Transcript
                        </h4>

                        {meeting.voiceTranscript && meeting.voiceTranscript.length > 10 && !meeting.voiceTranscript.includes("transcript not available") ? (
                          <div className="flex items-center">
                            <button onClick={() => setSelectedMeeting(meeting)} className="cursor-pointer transition-opacity hover:opacity-80">
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 flex items-center gap-1 px-3 py-1.5 text-sm">
                                <MessageSquare className="h-3 w-3" /> View Transcript (Available)
                              </Badge>
                            </button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 border-slate-200 bg-slate-50 cursor-default text-sm px-3 py-1.5">
                            Not Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <TranscriptPopup
        transcript={selectedMeeting?.voiceTranscript || null}
        userName={selectedMeeting?.userName || "Unknown User"}
        isOpen={!!selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
      />
    </>
  )
}
