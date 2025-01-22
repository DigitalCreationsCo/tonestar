import { Chord } from "@tonaljs/chord";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface TonestarAiRequest {
  chords: Chord[];
  genre: string;
  tempo: number;
  key?: string;
  length?: number;
  instrumentation?: ['piano' | 'drums' | 'bass' | 'guitar' | 'strings'];
  mood?: string;
}

export interface TonestarAiResponse {
  song_structure_analysis: {
    sections: { 
      name: string;
      duration: string;
      chords: string[]
    }[];
    chord_names: string[];
    chord_notes: string[][];
    form: string;
  }
  metadata: {
    generated_key: string;
    instrumentation_used: string[];
    lyrics: Record<string,string>;
    melody_description: string;
    arrangement_notes: string;
  }
}

export class LLMQuery {
    private static instance: LLMQuery | null = null; // Singleton instance
    private apiUrl: string;
    private apiKey: string;
    private gen: GoogleGenerativeAI

    private constructor(apiKey: string, apiUrl: string) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.gen = new GoogleGenerativeAI(this.apiKey);
    }

    static async getInstance(getEnv: () => Promise<any>): Promise<LLMQuery | null> {
      if (!LLMQuery.instance) {
        try {
          const { apiKey, apiUrl } = await getApiCredentials(getEnv); // Ensure getApiCredentials is async
          LLMQuery.instance = new LLMQuery(apiKey, apiUrl);
        } catch (error: any) {
          console.debug(`Error occurred initializing LLMQuery: ${error.message}`);
          throw new Error(`Error occurred initializing LLMQuery: ${error.message}`);
        }
      }
      return LLMQuery.instance; // Return the instance whether it's newly created or already exists
    }
  
    /**
     * Sends a request to the LLM API.
     */
    async sendRequest(input: TonestarAiRequest, options: Partial<GenerationConfig> = {}): Promise<TonestarAiResponse> {
      const defaultConfig: GenerationConfig = {
        temperature: 1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      };
  
    const generationConfig = { ...defaultConfig, ...options };

    const endpointUrl = `${this.apiUrl}?key=${this.apiKey}`

    console.debug(`request input: `, input)

    const getValueOrNull = (key: keyof TonestarAiRequest) => JSON.stringify(input[key]) ?? null

    const body = `
    Generate a complete and compelling musical composition (song) based on a user-provided chord progression. 
    Here are some commonly used chord progressions to understand the kind of music people like, and to use as a reference when writing songs: (
    I-vi-IV-V (C-Am-F-G)
    ii-V-I (Dm-G-C)
    I-IV-I-V (C-F-C-G)
    I-V-vi-IV (C-G-Am-F)
    vi-IV-I-V (Am-F-C-G)
    ii-V-I (in a minor key) (iim7b5-V7-im) e.g., Dmin7b5-G7-Cm
    I-vi-ii-V (C-Am-Dm-G)
    I-IV-V-IV (C-F-G-F)
    I-iii-vi-IV (C-Em-Am-F)
    vi-ii-V-I (Am-Dm-G-C)
    ii-V-I (with various 7th chords) (Dm7-G7-CM7)
    I-vi7-ii7-V7 (Cmaj7-Am7-Dm7-G7)
    iii-VI-ii-V (Em-A-Dm-G - in C)
    ii-V of V - I (Dm7-G7 - CM7 but G7 resolves to D7 then G7 then CM7)
    I-VI-ii-V (Coltrane changes - uses altered dominants and substitutions)
    Rhythm Changes (I-vi-ii-V in AABA form with specific rhythmic pattern)
    I-IV-V (12-bar blues)
    I-IV-I-V (simple blues)
    I-IV7-I7-IV7 (more complex blues)
    I-V-IV (rock 'n' roll)
    I-V-vi-IV
    IV-I-V-vi
    vi-IV-I-V
    I-IV-vi-V
    I-vi-IV
    IV-V-I
    I-V-IV-V
    I-vi-iii-IV
    i-iv-v (Am-Dm-Em)
    i-iv-VII (Am-Dm-G)
    i-VI-VII (Am-F-G)
    i-v-iv-i (Am-Em-Dm-Am)
    i-VI-iv-v (Am-F-Dm-Em)
    I-V6-IV-I6 (descending bass: C-G/B-F/A-C/G)
    I-V-IV-iii
    I-bVII-IV-I (borrowing from parallel minor)
    i-bIII-bVII-IV (minor key with borrowed chords)
    I-vi-ii-V
    I-vi-IV-V
    I-ii-iii-vi
    I-V-I-V
    I-IV-V-I (plagal cadence)
    vi-ii-V-I
    I-VII-IV-I
    I-iii-IV-I
    i-VII-VI-V
    I-ii-V-I
    I-IV-ii-V
    I-IV-V-iii
    i-bVI-V-i
    )
    Here's an explanation of the roman numeral system: (
    I is the tonic, or the tonal center of the chord progression.
    ii is the second interval up from the tonic.
    iii.
    IV is an important chord that often goes well with I.
    V adds tension to music that resolves nicely back to I.
    vi.
    vii is a special chord that sounds a bit unstable and wants to resolve.
    )
    The chords of the song must contain the user-provided chords, and the result should be a great sounding song.
    When referencing the names of chords, use these examples as the format convention for chord names: (e.g. 'GM', 'Cmaj#4', 'Cmaj7#9#11', 'Emaj9', 'FM7add13', 'Dmaj13', 'Amaj9#11', 'CM13#11', 'CM7b9', ).
    If you want to suggest a chord with a root, produce the chord followed by the root, separated with a slash. Here are examples of the format convention(e.g. 'Cmaj7/B', 'D/F', 'G/F')
    Your final output should be a JSON-like structure containing a breakdown of the song's structure, chord information, and metadata.
    
    Input Data:
    chord_progression: ${getValueOrNull("chords")}
    genre: ${getValueOrNull('genre')}
    tempo: ${getValueOrNull('tempo')}
    key: ${getValueOrNull('key')}
    song_length: ${getValueOrNull('length')}
    instrumentation: ${getValueOrNull('instrumentation')}
    song_mood: ${getValueOrNull("mood")}
    
    Output Data Structure:
    {
      "song_structure_analysis": {
        "sections": [
        {
            "name": "string", 
            "duration": "string",
            "chords": ["chord_1","chord_2"]
        },
        {
          "name": "string", 
          "duration": "string",
          "chords": ["chord_1","chord_2"]
        }
        ],
        "chord_names": ["string_1","string_2"],
         "chord_notes": [["note_1","note_2","note_3"], ["note_1","note_2","note_3"]],
        "form": "string"
      },
      "metadata": {
        "generated_genre": "string",
        "generated_tempo": "number",
        "generated_key": "string",
        "instrumentation_used": ["string_1", "string_2"]
       }
    }
    
    Provide the output in a object, starting with "{ "song_structure_analyis":", do not include any of the above example text in your response.
    `;

      console.debug(`body`, body)
      
      try {
        console.debug(`sending llmquery request`)

        const { response } = await this.gen.getGenerativeModel({ model: "gemini-2.0-flash-exp", generationConfig }, { customHeaders: {
            "Content-Type": "application/json"
        }}).generateContent(body)

        console.debug(`response`, response)
  
        const result = await response.text()
        console.debug(`result `, result)

        return JSON.parse(result);
      } catch (error: any) {
        console.error("Error querying LLM:", error.message);
        throw new Error(error.message)
      }
    }
  }
  
  interface GenerationConfig {
    response_schema?: any;
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
    responseMimeType: string;
  }
  
async function getApiCredentials(getEnv: () => Promise<any>) {
  const { GEMINI_API_KEY, GEMINI_URL } = await getEnv()
  return { 
      apiUrl:GEMINI_URL,
      apiKey: GEMINI_API_KEY
  }
}