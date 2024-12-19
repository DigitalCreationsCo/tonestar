"use client"

import React, { useState, useEffect, useCallback, DragEventHandler, DragEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Music, Plus, Trash2, Play, Pause, Volume2, Save, X } from 'lucide-react';
import * as ChordLib from '@tonaljs/chord';
import type { Chord } from '@tonaljs/chord';
import pedalSamples from '@audio-samples/piano-pedals';
import velocitySamples from '@audio-samples/piano-velocity6';
import releaseSamples from '@audio-samples/piano-release';
import harmonicSamples from '@audio-samples/piano-harmonics';
import * as Tone from 'tone';
import { Piano } from '@/piano';
import debounce from 'lodash/debounce';
import { App } from '@/lib/App';
import { LLMQuery, TonestarAiRequest, TonestarAiResponse } from '@/lib/llmClient';
import { getEnv } from "@/components/auth/actions";
import { toast } from '@/hooks/use-toast';
import { chordList } from '@/lib/chordList';
// import { Piano } from '@tonejs/piano';
import { Progress } from '@/components/ui/progress';

const llmPromise = LLMQuery.getInstance(getEnv)

type ChordMatchType = Partial<Chord> & {
  isOriginal: boolean;
  matchScore: {
    matching: number;
    total: number;
    percentage: string;
  };
  containedScore: {
    contained: number;
    total: number;
    percentage: string;
  };
  matchingNotes: string[];
  relationship: string;
}

type ChordDraggableType = {
  id: string;
  symbol: string;
  position: number;
}
const commonChords: Readonly<string[]> = [
  'major', 'minor', '7', 'maj7', 'm7', 'dim7', 'aug', 
  'sus4', 'sus2', '6', 'm6', '9', 'maj9', 'm9',
  'add9', '69', 'm69', '11', 'maj11', 'min11'
];

/**
 * Gets information about a chord and all chords sharing similar notes
 * @param {string} chordName - Name of the chord (e.g., "Cmaj7", "Dm")
 * @returns {Object[]} Array of chord information objects
 */
function getChordInfo(chordName: string) {
  // Get the original chord information
  const originalChord = ChordLib.get(chordName);
  
  // If the chord is invalid, return empty array
  if (originalChord.empty) {
    return [];
  }

  // Get the notes from the original chord
  const originalNotes = new Set(originalChord.notes);

  // For each note in the original chord, try it as a root with different chord types
  const allPossibleChords = Array.from(originalNotes).flatMap(root => {
    return commonChords.map(type => {
      const testChord = ChordLib.getChord(type, root);
      const testNotes = new Set(testChord.notes);

      // Calculate how many notes match with the original chord
      const matchingNotes = Array.from(originalNotes).filter(note => testNotes.has(note));
      const containedNotes = Array.from(testNotes).filter(note => originalNotes.has(note));

      return {
        name: testChord.name,
        symbol: testChord.symbol,
        type: testChord.type,
        tonic: testChord.tonic,
        notes: testChord.notes,
        intervals: testChord.intervals,
        quality: testChord.quality,
        bass: testChord.bass,
        isOriginal: testChord.symbol === originalChord.symbol,
        matchScore: {
          matching: matchingNotes.length,
          total: testChord.notes.length,
          percentage: (matchingNotes.length / testChord.notes.length * 100).toFixed(1)
        },
        containedScore: {
          contained: containedNotes.length,
          total: originalNotes.size,
          percentage: (containedNotes.length / originalNotes.size * 100).toFixed(1)
        },
        matchingNotes,
        relationship: testChord.symbol === originalChord.symbol ? 'original' : 'related'
      };
    });
  });

  // Filter and sort results
  return processChordResults(allPossibleChords);
}

/**
 * Analyzes input notes to find possible chords
 * @param {string} noteString - Space-separated string of notes (e.g., "C E G")
 * @returns {Object[]} Array of detailed chord information
 */
function analyzeNotesToChords(inputNotes: string[]) {
  // Split the input string into notes array

  // Generate initial chord possibilities using the first note as root
  const initialChord = ChordLib.getChord('major', inputNotes[0]);
  
  // Use getChordInfo to find all related chords
  const relatedChords = getChordInfo(initialChord.symbol);
  
  // Add additional possibilities using other notes as roots
  const additionalChords = inputNotes.slice(1).flatMap(root => {
    const testChord = ChordLib.getChord('major', root);
    return getChordInfo(testChord.symbol);
  });

  // Combine all results
  const allChords = [...relatedChords, ...additionalChords];

  // Process and filter based on input notes
  return processChordResults(allChords, inputNotes);
}

/**
 * Helper function to process and filter chord results
 * @param {Object[]} chords - Array of chord objects
 * @param {string[]} [filterNotes] - Optional array of notes to filter by
 * @returns {Object[]} Processed and filtered chord array
 */
