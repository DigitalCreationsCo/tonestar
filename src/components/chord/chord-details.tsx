"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume, Volume2, X } from 'lucide-react';
import type { Chord } from '@tonaljs/chord';
import { useAudioEngine } from '@/hooks/use-audio-engine';

export const ChordDetails = ({ chord, removeChord, ...props }: { chord: Chord, removeChord?: () => void, }) => {
    if (!chord || chord.empty) return null;
    const { playChord, isLoaded, isPlaying } = useAudioEngine();
    return (
      <Card {...props} className='rounded-none'>
        <CardHeader>
          <CardTitle className='w-full flex grow justify-between items-center'>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => playChord(chord, 1)}
              disabled={!isLoaded}
              className='text-2xl gap-x-2 font-semibold leading-none tracking-tight rounded-lg transition-none'
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
        </CardHeader>
        <CardContent>
          {/* <p>{chord.type}</p> */}
          <p>{chord.notes.join(', ')}</p>
          {/* <p>quality: {chord.quality}</p> */}
        </CardContent>
      </Card>
    );
  };