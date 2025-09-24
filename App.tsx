import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { OptionsPanel } from './components/OptionsPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { Flashcard, CefrLevel } from './types';
import { CEFR_LEVELS } from './constants';
import { parseSubtitle } from './services/subtitleParser';
import { parsePdf } from './services/pdfParser';
import { STOP_WORDS } from './data/stopWords';
import { CEFR_WORDLIST } from './data/cefrWordlist';
import { generateFlashcardsInBatch, classifyWordsByCefr } from './services/geminiService';

const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [cefrLevel, setCefrLevel] = useState<CefrLevel>('B1');
    const [customStopWords, setCustomStopWords] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (selectedFile: File | null) => {
        setFile(selectedFile);
        setGeneratedCards([]);
        setError(null);
    };

    const handleGenerate = useCallback(async () => {
        if (!file) {
            setError("Please upload a subtitle or PDF file first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedCards([]);
        setProgress(0);

        try {
            setLoadingMessage('Parsing document...');
            let parsedResult: { text: string, lines: string[] };

            if (file.name.toLowerCase().endsWith('.pdf')) {
                parsedResult = await parsePdf(file);
            } else {
                const fileContent = await file.text();
                parsedResult = parseSubtitle(fileContent);
            }
            setProgress(10);
            
            const { text, lines } = parsedResult;

            const words = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
            
            const userStopWords = new Set(
                customStopWords.toLowerCase().split(',').map(w => w.trim()).filter(Boolean)
            );
            const allStopWords = new Set([...STOP_WORDS, ...userStopWords]);

            const uniqueWords = [...new Set(words)].filter(word => word.length >= 3 && !allStopWords.has(word));

            if (uniqueWords.length === 0) {
              setError("No valid words found in the document after filtering.");
              setIsLoading(false);
              return;
            }

            setLoadingMessage('Classifying vocabulary...');
            const wordToCefrMap: Partial<Record<string, CefrLevel>> = {};
            const wordsForApiClassification: string[] = [];

            // Step 1: Classify words using the local wordlist
            uniqueWords.forEach(word => {
                const knownLevel = CEFR_WORDLIST[word as keyof typeof CEFR_WORDLIST];
                if (knownLevel) {
                    wordToCefrMap[word] = knownLevel;
                } else {
                    wordsForApiClassification.push(word);
                }
            });
            setProgress(25);


            // Step 2: Classify remaining words with Gemini AI if necessary
            if (wordsForApiClassification.length > 0) {
                setLoadingMessage(`Analyzing ${wordsForApiClassification.length} uncommon words with AI...`);
                try {
                    const aiClassifiedWords = await classifyWordsByCefr(wordsForApiClassification);
                    // Merge results from AI
                    Object.assign(wordToCefrMap, aiClassifiedWords);
                } catch(e) {
                    console.warn("AI classification failed for some words. Proceeding with locally classified words.", e);
                    // This is not a fatal error, so we can continue with what we have.
                }
            } else {
                setLoadingMessage('All words classified locally.');
            }

            setProgress(40);

            const selectedCefrIndex = CEFR_LEVELS.indexOf(cefrLevel);
            const targetCefrLevels = new Set(CEFR_LEVELS.slice(selectedCefrIndex));

            const targetWords = Object.keys(wordToCefrMap).filter(word => {
                const wordCefr = wordToCefrMap[word as keyof typeof wordToCefrMap];
                return wordCefr && targetCefrLevels.has(wordCefr);
            });
            
            if (targetWords.length === 0) {
              setError("No words found for the selected level. Try a lower level or a different file.");
              setIsLoading(false);
              return;
            }
            
            setLoadingMessage(`Generating flashcards for ${targetWords.length} words...`);
            
            const wordsWithContext = targetWords.map(word => {
                const contextSentence = lines.find(line => new RegExp(`\\b${word}\\b`, 'i').test(line)) || "No context sentence found.";
                return { word, contextSentence };
            });

            const newCards = await generateFlashcardsInBatch(wordsWithContext);
            setGeneratedCards(newCards);
            setProgress(100);

        } catch (e) {
            console.error(e);
            setError("An unexpected error occurred during processing. Please check the console for details.");
        } finally {
            setIsLoading(false);
        }
    }, [file, cefrLevel, customStopWords]);

    return (
        <div className="min-h-screen flex flex-col font-sans text-on-surface">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <FileUpload onFileChange={handleFileChange} file={file} />
                        <OptionsPanel
                            cefrLevel={cefrLevel}
                            onCefrLevelChange={setCefrLevel}
                            customStopWords={customStopWords}
                            onCustomStopWordsChange={setCustomStopWords}
                            onGenerate={handleGenerate}
                            isLoading={isLoading}
                            isFileUploaded={!!file}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <ResultsDisplay
                            cards={generatedCards}
                            isLoading={isLoading}
                            progress={progress}
                            error={error}
                            loadingMessage={loadingMessage}
                        />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;