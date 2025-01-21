"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Chord } from '@tonaljs/chord';
import { splitSpaceOrComma } from '@/lib/utils';
import { analyzeNotesToChords, musicalNotes } from '@/lib/chord';

export function SelectChordByNotes ({ setSelectedChord }: any) {
    const [userNotes, setUserNotes] = useState<string>("");
    const [matchingChords, setMatchingChords] = useState<Chord[]>([]);
  
    useEffect(() => {
      if (userNotes) {
        console.debug(`notes input `, userNotes)
        const validNotes = splitSpaceOrComma(userNotes.toUpperCase()).filter(note => musicalNotes.has(note.toUpperCase()))
        console.debug(`valid notes `, validNotes)
  
        const matchingChords = analyzeNotesToChords(validNotes)
        // const matchingChordNames = ChordLib.detect(validNotes)
        // console.debug(`matching chord names `, matchingChordNames)
  
        // const matchingChords = matchingChordNames.map(chord => {
        //   console.debug(`map matching chords, chord `, chord)
        //   const match = {...ChordLib.get(chord)}
        //   match.rootDegree = match.rootDegree || 3;
        //   return match
        // })
        // console.debug(`matching chords `, matchingChords)
  
        setMatchingChords(matchingChords as Chord[]); // Set matching chords to state
      }
    }, [userNotes]);
  
    // Handle chord selection
    const handleChordSelection = (chord: Chord) => {
      chord.rootDegree = chord.rootDegree || 3; // Get the root degree of the selected chord
      setSelectedChord(chord);
      console.debug(`Selected chord: ${chord}`);
      // Further actions can be performed with the midiNote
    };
  
    return (
      <div>
        <label className="text-sm font-medium">Find chord by notes </label>
        <Input
          type="text"
          placeholder="e.g., D, F#, A"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
        />
        <div>
          <h3>Matching Chords</h3>
          {matchingChords.length > 0 ? (
            <ul>
              {matchingChords.map((chord, index) => (
                <li key={index}>
                  <Button className='w-full !rounded-none' onClick={() => handleChordSelection(chord)}>
                    {chord.symbol} {/* Display chord name */}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No matching chords found</p>
          )}
        </div>
      </div>
    );
};
  