function processChordResults(chords: ChordMatchType[], filterNotes: (string[] | null) = null) {
  // Filter out chords with no matching notes
  const relevantChords = chords.filter(chord => 
    chord.matchScore.matching > 0 || chord.containedScore.contained > 0
  );

  // Remove duplicates based on symbol
  const uniqueChords = Array.from(
    new Map(relevantChords.map(chord => [chord.symbol, chord])).values()
  );

  // Sort results
  const sortedChords = uniqueChords.sort((a, b) => {
    if (a.isOriginal) return -1;
    if (b.isOriginal) return 1;
    
    const matchDiff = b.matchScore.matching - a.matchScore.matching;
    if (matchDiff !== 0) return matchDiff;
    
    return a.notes!.length - b.notes!.length;
  });

  // If filterNotes provided, filter based on those notes
  if (filterNotes) {
    return sortedChords.filter(chord => 
      filterNotes.some(note => chord?.notes?.includes(note))
    );
  }

  return sortedChords;
}

const musicalNotes: ReadonlySet<string> = new Set([
  "A",
  "A#",
  "B",
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
]);

const splitSpaceOrComma = (input:string) => input.split(/[ ,]+/)

// function toOgg(urlMap) {
//   console.debug(`to ogg url map `, urlMap);

//   // Assuming all your audio files are in the /samples folder
//   const audioFolder = 'samples';

//   Object.keys(urlMap).forEach(key => {
//     console.debug(`key ${key}`);
    
//     // If the file doesn't end with .ogg, add the .ogg extension
//     if (!urlMap[key].endsWith('.ogg')) {
//       urlMap[key] = `${audioFolder}/${urlMap[key]}.ogg`;
//     } else {
//       urlMap[key] = `${audioFolder}/${urlMap[key]}`; // Ensure correct path handling
//     }
//   });

//   console.debug(`url map after: `, urlMap);
// }

