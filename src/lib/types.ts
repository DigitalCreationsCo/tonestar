import { Chord } from "@tonaljs/chord";

type Section = {
    type: string;
    chords: string;
    expanded: boolean;
}

type ChordDraggableType = {
    id: string;
    symbol: string;
    position: number;
}

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

export type {
    Section,
    ChordMatchType,
    ChordDraggableType
}