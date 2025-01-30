import * as Tone from "tone";

export default class Player {
    player: Tone.PolySynth;
    constructor() {
        this.player = new Tone.PolySynth({ voice: Tone.Synth, maxPolyphony: 8 }).toDestination();
        this.player.set({ oscillator: { type: 'sine' }})
    }

    startPlayer() {
        if (Tone.getContext().state !== "running") {
            Tone.start();
        }
    }

    startPlayerListner() {
        if (Tone.getContext().state !== "running") {
            Tone.start();
        }
    }

    playNote({ note, duration =1, velocity = 0.7, time= Tone.now() }: { note: string, duration?: number; velocity: number; time: number; }){
        this.player.triggerAttackRelease(note, duration, time, velocity);
    }

    dispose() {
        this.player.dispose();
    }
}