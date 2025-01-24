"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume, Volume2, X } from 'lucide-react';
import type { Chord } from '@tonaljs/chord';
import { useAudioEngine } from '@/hooks/use-audio-engine';

export const ChordDetails = ({ chord, removeChord, ...props }: { chord: Chord, removeChord?: () => void, }) => {
    const { playChord, isPlaying } = useAudioEngine();
    
    if (!chord || chord.empty) return null;
    
    return (
      <Card {...props} className='rounded-none bg-secondary/25'>
        <CardHeader>
          <CardTitle className='w-full flex grow justify-between items-center'>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => playChord(chord, 1)}
              className='px-0 text-2xl gap-x-2 font-semibold leading-none tracking-tight rounded-lg transition-none'
              >
              {chord.symbol}
              { isPlaying ? <Volume2 className="w-5 h-5" /> : <Volume className="w-5 h-5" /> }
            </Button>
            { removeChord &&
              <Button 
                variant="ghost" 
                size="sm"
                onClick={removeChord}
                className="ml-auto rounded-full transition-none"
              >
                <X className="w-4 h-4" />
              </Button>
            }
          </CardTitle>
          <p className='text-sm text-muted-foreground'>{chord.type}</p>
        </CardHeader>
        <CardContent className='text-sm text-muted-foreground'>
          <p className='text-sm text-muted-foreground'>{chord.notes.join(', ')}</p>
          {/* <Input type='number' value={chord.rootDegree} onChange={(e) => chord.rootDegree = Number(e.target.value)} /> */}
        </CardContent>
      </Card>
    );
  };