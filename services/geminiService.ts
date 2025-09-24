import { GoogleGenAI, Type } from "@google/genai";
import type { Flashcard, CefrLevel } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const flashcardSchema = {
    type: Type.OBJECT,
    properties: {
        word: { type: Type.STRING, description: "The target vocabulary word." },
        partOfSpeech: { type: Type.STRING, description: "The part of speech of the word (e.g., noun, verb, adjective)." },
        ipa: { type: Type.STRING, description: "The International Phonetic Alphabet (IPA) pronunciation of the word." },
        definition: { type: Type.STRING, description: "A concise and simple English definition suitable for a language learner." },
        exampleSentence: { type: Type.STRING, description: "The original context sentence from the document." },
        synonyms: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "A list of 2-3 common synonyms for the word."
        },
    },
    required: ["word", "partOfSpeech", "definition", "exampleSentence"],
};

const batchFlashcardsSchema = {
    type: Type.ARRAY,
    items: flashcardSchema,
};

export const classifyWordsByCefr = async (words: string[]): Promise<Record<string, CefrLevel>> => {
    // We chunk the words to avoid hitting prompt size limits with large files.
    const CHUNK_SIZE = 300;
    const chunks = [];
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
        chunks.push(words.slice(i, i + CHUNK_SIZE));
    }

    let finalWordMap: Record<string, CefrLevel> = {};

    for (const chunk of chunks) {
        const prompt = `
            You are a linguistic expert specializing in the Common European Framework of Reference for Languages (CEFR).
            Analyze the following list of English words and classify each one according to its CEFR level (A1, A2, B1, B2, C1, or C2).
            Your response must be a single, valid JSON object where each key is a word from the list and the value is its corresponding CEFR level as a string.
            Exclude any proper nouns, names, slang, or non-standard English words from your response. Do not include words that are not on a CEFR scale.

            Words: ${chunk.join(', ')}
        `;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                },
            });

            const jsonText = response.text.trim();
            const parsedChunk = JSON.parse(jsonText) as Record<string, CefrLevel>;
            finalWordMap = { ...finalWordMap, ...parsedChunk };

        } catch (error) {
            console.error("Error classifying word chunk:", error);
            // Continue with the next chunk even if one fails
        }
    }
    
    return finalWordMap;
};

export const generateFlashcardsInBatch = async (
    wordsWithContext: { word: string; contextSentence: string }[]
): Promise<Flashcard[]> => {
    
    const wordsPayload = JSON.stringify(wordsWithContext.map(item => ({
        word: item.word,
        context: item.contextSentence,
    })));

    const prompt = `
        You are an expert linguist creating flashcards for an English language learner.
        Analyze the following JSON array of words, each with its own context sentence.
        For EACH object in the array, generate a complete flashcard.

        Your response MUST be a single JSON array, containing one flashcard object for each word provided in the input.
        The exampleSentence in your output MUST be the exact context sentence I provide for that word.
        Ensure definitions are simple and clear for learners.

        Input words and contexts:
        ${wordsPayload}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: batchFlashcardsSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText) as Flashcard[];
        
        return parsedJson;
    } catch (error) {
        console.error(`Error generating flashcards in batch:`, error);
        throw new Error("Failed to generate flashcards from the AI. The response might have been invalid.");
    }
};
