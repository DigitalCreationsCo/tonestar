"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Music, Plus, Trash2, Play, Pause, Save } from 'lucide-react';
import * as ChordLib from '@tonaljs/chord';
import type { Chord } from '@tonaljs/chord';
import * as Tone from 'tone';
import debounce from 'lodash/debounce';
import { App } from '@/lib/App';
import { LLMQuery, TonestarAiRequest } from '@/lib/llmClient';
import { getEnv } from "@/components/auth/actions";
import { toast } from '@/hooks/use-toast';
import { chordList } from '@/lib/chord';
import { DBClient } from '@/lib/client';
import { SelectChordByNotes } from '@/components/chord/select-chord-by-notes';
import { SelectChord } from '@/components/chord/select-chord';
import { ChordDetails } from '@/components/chord/chord-details';
import { Section } from '@/lib/types';
// import { BarArrangement } from '@/components/chord/bar-arrangement';
import { useAudioEngine } from '@/hooks/use-audio-engine';

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



const SongWriter = () => {
  const [songIdea, setSongIdea] = useState('');
  const [initialChords, setInitialChords] = useState('');
  const [parsedChords, setParsedChords] = useState<Set<Chord>>(new Set());
  const [sections, setSections] = useState<Section[]>([]);
  const [llm, setLlm] = useState<LLMQuery | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [tempo, setTempo] = useState(DEFAULT_TEMPO);
  const [songStyle, setSongStyle] = useState('pop');
  const [isSaving, setIsSaving] = useState(false);
  const [db, setDB] = useState<DBClient | null>(null);
  const [currentSongId, setCurrentSongId] = useState('');
  const [generatedSong, setGeneratedSong] = useState<{
    type: string;
    chords: string;
    expanded: boolean;
}[] | null>(null);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const { playChord, stopAllNotes, isLoaded, startAudioContext, isPlaying, setIsPlaying } = useAudioEngine(); 

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
      } catch (error:any) {
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
      } catch (error: any) {
        setIsLoading(false);
        console.error("generate song error:", error);
        toast({ description: "Error generating song." })
        throw new Error("Error generating song:", error.message)
      }
    }
  };

  // Initialize IndexedDB
  useEffect(() => {
    async function initDB() {
      const db = await DBClient.getInstance()
      setDB(db)
    }
    initDB()
  }, []);

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

  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  const generateChords = async (idea: string, baseChords: Chord[], type: string) => {
    try {
    console.debug(`generateChords idea ${idea}`)
    console.debug(`generateChords baseChords`, baseChords)
    console.debug(`generateChords type ${type}`)

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



  // Auto-save functionality
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveToDB = useCallback(
    debounce(async (data: any) => {
      if (!db) return;
      
      setIsSaving(true);
      const songData = {
        id: currentSongId || Date.now(),
        ...data
      };
      
      try {
        const id = await db.write("SONGS_STORE", songData);
        setCurrentSongId(id);
      } catch (error: any) {
        setIsSaving(false);
        console.error(error);
        toast({ description: error.message })
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    [db, currentSongId]
  );

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
    <div className="before:animate-hover after:animate-hover relative gap-6 flex-col z-[-1] flex place-items-center before:fixed before:h-1/2 before:w-full before:translate-x-1/2 before:translate-y-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:content-[''] after:absolute after:-z-20 after:h-1/2 after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-orange-200 after:via-orange-200 before:blur-xl after:blur-xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-orange-700 before:dark:opacity-20 after:dark:from-orange-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[440px] sm:after:w-[240px] before:lg:h-1/2"></div>
    <div className="mx-auto p-4 space-y-4 gap-10 justify-end border-2 grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1">
      
      <div className="pt-4 grid grid-cols-3 lg:grid-cols-2 overflow-y-scoll row-start-3 xl:row-start-1">
        {(chordList as unknown as Chord[]).map((chord, index) => {
          chord.rootDegree = chord.rootDegree || 3;
          return <ChordDetails key={index} chord={chord} />
          }
        )}
      </div>

      <Card className="max-w-2xl h-fit row-start-1 place-self-center lg:place-self-auto">
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
              <SelectChordByNotes setSelectedChord={(chord: Chord) => setParsedChords((prev) => {
                    const chordMap = new Map();

                    // Add all chords from the previous Set to the Map
                    Array.from(prev).concat(chord).filter(chord => !chord.empty).forEach(chord => chordMap.set(chord.symbol, chord));
                  
                    // Create a new Set from the unique values in the Map
                    const newSet = new Set(chordMap.values());
                  
                    console.debug(`setParsedChords newSet `, newSet);
                  
                    return newSet;
                  }
                )} />

              <SelectChord setSelectedChord={(chord: Chord) => setParsedChords((prev) => {
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
                <Button onClick={() => addSection({ chords: Array.from(parsedChords.values()).map(chord => chord.symbol).join(" - ")})} variant="outline" size="sm">
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
      <div className="space-y-4 max-w-md lg:max-w-xl w-full row-start-2 lg:row-start-1 place-self-center lg:place-self-auto">
        <div className="flex items-center gap-x-6 place-self-end lg:place-self-auto">
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