// Audio Engine with Tone.js Piano
const useAudioEngine = () => {
  const [piano, setPiano] = useState<Piano | null>(null);
  const [audioContextStarted, setAudioContextStarted] = useState(false);
  const [samples, setSamples] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Piano initialization
    const setupPiano = async () => {
      try {
        console.debug(`init piano`);
        const piano = new Piano({ velocities: 1, release: true });
        piano.toDestination();
    
        // // Configure pedal samples
        // piano._pedal.samples = pedalSamples;
        // console.debug(`piano._pedal.samples `, piano._pedal.samples);
        // console.debug(`pedal samples `, pedalSamples);
    
        // piano._pedal._internalLoad = () => {
        //   return new Promise((success) => {
        //     console.debug("Loading pedal audio buffers...");
    
        //     const audioPaths = {
        //       down1: 'pedalD1.ogg',
        //       down2: 'pedalD2.ogg',
        //       up1: 'pedalU1.ogg',
        //       up2: 'pedalU2.ogg',
        //     };
    
        //     piano._pedal._buffers = {};
        //     const bufferPromises = [];
    
        //     // Load each pedal audio file individually
        //     Object.entries(audioPaths).forEach(([key, path]) => {
        //       console.debug(`Loading audio file for ${key}: ${path}`);
        //       bufferPromises.push(
        //         new Promise((resolve, reject) => {
        //           try {
        //             const sampleUrl = encodeURIComponent(`samples/${path}`)
        //             console.debug('sampleUrl ' + sampleUrl)

        //             piano._pedal._buffers[key] = new Tone.ToneAudioBuffer(sampleUrl, resolve, piano._pedal.samples);
        //             console.debug(`Successfully loaded ${key} buffer`);
        //           } catch (error) {
        //             console.error(`Error loading ${key} buffer:`, error);
        //             reject(error);
        //           }
        //         })
        //       );
        //     });
    
        //     // Wait for all pedal audio files to finish loading
        //     Promise.all(bufferPromises)
        //       .then(() => {
        //         console.debug("All pedal audio buffers loaded successfully");
        //         success();
        //       })
        //       .catch((error) => {
        //         console.error("Error loading pedal audio buffers:", error);
        //       });
        //   });
        // };
    
        // // Load release samples individually
        // console.debug("Loading release samples...");
        // await loadSamplesIndividually(releaseSamples, "releaseSamples");
    
        // // Load harmonic samples individually
        // // console.debug("Loading harmonic samples...");
        // // await loadSamplesIndividually(harmonicSamples, "harmonicSamples");
    
        // // Load velocity samples individually
        // // console.debug("Loading velocity samples...");
        // // await loadSamplesIndividually(velocitySamples, "velocitySamples");
    
        // // Configure other piano components
        // console.debug("Configuring keybed samples...");
        // piano._keybed.samples = releaseSamples;
        // toOgg(piano._keybed._urls);
    
        // // console.debug("Configuring harmonics samples...");
        // // piano._harmonics.samples = harmonicSamples;
        // // toOgg(piano._harmonics._urls);
    
        // // console.debug("Configuring strings samples...");
        // // piano._strings._strings[0].samples = velocitySamples;
        // // toOgg(piano._strings._strings[0]._urls);
    
        // // Load the piano after configuring all components
        // console.debug("Loading piano...");
        await piano.load();
    
        // Check if the component is mounted before updating state
        if (mounted) {
          console.debug("Piano loaded successfully, setting state...");
          setPiano(piano);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to initialize piano:', error);
      }
    };
    
    // Helper function to load samples individually
    const loadSamplesIndividually = (samples: any[], sampleType: string) => {
      return new Promise((resolve, reject) => {
        const samplePromises: any[] = [];
    
        console.debug(`Loading ${sampleType}...`);
    
        samples.forEach((sample, index) => {
          samplePromises.push(
            new Promise((sampleResolve, sampleReject) => {
              try {
                // Assuming each sample has a URL to load, replace with your actual sample path if necessary
                const samplePath = encodeURIComponent(`samples/${sample}`);
                console.debug(`Loading sample: ${samplePath}`);
                new Tone.ToneAudioBuffer(samplePath, sampleResolve, sample);
                console.debug(`Successfully loaded ${sampleType} sample: ${sample}`);
              } catch (error) {
                console.error(`Error loading ${sampleType} sample: ${sample}`, error);
                sampleReject(error);
              }
            })
          );
        });
    
        // Wait for all sample files to finish loading
        Promise.all(samplePromises)
          .then((ok) => {
            console.debug(`${sampleType} loaded successfully`);
            resolve(ok);
          })
          .catch((error) => {
            console.error(`Error loading ${sampleType}:`, error);
            reject(error);
          });
      });
    };
    

    setupPiano();

    return () => {
      mounted = false;
      if (piano) {
        piano.dispose();
      }
    };
    // const setup = async () => {
    //   try {
    //     console.debug(`setup audio engine`)
    //     console.debug('Tone')
    //     console.debug(Tone)
    //     let toneStart
    //     try {
    //       toneStart = await Tone.start();          
    //     } catch (error) {
    //       console.error(error)
    //     }
        
    //     console.debug(`tone start ${toneStart}`)
    //     console.debug(`start`)
        
    //     const pianoInstance = await initPiano();
    //     console.debug(`piano instance `, pianoInstance)

    //     if (mounted) {
    //       setPiano(pianoInstance);
    //       setIsLoaded(true);
    //     }
    //   } catch (error) {
    //     console.error('Failed to initialize piano:', error);
    //   }
    // };
  }, []);

  // useEffect(() => {
  //   const ctx = new (window.AudioContext || window.webkitAudioContext)();
  //   setAudioContext(ctx);
    
  //   // Load piano samples
  //   const loadSamples = async () => {
  //     const loadedSamples = {};

  //     for (const [note, url] of Object.entries(pianoSamples)) {
  //       console.debug(`note ${note}`)
  //       console.debug(`url ${url}`)

  //       try {
  //         const response = await fetch(encodeURIComponent(url));
  //         const arrayBuffer = await response.arrayBuffer();
  //         const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  //         loadedSamples[note] = audioBuffer;
  //       } catch (error) {
  //         console.error(`Failed to load sample for note ${note}:`, error);
  //       }
  //     }
  //     setSamples(loadedSamples);
  //     setIsLoaded(true);
  //   };

  //   loadSamples();

  //   return () => {
  //     ctx.close();
  //   };
  // }, []);

    const startAudioContext = async () => {
      if (!audioContextStarted) {
        try {
          await Tone.start();
          setAudioContextStarted(true);
          return true;
        } catch (error) {
          console.error('Failed to start AudioContext:', error);
          return false;
        }
      }
      return true;
    };
  
    const playChord = async (chord: Chord, duration = 2) => {
      console.debug(`play chord notes: `, chord.notes)
      console.debug(`play chord degree: `, chord.rootDegree)
      if (!piano || !isLoaded) return;
      
      // Ensure AudioContext is started before playing
      const started = await startAudioContext();
      if (!started) return;
  
      const durationSeconds = (60 / Tone.Transport.bpm.value) * duration;
      const now = Tone.now();
      
      chord.notes.forEach(note => {
        const noteWithOctaveDegree = note + chord.rootDegree; // add the scalign octave function for accurate chord intervals
        console.debug(`note with octave degree ${noteWithOctaveDegree}`)

        console.debug(`play note `, note);
        piano.keyDown({ note: noteWithOctaveDegree, velocity: 0.7 });
        piano.keyUp({ note: noteWithOctaveDegree, time: now + durationSeconds });
      });
    };
  
    const stopAllNotes = () => {
      if (!piano) return;
      piano.releaseAll();
    };

  // const playChord = (notes, duration = 2) => {
  //   console.debug(`playchord`)
  //   console.debug(`notes `, notes)
  //   console.debug(`duration ${duration}`)

  //   if (!audioContext || !isLoaded) return;
  //   console.debug(`audioContext ${audioContext}`)
  //   console.debug(`isLoaded ${isLoaded}`)

  //   notes.forEach(note => {
  //     const source = audioContext.createBufferSource();
  //     const gainNode = audioContext.createGain();
      
  //     source.buffer = samples[note];
  //     source.connect(gainNode);
  //     gainNode.connect(audioContext.destination);
  //     console.debug(`gain node connected`)

  //     // Set initial volume
  //     gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
  //     // Fade out at the end
  //     gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
  //     source.start();
  //     console.debug(`source start`)

  //     source.stop(audioContext.currentTime + duration);
  //     console.debug(`source stop`)
  //   });
  // };

  return { playChord, stopAllNotes, isLoaded, startAudioContext };
};

