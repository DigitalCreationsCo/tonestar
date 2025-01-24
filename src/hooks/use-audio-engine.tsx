"use client"
import * as Tone from "tone";
import { useState, useEffect } from 'react';
import type { Chord } from '@tonaljs/chord';
import { toast } from '@/hooks/use-toast';
import { DBClient } from '@/lib/client';
import Player from '@/lib/synth'

const SAMPLES_KEY = 'piano-samples';
const CACHE_VERSION = '1.0.0';

interface AudioEngineState {
  status: 'loading' | 'ready' | 'failed';
  loadingProgress: number;
  hasPermission: boolean;
}

export const useAudioEngine = () => {
    const [player, setPlayer] = useState<Player | null>(null);
    const [state, setState] = useState<AudioEngineState>({
      status: 'loading',
      loadingProgress: 0,
      hasPermission: false,
    });
    const [isPlaying, setIsPlaying] = useState(false);

    const init = async () => {
      console.log("Initializing audio engine...");
      const hasPermission = await requestAudioPermission();
      if (!hasPermission) {
        console.warn("Audio permission denied, initialization aborted.");
        return;
      }
      console.log("Audio permission granted, proceeding with player initialization...");
      await initializePlayer();
    };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      console.log("useEffect: Running init...");
      init();

      return () => {
        if (player) {
          console.log("Disposing of player...");
          player.dispose();
          setPlayer(null)
        }
      };
    }, []);

    // Request audio permission and initialize context
    const listenAudioPermission = async () => {
      try {
        console.log("Listening for audio permission...");

        Array.from(document.getElementsByClassName("load-app-btn")).forEach((el) => 
          el.addEventListener("click", () => {
            console.log("Load button clicked, starting player listener...");
            player?.startPlayerListner();
          })
        );
        
        setState(prev => ({ ...prev, hasPermission: true }));
        console.log("Audio permission granted.");
        return true;
      } catch (error) {
        console.error('Audio permission error:', error);
        toast({ 
          title: "Audio Permission Required",
          description: "Please allow audio playback to use the application."
        });
        return false;
      }
    };
  
    // Request audio permission and initialize context
    const requestAudioPermission = async () => {
      try {
        console.log("Requesting audio permission...");
        if (Tone.getContext().state !== "running") {
          await Tone.start();
          console.log("Starting Tone.js context...");
        }
        setState(prev => ({ ...prev, hasPermission: true, status: 'loading' }));
        console.log("Audio permission granted.");
        return true;
      } catch (error) {
        console.error('Audio permission denied:', error);
        toast({ 
          title: "Audio Permission Required",
          description: "Please allow audio playback to use the application."
        });
        return false;
      }
    };

    // Initialize piano with loading progress
    const initializePlayer = async () => {
      try {
        console.log("Initializing piano player...");
        const player = new Player();
        setPlayer(player);
        setState(prev => ({ 
          ...prev, 
          status: 'ready',
          loadingProgress: 100,
        }));
        console.log("Piano player initialized successfully.");
      } catch (error: any) {
        console.error('Piano initialization failed:', error);
        setState(prev => ({ ...prev, status: 'failed' }));
        toast({ 
          title: "Loading Failed",
          description: error.message
        });
      }
    };
    
   
    
    const playChord = async (chord: Chord, duration = 1) => {
      console.log(`playChord: Playing chord ${chord.name} with duration ${duration}s`);
      if (!player || state.status !== 'ready') {
        console.warn("Audio engine not ready, reinitializing...");
        init();
        toast({ description: "Audio engine not ready" });
        return;
      }
  
      const durationSeconds = (60 / Tone.Transport.bpm.value) * duration;
      const now = Tone.now();
      
      setIsPlaying(true);
      console.log(`Playing chord ${chord.name} at time ${now}`);
      
      function getNoteWithOctaveDegree (note:string, index:number, chord:Chord) {
        let currDegree = chord.rootDegree;
        if (Number(chord["intervals"][index].match(/^\d+/)) >= 8){
          currDegree++;
        }
        return `${note}${currDegree}`;
      }
      chord.notes.forEach((note, index) => {
        const noteWithOctaveDegree = getNoteWithOctaveDegree(note, index, chord);
        console.log(`Playing note: ${noteWithOctaveDegree} at ${now + (index * 0.01)}s`);
        player.playNote({ 
          note: noteWithOctaveDegree, 
          velocity: 0.7, 
          time: now + (index * 0.01),
          duration: durationSeconds 
        });
      });
  
      // Reset playing state after chord duration
      setTimeout(() => {
        setIsPlaying(false);
        console.log(`Chord ${chord.name} playback finished.`);
      }, durationSeconds * 1000);
    };
    
    const stopAllNotes = () => {
      if (!player) {
        console.warn("stopAllNotes: Player not initialized.");
        return;
      }
      console.log("Stopping all notes...");
      setIsPlaying(false);
    };
  
    return {
      listenAudioPermission, 
      requestAudioPermission,
      playChord, 
      stopAllNotes, 
      audioEngineStatus: state.status, // Consolidated state
      loadingProgress: state.loadingProgress,
      hasPermission: state.hasPermission,
      isPlaying, 
      setIsPlaying,
    };
};
