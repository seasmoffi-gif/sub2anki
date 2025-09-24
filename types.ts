
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Flashcard {
    word: string;
    partOfSpeech: string;
    ipa: string;
    definition: string;
    exampleSentence: string;
    synonyms: string[];
}