const GRID_SIZE = 16; // 16th note grid
const DEFAULT_TEMPO = 120;

const songStyles = {
  pop: {
    structure: ['verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus'],
    tempoRange: [100, 130]
  },
  rock: {
    structure: ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro'],
    tempoRange: [120, 160]
  },
  ballad: {
    structure: ['intro', 'verse', 'chorus', 'verse', 'chorus', 'outro'],
    tempoRange: [60, 80]
  },
  electronic: {
    structure: ['intro', 'buildup', 'drop', 'breakdown', 'buildup', 'drop', 'outro'],
    tempoRange: [120, 140]
  }
};

const chordProgressions = {
  happy: {
    verse: [
      ['Cmaj7', 'Am7', 'Fmaj7', 'G7'],
      ['Dmaj7', 'Bm7', 'Gmaj7', 'A7'],
      ['Gmaj7', 'Em7', 'Cmaj7', 'D7']
    ],
    chorus: [
      ['Fmaj7', 'G7', 'Em7', 'Am7'],
      ['Cmaj7', 'Dm7', 'Em7', 'F6'],
      ['Gmaj7', 'Am7', 'Bm7', 'C6']
    ]
  },
  melancholic: {
    verse: [
      ['Am7', 'Dm7', 'Em7', 'F6'],
      ['Em7', 'Am7', 'Dm7', 'Bm7b5'],
      ['Dm7', 'G7', 'Cmaj7', 'Am7']
    ],
    chorus: [
      ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7'],
      ['Am7', 'G7', 'Fmaj7', 'E7'],
      ['Dm7', 'G7', 'Cmaj7', 'Am7']
    ]
  },
  energetic: {
    verse: [
      ['E7', 'A7', 'D7', 'G7'],
      ['Dmaj7', 'A7', 'Gmaj7', 'E7'],
      ['Gmaj7', 'D7', 'Em7', 'A7']
    ],
    chorus: [
      ['Dmaj7', 'A7', 'Bm7', 'G6'],
      ['Gmaj7', 'Em7', 'Amaj7', 'D7'],
      ['Cmaj7', 'G7', 'Am7', 'D7']
    ]
  }
};

type Section = {
  type: string;
  chords: string;
  expanded: boolean;
}

