"use client"
import { useState, useEffect } from 'react';
import type { Chord } from '@tonaljs/chord';
import * as Tone from 'tone';
import { toast } from '@/hooks/use-toast';
import { Piano } from '@tonejs/piano';
import { DBClient } from '@/lib/client';

export const useAudioEngine = () => {
    const [piano, setPiano] = useState<Piano | null>(null);
    const [audioContextStarted, setAudioContextStarted] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
  
    useEffect(() => {
      let mounted = true;
  
      // Piano initialization
      const setupPiano = async () => {
        try {
          const db = await DBClient.getInstance()
          console.debug('Database instance initialized:', db);
  
          let samples = await db.readById('SAMPLES_STORE', {id: 'samples'})
          console.debug(`cached piano from db `, samples)
          let piano
          if (!samples) {
            console.debug(`no samples `, samples)
            // const response = await fetch(`api/samples`, { headers: { 'content-type': 'application/json' }});
            // if (!response.ok) {
            //   throw new Error(await response.text())
            // }
            // const samples = await (await response.json())['files']
            piano = new Piano({ url: '/samples' , velocities: 1, release: true })
  
            // await db.write<Piano>('SAMPLES_STORE', {...piano, id: 'piano'} as Piano & {id:string})
            // await db.write('SAMPLES_STORE', {
            //   samples,
            //   id: 'samples'}
            // )
            console.debug(`cached piano samples`)
          }
          else { 
            console.debug(`yes samples `, samples)
            piano = new Piano({ velocities: 1, release: true })
          }
          piano.toDestination();
          await piano.load()
          console.debug(`init piano OK`);
      
          // Check if the component is mounted before updating state
          if (mounted) {
            console.debug("Piano loaded successfully, setting state...");
            setPiano(piano);
            setIsLoaded(true);
          }
        } catch (error: any) {
          console.error('Failed to initialize piano:', error);
          toast({ description: error.message })
        }
      };
      
      setupPiano();
  
      return () => {
        mounted = false;
        if (piano) {
          piano.dispose();
        }
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
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
          const noteWithOctaveDegree = `${note}${chord.rootDegree}`; // add the scalign octave function for accurate chord intervals
          console.debug(`note with octave degree ${noteWithOctaveDegree}`)
  
          console.debug(`play note `, note);
          piano.keyDown({ note: noteWithOctaveDegree, velocity: 0.7 });
          setIsPlaying(true);
          piano.keyUp({ note: noteWithOctaveDegree, time: now + durationSeconds });
        });
      };
    
      const stopAllNotes = () => {
        setIsPlaying(false)
        if (!piano) return;
        // piano.releaseAll();
      };
  
    return { playChord, stopAllNotes, isLoaded, startAudioContext, isPlaying, setIsPlaying };
  };