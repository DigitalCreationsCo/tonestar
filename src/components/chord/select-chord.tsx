import { useEffect } from "react";
import { Chord } from "@tonaljs/chord";
import { useState } from "react";
import { getChordInfo } from "@/lib/chord";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function SelectChord ({ setSelectedChord }: any) {
    const [userChord, setUserChord] = useState('');
    const [matchingChords, setMatchingChords] = useState<Chord[]>([]);
  
    useEffect(() => {
      if (userChord) {
        console.debug(`chord input `, userChord)
        // const chords = fetchMatchingChords(userChord); // Get matching chords for the user input
  
        // const matchingChords = getAllPossibleChords(validNotes)
        const matchingChords = getChordInfo(userChord)
  
        setMatchingChords(matchingChords as Chord[]); // Set matching chords to state
      }
    }, [userChord]);
  
    // Handle chord selection
    const handleChordSelection = (chord: Chord) => {
      chord.rootDegree = chord.rootDegree || 3; // Get the root degree of the selected chord
      setSelectedChord(chord);
      console.debug(`Selected chord: ${chord}`);
      // Further actions can be performed with the midiNote
    };
  
    return (
      <div>
        <label className="text-sm font-medium">Search chords</label>
        <Input
          type="text"
          value={userChord}
          onChange={(e) => setUserChord(e.target.value)}
          placeholder="Enter chord (e.g., D/D, Cmaj7/B)"
        />
        <div>
          <h3>Matching Chords</h3>
          {matchingChords.length > 0 ? (
            <ul>
              {matchingChords.slice(0, 12).map((chord, index) => (
                <li key={index}>
                  <Button className='w-full !rounded-none' onClick={() => handleChordSelection(chord)}>
                    {chord.symbol} {/* Display chord name */}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            // <p>No matching chords found</p>
            <></>
          )}
        </div>
      </div>
    );
};