const SongWriter = () => {
  const [songIdea, setSongIdea] = useState('');
  const [initialChords, setInitialChords] = useState('');
  const [parsedNotes, setParsedNotes] = useState<Set<string>>(new Set());
  const [parsedChords, setParsedChords] = useState<Set<Chord>>(new Set());
  const [sections, setSections] = useState<Section[]>([]);
  const [llm, setLlm] = useState<LLMQuery | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [tempo, setTempo] = useState(DEFAULT_TEMPO);
  const [songStyle, setSongStyle] = useState('pop');
  const [barArrangements, setBarArrangements] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [db, setDB] = useState<IDBDatabase | null>(null);
  const [currentSongId, setCurrentSongId] = useState(null);
  const [generatedSong, setGeneratedSong] = useState<{
    type: string;
    chords: string;
    expanded: boolean;
}[] | null>(null);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [audioInitialized, setAudioInitialized] = useState(false);


  const { playChord, stopAllNotes, isLoaded, startAudioContext } = useAudioEngine();

  const removeParsedChord = (index: number) => {
    const chordList = Array.from(parsedChords.values())
    chordList.splice(index)
    setParsedChords(new Set(chordList))
  }

  // Initialize audio on first play attempt
  const handleFirstPlay = async () => {
    if (!audioInitialized) {
      const started = await startAudioContext();
      if (started) {
        setAudioInitialized(true);
      }
    }
  };
  
  const playProgression = async (chords: string) => {
    if (!isLoaded || isPlaying) return;
    
    console.debug(`play progression`)
    console.debug(`isLoaded ${isLoaded}`)
    console.debug(`isPlaying ${isPlaying}`)

    // Ensure audio is initialized before playing
    if (!audioInitialized) {
      const started = await startAudioContext();
      if (!started) return;
      setAudioInitialized(true);
    }

    setIsPlaying(true);
    setCurrentChordIndex(0);

    const chordList = chords.split(' - ');
    console.debug(`chord list ${chordList}`)

    for (let i = 0; i < chordList.length; i++) {
      // console.debug(`break? ${!isPlaying}`)
      // if (!isPlaying) break;
      
      setCurrentChordIndex(i);

      const chord = { ...ChordLib.get(chordList[i]) };
      chord.rootDegree = chord.rootDegree || 3

      console.debug(`chord lib chord: ${chord}`)
      await playChord(chord, 1);

      console.debug(`played chord`)
      await new Promise(resolve => setTimeout(resolve, (60 / tempo) * 1000));

    }

    setIsPlaying(false);
    setCurrentChordIndex(0);
  };

  const stopPlaying = () => {
    console.debug(`stop playing`)
    setIsPlaying(false);
    stopAllNotes();
  };

  // Function to initialize the LLMQuery instance asynchronously
  const initializeLlmQuery = async () => {
    try {
      const llmInstance = await LLMQuery.getInstance(getEnv);
      if (llmInstance) {
        setLlm(llmInstance); // Store the instance in state
        setIsLoading(false);  // Set loading to false once initialized
      }
    } catch (error) {
      console.error("Error initializing LLMQuery:", error);
      setIsLoading(false);
    }
  };

  const generateChordsAiResponse = async (query: TonestarAiRequest) => {
    if (llm) {
      try {
        setIsLoading(true);
        console.debug(`ai query: `, query);
        const response = await llm.sendRequest(query);
        setIsLoading(false);
        return response;
      } catch (error) {
        setIsLoading(false);
        throw new Error("Error querying LLM:", error.message)
      }
    }
  };
  
  const generateSongAiResponse = async (query: TonestarAiRequest) => {
    if (llm) {
      try {
        setIsLoading(true);
        console.debug(`ai query: `, query);
        const response = await llm.sendRequest(query);
        setIsLoading(false);
        return response;
      } catch (error) {
        setIsLoading(false);
        console.error("generate song error:", error);
        toast({ description: "Error generating song." })
        throw new Error("Error generating song:", error.message)
      }
    }
  };

  useEffect(() => {
    initializeLlmQuery(); // Initialize LLMQuery on component mount
  }, []); // Empty dependency array ensures this runs only once on mount


  // Parse initial chords when they change
  useEffect(() => {
    if (initialChords) {
      const chords = initialChords.split(' ').filter(chord => chord.trim());
      console.debug(`use effect initial chords `, chords)

      const parsed = chords.map(chord => {
        const chordObj = ChordLib.get(chord)
        return {
          ...chordObj,
          rootDegree: chordObj.rootDegree || 3, 
        }
      });
      console.debug(`use effect parsed chords`, parsed)
      setParsedChords(prev => {
        const chordMap = new Map();

        // Add all chords from the previous Set to the Map
        Array.from(prev).concat(parsed).filter(chord => !chord.empty).forEach(chord => chordMap.set(chord.symbol, chord));

        // Add all chords from the parsed list to the Map
        parsed.forEach(chord => chordMap.set(chord.symbol, chord));
      
        // Create a new Set from the unique values in the Map
        const newSet = new Set(chordMap.values());
      
        console.debug(`setParsedChords newSet `, newSet);
      
        return newSet;
      });
    }
  }, [initialChords]);

  // Initialize IndexedDB
  useEffect(() => {
    initDB().then(database => setDB(database));
  }, []);

  useEffect(() => {
    console.debug(`useeffect isPlaying? ${isPlaying}`)
  }, [
    isPlaying
  ])

  // Update tempo handling to use Tone.js Transport
  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  // Function to parse and fetch matching chords
const fetchMatchingChords = (note: string) => {
  console.debug(`fetch matching chords ${note}`)
  const chord = {...ChordLib.chord(note)}; // Parse the input chord
  console.debug(`chordlib chord before `, chord)

  chord.root = chord.root || note;
  chord.rootDegree = chord.rootDegree || 3;

  console.debug(`chordlib chord `, chord)
  const root = chord.root; // Get the root of the chord (e.g., 'D', 'Cmaj7', etc.)
  console.debug(`Chord root: ${root}`);

  // Fetch all matching chords with the same root
  const matchingChord = ChordLib.get(root)
  console.debug(`matching chord  `, matchingChord)

  const matchingChordNames = Array.from(ChordLib.extended(matchingChord.symbol)).concat(ChordLib.reduced(matchingChord.symbol))
  console.debug(`matching chord names `, matchingChordNames)

  const matchingChords = matchingChordNames.map(chord => {
    console.debug(`map matching chords, chord `, chord)
    return { ...ChordLib.get(chord)}
  })
  console.debug(`matching chords with root `, matchingChords)
  return matchingChords;
};

const NoteSelector = ({ setSelectedChord }: any) => {
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

const ChordSelector = ({ setSelectedChord }: any) => {
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
          <p>No matching chords found</p>
        )}
      </div>
    </div>
  );
};

  const getMoodFromText = (text: string) => {
    const text_lower = text.toLowerCase();
    if (text_lower.includes('happy') || text_lower.includes('joyful') || text_lower.includes('upbeat')) {
      return 'happy';
    } else if (text_lower.includes('sad') || text_lower.includes('melancholic') || text_lower.includes('blue')) {
      return 'melancholic';
    } else {
      return 'energetic';
    }
  };

  const generateChords = async (idea: string, baseChords: Chord[], type: string) => {
    try {
    console.debug(`generateChords idea ${idea}`)
    console.debug(`generateChords baseChords`, baseChords)
    console.debug(`generateChords type ${type}`)

    // const mood = getMoodFromText(idea);

    // const progressions:string[][] = chordProgressions?.[idea]?.[type] || chordProgressions.happy[type] || chordProgressions.happy.chorus;
    // console.debug(`progressions `, progressions);

    const a = await generateChordsAiResponse({ 
      mood: idea,
      chords: baseChords,
      tempo,
      genre: songStyle
    })
    console.debug(`airesponse `, a);

    const chordNames = a!.song_structure_analysis.sections[0].chords
    
    // If we have valid initial chords, try to match the key
    // const selectedProgression = progressions[Math.floor(Math.random() * progressions.length)];
    // console.debug(`selectedProgression, `, selectedProgression)
    // // REFACTOR TO USE AI
    // if (parsedChords.size > 0 && !parsedChords.values().next().value?.empty) {
    //   // const initialKey = parsedChords.values().next().value.tonic;
    //   // TODO: Implement key transposition of the progression
    //   return selectedProgression.join(' - ');
    // }

    // return selectedProgression.join(' - ');
    return chordNames.join(' - ')
    } catch (error: any) {
      toast({ description: "Error generating chords." })
      console.debug(`Error generating chords `, error)
      throw new Error(`Error generating chords.`)
    }
  };

  const handleGenerate = async () => {
    try {

      const newSection: Section = {
        type: 'verse',
        chords: await generateChords(songIdea, Array.from(parsedChords.values()), 'verse'),
        expanded: true
      };
      console.debug(`new section `, newSection);
      addSection(newSection)
    }
    catch (error){
      console.error(`handleGenerate error: `, error)
    }
  };

  const addSection = ({ type= 'verse', chords= '', expanded = false }) => {
    setSections([...sections, { type, chords, expanded }]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const updateSectionType = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index].type = value;
    setSections(newSections);
  };

  const toggleExpanded = (index: number) => {
    const newSections = [...sections];
    newSections[index].expanded = !newSections[index].expanded;
    setSections(newSections);
  };

  // Render chord details
  const ChordDetails = ({ chord, removeChord, className }: { chord: Chord, removeChord?: () => void, className?: any }) => {
    if (!chord || chord.empty) return null;
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='w-full flex grow justify-between items-center'>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => playChord(chord, 1)}
              disabled={!isLoaded}
              className='text-2xl font-semibold leading-none tracking-tight rounded-lg transition-none'
              >
              {chord.symbol}
              <Volume2 className="w-5 h-5" />
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

  // Auto-save functionality
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveToDB = useCallback(
    debounce(async (data: any) => {
      if (!db) return;
      
      setIsSaving(true);
      const transaction = db.transaction(['songs'], 'readwrite');
      const store = transaction.objectStore('songs');
      
      const songData = {
        id: currentSongId || Date.now(),
        ...data
      };
      
      try {
        await store.put(songData);
        setCurrentSongId(songData.id);
      } catch (error) {
        console.error('Error saving to IndexedDB:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [db, currentSongId]
  );

  

  // Bar arrangement component
  const BarArrangement = ({ sectionId }: any) => {
    const [chords, setChords] = useState<ChordDraggableType[]>(sections[sectionId].chords.split(' - ').map((chord, index) => ({ id: `palette-${chord}-${index}`, symbol: chord, position: 0 })));
    
    const onDragEnd = (result: any) => {

      const { destination, source, draggableId } = result;

      if (!destination) {
        return; // No drop destination
      }      

      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return; // No change in position
      }

      const newChords = Array.from<ChordDraggableType>(chords);
      
      if (source.droppableId === 'chord-palette') {
        // Copy chord from palette
        const chord = generatedSong![sectionId].chords.split(' - ')[source.index];
        const position = Math.round((destination.index / GRID_SIZE) * GRID_SIZE) / GRID_SIZE;
        
        newChords.push({
          id: `${chord}-${Date.now()}`,
          symbol: chord,
          position
        });
      } else {
        // Move existing chord
        const [removed] = newChords.splice(source.index, 1);
        const position = Math.round((destination.index / GRID_SIZE) * GRID_SIZE) / GRID_SIZE;
        removed.position = position;
        newChords.splice(destination.index, 0, removed);
      }
      
      setChords(newChords.sort((a, b) => a.position - b.position));
      saveToDB({ sectionId, chords: newChords });
    };

    return (
      <div>
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Chord Palette */}
          <Droppable droppableId="chord-palette" direction="horizontal">
            {(provided: { innerRef: React.LegacyRef<HTMLDivElement> | undefined; droppableProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; placeholder: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex gap-2 p-2 border-secondary border rounded mb-4"
              >
                {sections[sectionId].chords.split(' - ').map((chord, index) => (
                  <Draggable
                    key={`palette-${chord}-${index}`}
                    draggableId={`palette-${chord}-${index}`}
                    index={index}
                  >
                    {(provided: { innerRef: React.LegacyRef<HTMLDivElement> | undefined; draggableProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; dragHandleProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; }) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-2 bg-secondary/50 hover:bg-secondary rounded shadow"
                      >
                        {chord}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Bar Grid */}
          <Droppable droppableId="bar-grid" direction="horizontal">
            {(provided: { innerRef: React.LegacyRef<HTMLDivElement> | undefined; droppableProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; placeholder: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="relative h-32 border border-secondary rounded"
              >
                {/* Grid lines */}
                {Array.from({ length: GRID_SIZE }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-secondary"
                    style={{ left: `${(i / GRID_SIZE) * 100}%` }}
                  />
                ))}
                
                {/* Placed chords */}
                {chords.map((chord, index) => (
                  <Draggable
                    key={chord.id}
                    draggableId={chord.id}
                    index={index}
                  >
                    {(provided: { innerRef: React.LegacyRef<HTMLDivElement> | undefined; draggableProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; dragHandleProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; }) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="absolute top-2 p-2 bg-blue-600 rounded shadow"
                        style={{
                          left: `${chord.position * 100}%`,
                          ...provided.draggableProps.style
                        }}
                      >
                        {chord.symbol}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newChords = chords.filter(c => c.id !== chord.id);
                            setChords(newChords);
                            saveToDB({ sectionId, chords: newChords });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  };

  // Generate complete song structure
  const generateCompleteStructure = async () => {
    
    const airesponse = await generateSongAiResponse({ 
      mood: songIdea,
      chords: Array.from(parsedChords),
      tempo,
      genre: songStyle
    })

    console.debug(`airesponse `, airesponse);

    const newSections = airesponse!.song_structure_analysis.sections.map(section => ({
      type: section.name,
      chords: section.chords.join(' - '),
      expanded: false,
    }))

    console.debug(`newSections `, newSections)
    // Generate sections based on style structure
    // const newSections = style.structure.map(async (type) => ({
    //   type,
    //   chords: await generateChords(songIdea, parsedChords, type),
    //   expanded: false
    // }));
    
    setSections((prev) => ([...prev, ...newSections]));
    setGeneratedSong(newSections)
  };

  const textarea = document.getElementById("idea-input");
  // Add an event listener to the textarea for the 'keydown' event
  textarea?.addEventListener("keydown", function(event) {
    // Check if the pressed key is 'Enter' (key code 13)
    if (event.key === "Enter") {
      event.preventDefault();  // Prevents the default 'Enter' behavior (new line in the textarea)
      textarea.blur();  // Removes focus from the textarea (blurs it)
    }
  });

  return (
    <>
    <div className="before:animate-hover relative gap-6 flex-col z-[-1] flex place-items-center before:fixed before:h-1/2 before:w-full before:translate-x-1/2 before:translate-y-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:content-[''] after:absolute after:-z-20 after:h-1/2 after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-orange-200 after:via-orange-200 before:blur-xl after:blur-xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-orange-700 before:dark:opacity-20 after:dark:from-orange-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[440px] sm:after:w-[240px] before:lg:h-1/2"></div>
    <div className="before:animate-hover relative gap-6 flex-col z-[-1] flex place-items-center before:fixed before:h-1/2 before:w-full before:translate-x-1/2 before:translate-y-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:content-[''] after:absolute after:-z-20 after:h-1/2 after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-orange-200 after:via-orange-200 before:blur-xl after:blur-xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-orange-700 before:dark:opacity-20 after:dark:from-orange-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[440px] sm:after:w-[240px] before:lg:h-1/2"></div>
    <div className="mx-auto p-4 space-y-4 md:flex gap-10 justify-end grid">
      
      <div className="grid grid-cols-3 md:grid-cols-2 overflow-y-scoll row-start-2 xl:row-start-3">
        {(chordList as unknown as Chord[]).map((chord, index) => {
          chord.rootDegree = chord.rootDegree || 3;
          return <ChordDetails className="rounded-none" chord={chord} />
          }
        )}
      </div>

      <Card className="max-w-xl row-start-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="w-6 h-6" />
              <div className="flex flex-col">
                <h1>
                  {App.name}
                </h1>
                <h2 className='!text-sm text-muted-foreground font-medium tracking-wide'>
                  {App.description}
                  </h2>
              </div>
            </div>
            {isSaving && (
              <div className="flex items-center text-sm text-gray-500">
                <Save className="w-4 h-4 mr-1 animate-spin" />
                Saving...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Song Idea Input */}
          <div className="space-y-2 relative min-h-20">
            {/* <label className="text-sm font-medium">Song Idea</label> */}
            <Textarea 
              id="idea-input"
              placeholder="Describe your song idea, mood, or theme..."
              value={songIdea}
              onChange={(e) => setSongIdea(e.target.value)}
              className="font-medium placeholder:text-foreground cursor-pointer focus:cursor-text z-10 bg-gradient-to-bl from-orange-950 focus:from-orange-600 focus:scale-125 transition-all relative focus:absolute"
              // className="border-4 border-transparent outline-none focus:outline-none focus:border-transparent bg-white animate-gradient-outline resize-none"
            />
          </div>

          {/* Style selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Song Style</label>
            <Select value={songStyle} onValueChange={setSongStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(songStyles).map(style => (
                  <SelectItem key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tempo control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tempo: {tempo} BPM</label>
            <Slider
              value={[tempo]}
              min={60}
              max={200}
              step={1}
              onValueChange={([value]) => setTempo(value)}
              className='cursor-pointer'
            />
          </div>

          <div className="space-y-2">
            <div className="flex gap-4 justify-around">
                {/* <label className="text-sm font-medium">Initial Chords (optional)</label> */}
                {/* <Input 
                  placeholder="e.g., D Cmaj7 Am7 Fmaj7 G7"
                  value={initialChords}
                  onChange={(e) => setInitialChords(e.target.value)}
                  /> */} 

              <NoteSelector setSelectedChord={(chord: Chord) => setParsedChords((prev) => {
                    const chordMap = new Map();

                    // Add all chords from the previous Set to the Map
                    Array.from(prev).concat(chord).filter(chord => !chord.empty).forEach(chord => chordMap.set(chord.symbol, chord));
                  
                    // Create a new Set from the unique values in the Map
                    const newSet = new Set(chordMap.values());
                  
                    console.debug(`setParsedChords newSet `, newSet);
                  
                    return newSet;
                  }
                )} />

              <ChordSelector setSelectedChord={(chord: Chord) => setParsedChords((prev) => {
                    const chordMap = new Map();

                    // Add all chords from the previous Set to the Map
                    Array.from(prev).concat(chord).filter(chord => !chord.empty).forEach(chord => chordMap.set(chord.symbol, chord));
                  
                    // Create a new Set from the unique values in the Map
                    const newSet = new Set(chordMap.values());
                  
                    console.debug(`setParsedChords newSet `, newSet);
                  
                    return newSet;
                }
              )} />
            </div>

            {parsedChords.size > 0 && (
              <div className="mt-2 py-4 rounded-md">
                <div className='flex items-center gap-x-6'>
                <p className="font-medium">Chord Analysis:</p>
                <Button onClick={() => addSection({ chords: Array.from(parsedChords.values().map(chord => chord.symbol)).join(" - ")})} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Section
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {Array.from(parsedChords).map((chord, i) => {
                    console.debug(`parsedChords map `, chord)
                    return (
                        <ChordDetails key={i} chord={chord} removeChord={() => removeParsedChord(i)} />
                    )}
                  )}
                  
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleGenerate} 
              className="flex-1"
              disabled={!songIdea || isLoading}
            >
              {isLoading ? `Loading...` : `Generate Section`}
            </Button>
            <Button
              onClick={generateCompleteStructure}
              className="flex-1"
              disabled={!songIdea || isLoading}
            >
              {isLoading ? `...your next hit` : `Generate Complete Song`}
            </Button>
          </div>
        </CardContent>
      </Card>

       {/* Section builder with bar arrangements */}
      <div className="space-y-4 max-w-xl w-full row-start-2 sm:row-start-1">
        <div className="flex items-center gap-x-6">
          <h3 className="text-lg pl-5 font-medium">Song Sections</h3>
          <Button onClick={addSection} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
        {sections.map((section, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-4">
              <Select 
                value={section.type}
                defaultValue={section.type}
                onValueChange={(value) => updateSectionType(index, value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verse">Verse</SelectItem>
                  <SelectItem value="chorus">Chorus</SelectItem>
                  <SelectItem value="bridge">Bridge</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>

              {/* {generatedSong && ( */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    if (!audioInitialized) {
                      await handleFirstPlay();
                    }
                    return isPlaying ? stopPlaying() : playProgression(sections[index].chords)
                  }}
                  disabled={!isLoaded || !section.chords}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isPlaying ? 'Stop' : 'Play'}
                </Button>
              {/* )} */}
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleExpanded(index)}
                disabled={!isLoaded || !section.chords}
              >
                {section.expanded ? 'Hide' : 'Show'} Details
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => removeSection(index)}
                className="ml-auto"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            {section.expanded && section.chords.length > 0 && (
              <>
                {/* <div className="mt-4">
                  <p className="font-medium">Bar Arrangement:</p>
                  <BarArrangement sectionId={index} />
                </di  v> */}

                <div className="mt-4 grid grid-cols-2 gap-4">
                  {section.chords.split(' - ').map((chord, i) => {
                    const analysis = {...ChordLib.get(chord)};
                    analysis.rootDegree = analysis.rootDegree || 3;
                    console.debug(`chord analysis `, analysis)
                    return (
                      <div 
                        key={i} 
                        className={`p-2 rounded ${
                          isPlaying && i === currentChordIndex ? 'bg-secondary' : ''
                        }`}
                      >
                        <ChordDetails chord={analysis} />
                      </div>
                    );
                  })}
                </div>
              
                {/* <div className="mt-4 p-4 rounded-md">
                <p className="font-medium">Generated Progression:</p>
                <p className="mt-2 font-mono">{generatedSong[index].chords}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {generatedSong[index].chords.split(' - ').map((chord, i) => {
                    const analysis = {...ChordLib.get(chord)};
                    analysis.rootDegree = analysis.rootDegree || 3;
                    console.debug(`chord analysis `, analysis)
                    return (
                      <ChordDetails chord={analysis} />
                    );
                  })}
                </div>
              </div> */}

              </>
            )}
          </Card>
        ))}
      </div>
    </div>
    </>
  );
};

export default SongWriter;