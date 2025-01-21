import * as ChordLib from '@tonaljs/chord';
import { ChordMatchType } from './types';

const chordList = [
    {
        "empty": false,
        "name": "A major",
        "setNum": 2192,
        "chroma": "100010010000",
        "normalized": "100001000100",
        "intervals": [
            "1P",
            "3M",
            "5P"
        ],
        "quality": "Major",
        "aliases": [
            "M",
            "^",
            "",
            "maj"
        ],
        "symbol": "A",
        "tonic": "A",
        "type": "major",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "A",
            "C#",
            "E"
        ]
    },
    {
        "empty": false,
        "name": "A major seventh",
        "setNum": 2193,
        "chroma": "100010010001",
        "normalized": "100010010001",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7M"
        ],
        "quality": "Major",
        "aliases": [
            "maj7",
            "Δ",
            "ma7",
            "M7",
            "Maj7",
            "^7"
        ],
        "symbol": "Amaj7",
        "tonic": "A",
        "type": "major seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "A",
            "C#",
            "E",
            "G#"
        ]
    },
    {
        "empty": false,
        "name": "A dominant seventh",
        "setNum": 2194,
        "chroma": "100010010010",
        "normalized": "100010010010",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7m"
        ],
        "quality": "Major",
        "aliases": [
            "7",
            "dom"
        ],
        "symbol": "A7",
        "tonic": "A",
        "type": "dominant seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "A",
            "C#",
            "E",
            "G"
        ]
    },
    {
        "empty": false,
        "name": "A sixth",
        "setNum": 2196,
        "chroma": "100010010100",
        "normalized": "100010010100",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "6M"
        ],
        "quality": "Major",
        "aliases": [
            "6",
            "add6",
            "add13",
            "M6"
        ],
        "symbol": "A6",
        "tonic": "A",
        "type": "sixth",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "A",
            "C#",
            "E",
            "F#"
        ]
    },
    {
        "empty": false,
        "name": "B major",
        "setNum": 2192,
        "chroma": "100010010000",
        "normalized": "100001000100",
        "intervals": [
            "1P",
            "3M",
            "5P"
        ],
        "quality": "Major",
        "aliases": [
            "M",
            "^",
            "",
            "maj"
        ],
        "symbol": "B",
        "tonic": "B",
        "type": "major",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "B",
            "D#",
            "F#"
        ]
    },
    {
        "empty": false,
        "name": "B major seventh",
        "setNum": 2193,
        "chroma": "100010010001",
        "normalized": "100010010001",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7M"
        ],
        "quality": "Major",
        "aliases": [
            "maj7",
            "Δ",
            "ma7",
            "M7",
            "Maj7",
            "^7"
        ],
        "symbol": "Bmaj7",
        "tonic": "B",
        "type": "major seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "B",
            "D#",
            "F#",
            "A#"
        ]
    },
    {
        "empty": false,
        "name": "B dominant seventh",
        "setNum": 2194,
        "chroma": "100010010010",
        "normalized": "100010010010",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7m"
        ],
        "quality": "Major",
        "aliases": [
            "7",
            "dom"
        ],
        "symbol": "B7",
        "tonic": "B",
        "type": "dominant seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "B",
            "D#",
            "F#",
            "A"
        ]
    },
    {
        "empty": false,
        "name": "B sixth",
        "setNum": 2196,
        "chroma": "100010010100",
        "normalized": "100010010100",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "6M"
        ],
        "quality": "Major",
        "aliases": [
            "6",
            "add6",
            "add13",
            "M6"
        ],
        "symbol": "B6",
        "tonic": "B",
        "type": "sixth",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "B",
            "D#",
            "F#",
            "G#"
        ]
    },
    {
        "empty": false,
        "name": "C major",
        "setNum": 2192,
        "chroma": "100010010000",
        "normalized": "100001000100",
        "intervals": [
            "1P",
            "3M",
            "5P"
        ],
        "quality": "Major",
        "aliases": [
            "M",
            "^",
            "",
            "maj"
        ],
        "symbol": "C",
        "tonic": "C",
        "type": "major",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "C",
            "E",
            "G"
        ]
    },
    {
        "empty": false,
        "name": "C major seventh",
        "setNum": 2193,
        "chroma": "100010010001",
        "normalized": "100010010001",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7M"
        ],
        "quality": "Major",
        "aliases": [
            "maj7",
            "Δ",
            "ma7",
            "M7",
            "Maj7",
            "^7"
        ],
        "symbol": "Cmaj7",
        "tonic": "C",
        "type": "major seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "C",
            "E",
            "G",
            "B"
        ]
    },
    {
        "empty": false,
        "name": "C dominant seventh",
        "setNum": 2194,
        "chroma": "100010010010",
        "normalized": "100010010010",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7m"
        ],
        "quality": "Major",
        "aliases": [
            "7",
            "dom"
        ],
        "symbol": "C7",
        "tonic": "C",
        "type": "dominant seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "C",
            "E",
            "G",
            "Bb"
        ]
    },
    {
        "empty": false,
        "name": "C sixth",
        "setNum": 2196,
        "chroma": "100010010100",
        "normalized": "100010010100",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "6M"
        ],
        "quality": "Major",
        "aliases": [
            "6",
            "add6",
            "add13",
            "M6"
        ],
        "symbol": "C6",
        "tonic": "C",
        "type": "sixth",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "C",
            "E",
            "G",
            "A"
        ]
    },
    {
        "empty": false,
        "name": "D major",
        "setNum": 2192,
        "chroma": "100010010000",
        "normalized": "100001000100",
        "intervals": [
            "1P",
            "3M",
            "5P"
        ],
        "quality": "Major",
        "aliases": [
            "M",
            "^",
            "",
            "maj"
        ],
        "symbol": "D",
        "tonic": "D",
        "type": "major",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "D",
            "F#",
            "A"
        ]
    },
    {
        "empty": false,
        "name": "D major seventh",
        "setNum": 2193,
        "chroma": "100010010001",
        "normalized": "100010010001",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7M"
        ],
        "quality": "Major",
        "aliases": [
            "maj7",
            "Δ",
            "ma7",
            "M7",
            "Maj7",
            "^7"
        ],
        "symbol": "Dmaj7",
        "tonic": "D",
        "type": "major seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "D",
            "F#",
            "A",
            "C#"
        ]
    },
    {
        "empty": false,
        "name": "D dominant seventh",
        "setNum": 2194,
        "chroma": "100010010010",
        "normalized": "100010010010",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7m"
        ],
        "quality": "Major",
        "aliases": [
            "7",
            "dom"
        ],
        "symbol": "D7",
        "tonic": "D",
        "type": "dominant seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "D",
            "F#",
            "A",
            "C"
        ]
    },
    {
        "empty": false,
        "name": "D sixth",
        "setNum": 2196,
        "chroma": "100010010100",
        "normalized": "100010010100",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "6M"
        ],
        "quality": "Major",
        "aliases": [
            "6",
            "add6",
            "add13",
            "M6"
        ],
        "symbol": "D6",
        "tonic": "D",
        "type": "sixth",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "D",
            "F#",
            "A",
            "B"
        ]
    },
    {
        "empty": false,
        "name": "E major",
        "setNum": 2192,
        "chroma": "100010010000",
        "normalized": "100001000100",
        "intervals": [
            "1P",
            "3M",
            "5P"
        ],
        "quality": "Major",
        "aliases": [
            "M",
            "^",
            "",
            "maj"
        ],
        "symbol": "E",
        "tonic": "E",
        "type": "major",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "E",
            "G#",
            "B"
        ]
    },
    {
        "empty": false,
        "name": "E major seventh",
        "setNum": 2193,
        "chroma": "100010010001",
        "normalized": "100010010001",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7M"
        ],
        "quality": "Major",
        "aliases": [
            "maj7",
            "Δ",
            "ma7",
            "M7",
            "Maj7",
            "^7"
        ],
        "symbol": "Emaj7",
        "tonic": "E",
        "type": "major seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "E",
            "G#",
            "B",
            "D#"
        ]
    },
    {
        "empty": false,
        "name": "E dominant seventh",
        "setNum": 2194,
        "chroma": "100010010010",
        "normalized": "100010010010",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7m"
        ],
        "quality": "Major",
        "aliases": [
            "7",
            "dom"
        ],
        "symbol": "E7",
        "tonic": "E",
        "type": "dominant seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "E",
            "G#",
            "B",
            "D"
        ]
    },
    {
        "empty": false,
        "name": "E sixth",
        "setNum": 2196,
        "chroma": "100010010100",
        "normalized": "100010010100",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "6M"
        ],
        "quality": "Major",
        "aliases": [
            "6",
            "add6",
            "add13",
            "M6"
        ],
        "symbol": "E6",
        "tonic": "E",
        "type": "sixth",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "E",
            "G#",
            "B",
            "C#"
        ]
    },
    {
        "empty": false,
        "name": "F major",
        "setNum": 2192,
        "chroma": "100010010000",
        "normalized": "100001000100",
        "intervals": [
            "1P",
            "3M",
            "5P"
        ],
        "quality": "Major",
        "aliases": [
            "M",
            "^",
            "",
            "maj"
        ],
        "symbol": "F",
        "tonic": "F",
        "type": "major",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "F",
            "A",
            "C"
        ]
    },
    {
        "empty": false,
        "name": "F major seventh",
        "setNum": 2193,
        "chroma": "100010010001",
        "normalized": "100010010001",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7M"
        ],
        "quality": "Major",
        "aliases": [
            "maj7",
            "Δ",
            "ma7",
            "M7",
            "Maj7",
            "^7"
        ],
        "symbol": "Fmaj7",
        "tonic": "F",
        "type": "major seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "F",
            "A",
            "C",
            "E"
        ]
    },
    {
        "empty": false,
        "name": "F dominant seventh",
        "setNum": 2194,
        "chroma": "100010010010",
        "normalized": "100010010010",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7m"
        ],
        "quality": "Major",
        "aliases": [
            "7",
            "dom"
        ],
        "symbol": "F7",
        "tonic": "F",
        "type": "dominant seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "F",
            "A",
            "C",
            "Eb"
        ]
    },
    {
        "empty": false,
        "name": "F sixth",
        "setNum": 2196,
        "chroma": "100010010100",
        "normalized": "100010010100",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "6M"
        ],
        "quality": "Major",
        "aliases": [
            "6",
            "add6",
            "add13",
            "M6"
        ],
        "symbol": "F6",
        "tonic": "F",
        "type": "sixth",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "F",
            "A",
            "C",
            "D"
        ]
    },
    {
        "empty": false,
        "name": "G major",
        "setNum": 2192,
        "chroma": "100010010000",
        "normalized": "100001000100",
        "intervals": [
            "1P",
            "3M",
            "5P"
        ],
        "quality": "Major",
        "aliases": [
            "M",
            "^",
            "",
            "maj"
        ],
        "symbol": "G",
        "tonic": "G",
        "type": "major",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "G",
            "B",
            "D"
        ]
    },
    {
        "empty": false,
        "name": "G major seventh",
        "setNum": 2193,
        "chroma": "100010010001",
        "normalized": "100010010001",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7M"
        ],
        "quality": "Major",
        "aliases": [
            "maj7",
            "Δ",
            "ma7",
            "M7",
            "Maj7",
            "^7"
        ],
        "symbol": "Gmaj7",
        "tonic": "G",
        "type": "major seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "G",
            "B",
            "D",
            "F#"
        ]
    },
    {
        "empty": false,
        "name": "G dominant seventh",
        "setNum": 2194,
        "chroma": "100010010010",
        "normalized": "100010010010",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7m"
        ],
        "quality": "Major",
        "aliases": [
            "7",
            "dom"
        ],
        "symbol": "G7",
        "tonic": "G",
        "type": "dominant seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "G",
            "B",
            "D",
            "F"
        ]
    },
    {
        "empty": false,
        "name": "G sixth",
        "setNum": 2196,
        "chroma": "100010010100",
        "normalized": "100010010100",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "6M"
        ],
        "quality": "Major",
        "aliases": [
            "6",
            "add6",
            "add13",
            "M6"
        ],
        "symbol": "G6",
        "tonic": "G",
        "type": "sixth",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "G",
            "B",
            "D",
            "E"
        ]
    },
    {
        "empty": false,
        "name": "A# major",
        "setNum": 2192,
        "chroma": "100010010000",
        "normalized": "100001000100",
        "intervals": [
            "1P",
            "3M",
            "5P"
        ],
        "quality": "Major",
        "aliases": [
            "M",
            "^",
            "",
            "maj"
        ],
        "symbol": "A#",
        "tonic": "A#",
        "type": "major",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "A#",
            "C##",
            "E#"
        ]
    },
    {
        "empty": false,
        "name": "A# major seventh",
        "setNum": 2193,
        "chroma": "100010010001",
        "normalized": "100010010001",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7M"
        ],
        "quality": "Major",
        "aliases": [
            "maj7",
            "Δ",
            "ma7",
            "M7",
            "Maj7",
            "^7"
        ],
        "symbol": "A#maj7",
        "tonic": "A#",
        "type": "major seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "A#",
            "C##",
            "E#",
            "G##"
        ]
    },
    {
        "empty": false,
        "name": "A# dominant seventh",
        "setNum": 2194,
        "chroma": "100010010010",
        "normalized": "100010010010",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7m"
        ],
        "quality": "Major",
        "aliases": [
            "7",
            "dom"
        ],
        "symbol": "A#7",
        "tonic": "A#",
        "type": "dominant seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "A#",
            "C##",
            "E#",
            "G#"
        ]
    },
    {
        "empty": false,
        "name": "A# sixth",
        "setNum": 2196,
        "chroma": "100010010100",
        "normalized": "100010010100",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "6M"
        ],
        "quality": "Major",
        "aliases": [
            "6",
            "add6",
            "add13",
            "M6"
        ],
        "symbol": "A#6",
        "tonic": "A#",
        "type": "sixth",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "A#",
            "C##",
            "E#",
            "F##"
        ]
    },
    {
        "empty": false,
        "name": "C# major",
        "setNum": 2192,
        "chroma": "100010010000",
        "normalized": "100001000100",
        "intervals": [
            "1P",
            "3M",
            "5P"
        ],
        "quality": "Major",
        "aliases": [
            "M",
            "^",
            "",
            "maj"
        ],
        "symbol": "C#",
        "tonic": "C#",
        "type": "major",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "C#",
            "E#",
            "G#"
        ]
    },
    {
        "empty": false,
        "name": "C# major seventh",
        "setNum": 2193,
        "chroma": "100010010001",
        "normalized": "100010010001",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7M"
        ],
        "quality": "Major",
        "aliases": [
            "maj7",
            "Δ",
            "ma7",
            "M7",
            "Maj7",
            "^7"
        ],
        "symbol": "C#maj7",
        "tonic": "C#",
        "type": "major seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "C#",
            "E#",
            "G#",
            "B#"
        ]
    },
    {
        "empty": false,
        "name": "C# dominant seventh",
        "setNum": 2194,
        "chroma": "100010010010",
        "normalized": "100010010010",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7m"
        ],
        "quality": "Major",
        "aliases": [
            "7",
            "dom"
        ],
        "symbol": "C#7",
        "tonic": "C#",
        "type": "dominant seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "C#",
            "E#",
            "G#",
            "B"
        ]
    },
    {
        "empty": false,
        "name": "C# sixth",
        "setNum": 2196,
        "chroma": "100010010100",
        "normalized": "100010010100",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "6M"
        ],
        "quality": "Major",
        "aliases": [
            "6",
            "add6",
            "add13",
            "M6"
        ],
        "symbol": "C#6",
        "tonic": "C#",
        "type": "sixth",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "C#",
            "E#",
            "G#",
            "A#"
        ]
    },
    {
        "empty": false,
        "name": "D# major",
        "setNum": 2192,
        "chroma": "100010010000",
        "normalized": "100001000100",
        "intervals": [
            "1P",
            "3M",
            "5P"
        ],
        "quality": "Major",
        "aliases": [
            "M",
            "^",
            "",
            "maj"
        ],
        "symbol": "D#",
        "tonic": "D#",
        "type": "major",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "D#",
            "F##",
            "A#"
        ]
    },
    {
        "empty": false,
        "name": "D# major seventh",
        "setNum": 2193,
        "chroma": "100010010001",
        "normalized": "100010010001",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7M"
        ],
        "quality": "Major",
        "aliases": [
            "maj7",
            "Δ",
            "ma7",
            "M7",
            "Maj7",
            "^7"
        ],
        "symbol": "D#maj7",
        "tonic": "D#",
        "type": "major seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "D#",
            "F##",
            "A#",
            "C##"
        ]
    },
    {
        "empty": false,
        "name": "D# dominant seventh",
        "setNum": 2194,
        "chroma": "100010010010",
        "normalized": "100010010010",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7m"
        ],
        "quality": "Major",
        "aliases": [
            "7",
            "dom"
        ],
        "symbol": "D#7",
        "tonic": "D#",
        "type": "dominant seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "D#",
            "F##",
            "A#",
            "C#"
        ]
    },
    {
        "empty": false,
        "name": "D# sixth",
        "setNum": 2196,
        "chroma": "100010010100",
        "normalized": "100010010100",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "6M"
        ],
        "quality": "Major",
        "aliases": [
            "6",
            "add6",
            "add13",
            "M6"
        ],
        "symbol": "D#6",
        "tonic": "D#",
        "type": "sixth",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "D#",
            "F##",
            "A#",
            "B#"
        ]
    },
    {
        "empty": false,
        "name": "F# major",
        "setNum": 2192,
        "chroma": "100010010000",
        "normalized": "100001000100",
        "intervals": [
            "1P",
            "3M",
            "5P"
        ],
        "quality": "Major",
        "aliases": [
            "M",
            "^",
            "",
            "maj"
        ],
        "symbol": "F#",
        "tonic": "F#",
        "type": "major",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "F#",
            "A#",
            "C#"
        ]
    },
    {
        "empty": false,
        "name": "F# major seventh",
        "setNum": 2193,
        "chroma": "100010010001",
        "normalized": "100010010001",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7M"
        ],
        "quality": "Major",
        "aliases": [
            "maj7",
            "Δ",
            "ma7",
            "M7",
            "Maj7",
            "^7"
        ],
        "symbol": "F#maj7",
        "tonic": "F#",
        "type": "major seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "F#",
            "A#",
            "C#",
            "E#"
        ]
    },
    {
        "empty": false,
        "name": "F# dominant seventh",
        "setNum": 2194,
        "chroma": "100010010010",
        "normalized": "100010010010",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7m"
        ],
        "quality": "Major",
        "aliases": [
            "7",
            "dom"
        ],
        "symbol": "F#7",
        "tonic": "F#",
        "type": "dominant seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "F#",
            "A#",
            "C#",
            "E"
        ]
    },
    {
        "empty": false,
        "name": "F# sixth",
        "setNum": 2196,
        "chroma": "100010010100",
        "normalized": "100010010100",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "6M"
        ],
        "quality": "Major",
        "aliases": [
            "6",
            "add6",
            "add13",
            "M6"
        ],
        "symbol": "F#6",
        "tonic": "F#",
        "type": "sixth",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "F#",
            "A#",
            "C#",
            "D#"
        ]
    },
    {
        "empty": false,
        "name": "G# major",
        "setNum": 2192,
        "chroma": "100010010000",
        "normalized": "100001000100",
        "intervals": [
            "1P",
            "3M",
            "5P"
        ],
        "quality": "Major",
        "aliases": [
            "M",
            "^",
            "",
            "maj"
        ],
        "symbol": "G#",
        "tonic": "G#",
        "type": "major",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "G#",
            "B#",
            "D#"
        ]
    },
    {
        "empty": false,
        "name": "G# major seventh",
        "setNum": 2193,
        "chroma": "100010010001",
        "normalized": "100010010001",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7M"
        ],
        "quality": "Major",
        "aliases": [
            "maj7",
            "Δ",
            "ma7",
            "M7",
            "Maj7",
            "^7"
        ],
        "symbol": "G#maj7",
        "tonic": "G#",
        "type": "major seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "G#",
            "B#",
            "D#",
            "F##"
        ]
    },
    {
        "empty": false,
        "name": "G# dominant seventh",
        "setNum": 2194,
        "chroma": "100010010010",
        "normalized": "100010010010",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "7m"
        ],
        "quality": "Major",
        "aliases": [
            "7",
            "dom"
        ],
        "symbol": "G#7",
        "tonic": "G#",
        "type": "dominant seventh",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "G#",
            "B#",
            "D#",
            "F#"
        ]
    },
    {
        "empty": false,
        "name": "G# sixth",
        "setNum": 2196,
        "chroma": "100010010100",
        "normalized": "100010010100",
        "intervals": [
            "1P",
            "3M",
            "5P",
            "6M"
        ],
        "quality": "Major",
        "aliases": [
            "6",
            "add6",
            "add13",
            "M6"
        ],
        "symbol": "G#6",
        "tonic": "G#",
        "type": "sixth",
        "root": "",
        "bass": "",
        "rootDegree": null,
        "notes": [
            "G#",
            "B#",
            "D#",
            "E#"
        ]
    }
]

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

const commonChords: Readonly<string[]> = [
    'major', 'minor', '7', 'maj7', 'm7', 'dim7', 'aug', 
    'sus4', 'sus2', '6', 'm6', '9', 'maj9', 'm9',
    'add9', '69', 'm69', '11', 'maj11', 'min11'
];

export {
    chordList,
    musicalNotes,
    analyzeNotesToChords,
    processChordResults,
    getChordInfo,
    fetchMatchingChords
}
