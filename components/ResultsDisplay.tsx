import React from 'react';
import type { Flashcard } from '../types';
import { CardPreview } from './CardPreview';
import { exportToCsv } from '../services/csvExporter';
import { DownloadIcon } from './icons';

interface ResultsDisplayProps {
    cards: Flashcard[];
    isLoading: boolean;
    progress: number;
    error: string | null;
    loadingMessage: string;
}

const LoadingState: React.FC<{ progress: number; message: string }> = ({ progress, message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-lg font-semibold text-on-surface mb-4">{message || 'Processing...'}</p>
        <div className="w-full bg-surface rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="mt-2 text-sm text-on-surface-secondary">{progress > 0 ? `${progress}% complete` : `Please wait...`}</p>
        <p className="mt-4 text-xs text-on-surface-secondary/80">This may take a few moments. Please don't close the window.</p>
    </div>
);

const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed border-border-color rounded-lg">
        <h3 className="text-xl font-semibold text-on-surface">Your Flashcards Will Appear Here</h3>
        <p className="mt-2 text-on-surface-secondary">Upload a file and click "Generate" to begin.</p>
    </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
     <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-danger/10 border-2 border-dashed border-danger/30 rounded-lg">
        <h3 className="text-xl font-semibold text-danger">An Error Occurred</h3>
        <p className="mt-2 text-danger">{message}</p>
    </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ cards, isLoading, progress, error, loadingMessage }) => {
    const handleDownload = () => {
        exportToCsv(cards);
    };

    const hasResults = cards.length > 0;

    return (
        <div className="bg-surface p-6 rounded-xl h-full min-h-[400px]">
            {hasResults && !isLoading && (
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-on-surface">Generated Cards ({cards.length})</h2>
                     <button
                        onClick={handleDownload}
                        className="bg-secondary text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors hover:bg-secondary/90"
                    >
                        <DownloadIcon className="w-5 h-5"/>
                        Download CSV
                    </button>
                 </div>
            )}
           
            <div className="relative">
                {isLoading ? (
                    <LoadingState progress={progress} message={loadingMessage} />
                ) : error ? (
                    <ErrorState message={error} />
                ) : !hasResults ? (
                    <InitialState />
                ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {cards.map((card, index) => (
                            <CardPreview key={`${card.word}-${index}`} card={card} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};