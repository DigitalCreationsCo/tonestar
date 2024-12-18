import { Chord } from "@tonaljs/chord";

// const getEnv = () => Promise.resolve({ 
//     GEMINI_API_KEY: "AIzaSyB5whekbuZ8kRqn2tmd_uzE_6qqJ_414Mw", 
//     GEMINI_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"
// })

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
  objective: string;
  chord_progression: string[];
  genre: string;
  tempo: number;
  key: string;
  song_length: string;
  instrumentation: string[];
  mood: string;
  output: {
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
}

export class LLMQuery {
    private static instance: LLMQuery | null = null; // Singleton instance
    private apiUrl: string;
    private apiKey: string;
  
    private constructor(apiKey: string, apiUrl: string) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
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
      // console.debug(`url: ${this.apiUrl}`)
      // console.debug(`key: ${this.apiKey}`)
      // console.debug(`endpointUrl: ${endpointUrl}`)

      const body = {
        "system_instruction": {
          "parts": { 
            "text": `{
              "objective": "Generate a complete and compelling musical composition (song) based on a user-provided chord progression.",
              "chord_progression": "${input.chords}",
              "genre": "${input.genre || undefined}",
              "tempo": ${input.tempo},
              "key": "${input.key || undefined}",
              "song_length": "${input.length || undefined}",
              "instrumentation": "${input.instrumentation || undefined}",
              "mood": "${input.mood || undefined}",
              "output": {
                "song_structure_analysis": {
                  "sections": {
                    "name": "string",
                    "duration": "string",
                    "chords": []
                  },
                  "chord_names": [],
                  "chord_notes": [],
                  "form": ""
                },
                "metadata": {
                  "generated_genre": "string",
                  "generated_tempo": "number",
                  "generated_key": "string",
                  "instrumentation_used": []
                }
              }
            }`
          }
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: input.mood,
              },
            ],
          },
        ],
        generationConfig,
      };
  
      try {
        const response = await fetch(endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const responseData = await response.text();
        const result = JSON.parse(responseData)['candidates']?.[0]?.['content']?.['parts'][0]?.['text']
        console.debug(`result `, result)
        return JSON.parse(result);
      } catch (error) {
        console.error("Error querying LLM:", error);
        throw error;
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