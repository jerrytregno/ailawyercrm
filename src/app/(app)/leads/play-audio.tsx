'use client';

import { useState } from 'react';
import { PlayCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { textToSpeech } from '@/ai/flows/text-to-speech';

export function PlayAudio({ text }: { text: string }) {
  const [audio, setAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    if (audio) {
      const audioEl = new Audio(audio);
      audioEl.play();
      return;
    }
    setLoading(true);
    try {
      const result = await textToSpeech(text);
      if (result && result.audio) {
        setAudio(result.audio);
        const audioEl = new Audio(result.audio);
        audioEl.play();
      }
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePlay} variant="ghost" size="icon" disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <PlayCircle className="h-4 w-4" />
      )}
      <span className="sr-only">Play audio summary</span>
    </Button>
  );
}
