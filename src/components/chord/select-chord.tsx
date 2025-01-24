"use client"
import { useEffect } from "react";
import { Chord } from "@tonaljs/chord";
import { useState } from "react";
import { getChordInfo } from "@/lib/music";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function SelectChord ({ setSelectedChord }: any) {
    const [userChord, setUserChord] = useState('');
    const [matchingChords, setMatchingChords] = useState<Chord[]>([]);
  
    useEffect(() => {
      if (userChord) {
        const matchingChords = getChordInfo(userChord);
        setMatchingChords(matchingChords as Chord[]);
      } else {
        setMatchingChords([])
      }
    }, [userChord]);
  
    // Handle chord selection
    const handleChordSelection = (chord: Chord) => {
      chord.rootDegree = chord.rootDegree || 3; // Get the root degree of the selected chord
      setSelectedChord(chord);
      console.debug(`Selected chord: ${chord}`);
      setUserChord('')
    };
  
    return (
      <div className='flex-[0.5]'>
        <label className="text-sm font-medium">Find chord names</label>
        <Input
          type="text"
          value={userChord}
          onChange={(e) => setUserChord(e.target.value)}
          placeholder="e.g. A, D/D, Cmaj7/B"
        />
        <div>
          {matchingChords.length > 0 ? (
            <>
            <ul>
              {matchingChords.slice(0, 12).map((chord, index) => (
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
