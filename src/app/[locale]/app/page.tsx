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
import { chordList, songStyles } from '@/lib/music';
import { DBClient } from '@/lib/client';
import { SelectChordByNotes } from '@/components/chord/select-chord-by-notes';
import { SelectChord } from '@/components/chord/select-chord';
import { ChordDetails } from '@/components/chord/chord-details';
import { Section } from '@/lib/types';
// import { BarArrangement } from '@/components/chord/bar-arrangement';
import { useAudioEngine } from '@/hooks/use-audio-engine';

const DEFAULT_TEMPO = 120;

const SongWriter = () => {
  const [userSongIdea, setUserSongIdea] = useState('');
  const [selectedChords, setSelectedChords] = useState<Set<Chord>>(new Set());
  const [tempo, setTempo] = useState(DEFAULT_TEMPO);
  const [songStyle, setSongStyle] = useState('pop');
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSongId, setCurrentSongId] = useState('');
  const [song, setSong] = useState<Section[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [db, setDB] = useState<DBClient | null>(null);
  const [llm, setLlm] = useState<LLMQuery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGenerate, setIsLoadingGenerate] = useState(false);
  
  const { playChord, stopAllNotes, audioEngineStatus, isPlaying, requestAudioPermission, setIsPlaying } = useAudioEngine(); 

  useEffect(() => {
    let isMounted = true;
    async function initDB() {
      console.info("Initializing DB client...")
      if (!db) {
        const instance = await DBClient.getInstance();
        if (isMounted) setDB(instance);
        console.info("DB client initialized successfully.")
      }
    }
    initDB();
    return () => { isMounted = false };
  }, [db]);

  useEffect(() => {
    initializeLlmQuery();
  }, []);

  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);


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
  

  const removeChord = useCallback((index: number) => {
    setSelectedChords((prev) => {
      const chordList = Array.from(prev);
      chordList.splice(index, 1);
      return new Set(chordList);
    });
  }, []);

  const handleFirstPlay = useCallback(async () => {
    if (audioEngineStatus !== 'ready' ) {
      const started = await requestAudioPermission();
      if (started) {
        console.debug("Audio permission granted");
      } else {
        console.error("Audio permission denied");
      }
    }
  }, [audioEngineStatus, requestAudioPermission]);
  
  const playSection = async (chords: string) => {
    if (audioEngineStatus === 'loading' || isPlaying) return;
    
    console.debug(`playing chords`)
    console.debug(`chords: `, chords)
    console.debug(`is ready ${audioEngineStatus === 'ready' }`)
    console.debug(`isPlaying ${isPlaying}`)

    // Ensure audio is initialized before playing
    if (audioEngineStatus !== 'ready' ) {
      const started = await requestAudioPermission();
      console.info('started ', started);
      if (!started) return;
    }
    
    const chordList = chords.split(' - ');
    console.debug(`chord list ${chordList}`)
    
    setIsPlaying(true);
    setCurrentChordIndex(0);
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

  const initializeLlmQuery = async () => {
    try {
      console.info('Initializing LLMQuery client...')
      const llmInstance = await LLMQuery.getInstance(getEnv);
      if (llmInstance) {
        setLlm(llmInstance); // Store the instance in state
        console.info('LLMQuery client initialized successfully.')
      }
    } catch (error) {
      console.error("Error initializing LLMQuery:", error);
    }
  };

  const generateChordsAiResponse = async (query: TonestarAiRequest) => {
    if (!llm) return;
  
    try {
      setIsLoadingGenerate(true);
      console.debug(`AI query: `, query);
      const response = await llm.sendRequest(query);
      return response;
    } catch (error: any) {
      toast({ description: "Error generating chords." });
      console.error("Error querying LLM:", error);
    } finally {
      setIsLoadingGenerate(false);
    }
  };
  
  const generateSongAiResponse = async (query: TonestarAiRequest) => {
    if (llm) {
      try {
        setIsLoadingGenerate(true);
        console.debug(`ai query: `, query);
        const response = await llm.sendRequest(query);
        setIsLoadingGenerate(false);
        return response;
      } catch (error: any) {
        setIsLoadingGenerate(false);
        console.error("generate song error:", error);
        toast({ description: "Error generating song." })
        throw new Error("Error generating song:", error.message)
      }
    }
  };

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
    console.debug(`ai response `, a);
    const chordNames = a!.song_structure_analysis.sections[0].chords
    return chordNames.join(' - ')
    } catch (error: any) {
      toast({ description: "Error generating chords." })
      console.debug(`Error generating chords `, error)
      throw new Error(`Error generating chords.`)
    }
  };

  const handleGenerateSection = async () => {
    try {
      const newSection: Section = {
        type: 'verse',
        chords: await generateChords(userSongIdea, Array.from(selectedChords.values()), 'verse'),
        expanded: true
      };
      addSection(newSection)
    }
    catch (error){
      console.error(`handleGenerateSection error: `, error)
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



  // Generate complete song structure
  const generateCompleteSong = async () => {
    const airesponse = await generateSongAiResponse({ 
      mood: userSongIdea,
      chords: Array.from(selectedChords),
      tempo,
      genre: songStyle
    })
    console.debug(`ai response `, airesponse);
    const newSections = airesponse!.song_structure_analysis.sections.map(section => ({
      type: section.name,
      chords: section.chords.join(' - '),
      expanded: false,
    }))
    console.debug(`newSections `, newSections)
    setSections((prev) => ([...prev, ...newSections]));
    setSong(newSections)
  };

  const textarea = typeof document !== 'undefined' ? document.getElementById("idea-input") : null;
  textarea?.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault(); 
      textarea.blur(); 
    }
  });

  useEffect(() => {
    if (db && llm) setIsLoading(false);
  }, [
    audioEngineStatus,
    db,
    llm
  ])

  if (isLoading) {
    return (
      <div className='flex grow h-full items-center justify-center'>
        <div className='flex animate-bounce items-center'>
          <Music className='pr-2 w-10 h-10' />Loading
        </div>
      </div>
    );
  }
  
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
              value={userSongIdea}
              onChange={(e) => setUserSongIdea(e.target.value)}
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
              <SelectChordByNotes setSelectedChord={(chord: Chord) => setSelectedChords((prev) => {
                    const chordMap = new Map();
                    // Add all chords from the previous Set to the Map
                    Array.from(prev).concat(chord).filter(chord => !chord.empty).forEach(chord => chordMap.set(chord.symbol, chord));
                    // Create a new Set from the unique values in the Map
                    const newSet = new Set(chordMap.values());
                    console.debug(`setParsedChords newSet `, newSet);
                    return newSet;
                  }
                )} />

              <SelectChord setSelectedChord={(chord: Chord) => setSelectedChords((prev) => {
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

            {selectedChords.size > 0 && (
              <div className="mt-2 py-4 rounded-md">
                <div className='flex items-center gap-x-6'>
                <p className="font-medium">Chord Analysis:</p>
                <Button onClick={() => addSection({ chords: Array.from(selectedChords.values()).map(chord => chord.symbol).join(" - ")})} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Section
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {Array.from(selectedChords).map((chord, i) => {
                    console.debug(`parsedChords map `, chord)
                    return (
                        <ChordDetails key={i} chord={chord} removeChord={() => removeChord(i)} />
                    )}
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleGenerateSection} 
              className="flex-1"
              disabled={!userSongIdea || isLoadingGenerate}
            >
              {isLoading ? `Loading...` : `Generate Section`}
            </Button>
            <Button
              onClick={generateCompleteSong}
              className="flex-1"
              disabled={!userSongIdea || isLoadingGenerate}
            >
              {isLoadingGenerate ? `...your next hit` : `Generate Song`}
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
                    if (audioEngineStatus !== 'ready') {
                      await handleFirstPlay();
                    }
                    return isPlaying ? stopPlaying() : playSection(sections[index].chords)
                  }}
                  disabled={audioEngineStatus !== 'ready' || !section.chords}
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
                disabled={!section.chords}
              >
                {section.expanded ? 'Hide Details' : 'Show Details'}
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