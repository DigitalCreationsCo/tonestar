"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Chord } from '@tonaljs/chord';
import { splitSpaceOrComma } from '@/lib/utils';
import { analyzeNotesToChords, musicalNotes } from '@/lib/music';

export function SelectChordByNotes ({ setSelectedChord }: any) {
    const [userNotes, setUserNotes] = useState<string>("");
    const [matchingChords, setMatchingChords] = useState<Chord[]>([]);
  
    useEffect(() => {
      if (userNotes) {
        console.debug(`notes input `, userNotes)
        const validNotes = splitSpaceOrComma(userNotes.toUpperCase()).filter(note => musicalNotes.has(note.toUpperCase()))
        console.debug(`valid notes `, validNotes)
        const matchingChords = analyzeNotesToChords(validNotes)
        setMatchingChords(matchingChords as Chord[]); // Set matching chords to state
      } else {
        setMatchingChords([])
      }
    }, [userNotes]);
  
    const handleChordSelection = (chord: Chord) => {
      chord.rootDegree = chord.rootDegree || 3; // Get the root degree of the selected chord
      setSelectedChord(chord);
      console.debug(`Selected chord: ${chord}`);
      setUserNotes('')
    };
  
    return (
      <div className='flex-[0.5]'>
        <label className="text-sm font-medium">Find chord by notes </label>
        <Input
          type="text"
          placeholder="e.g. D, F#, A"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
        />
        <div>
          {matchingChords.length > 0 ? (
            <>
            <ul>
              {matchingChords.map((chord, index) => (
                <li key={index}>
                  <Button className='w-full !rounded-none' onClick={() => handleChordSelection(chord)}>
                    {chord.symbol} {/* Display chord name */}
                  </Button>
                </li>
              ))}
            </ul>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
};
  