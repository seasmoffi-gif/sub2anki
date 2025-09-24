import React from 'react';
import type { CefrLevel } from '../types';
import { CEFR_LEVELS } from '../constants';
import { GenerateIcon } from './icons';

interface OptionsPanelProps {
    cefrLevel: CefrLevel;
    onCefrLevelChange: (level: CefrLevel) => void;
    customStopWords: string;
    onCustomStopWordsChange: (words: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    isFileUploaded: boolean;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({
    cefrLevel,
    onCefrLevelChange,
    customStopWords,
    onCustomStopWordsChange,
    onGenerate,
    isLoading,
    isFileUploaded
}) => {
    return (
        <div className="bg-surface p-6 rounded-xl space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-on-surface mb-4">2. Set Options</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="cefr-level" className="block text-sm font-medium text-on-surface-secondary mb-2">Target Proficiency Level (CEFR)</label>
                        <p className="text-xs text-on-surface-secondary/80 mb-2">Select the minimum level. Words at this level and above will be included.</p>
                        <select
                            id="cefr-level"
                            value={cefrLevel}
                            onChange={(e) => onCefrLevelChange(e.target.value as CefrLevel)}
                            className="w-full p-2 border border-border-color rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background text-on-surface"
                        >
                            {CEFR_LEVELS.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="stop-words" className="block text-sm font-medium text-on-surface-secondary mb-2">Custom Stop Words</label>
                        <input
                            type="text"
                            id="stop-words"
                            value={customStopWords}
                            onChange={(e) => onCustomStopWordsChange(e.target.value)}
                            placeholder="e.g., character names, places"
                            className="w-full p-2 border border-border-color rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background text-on-surface placeholder:text-on-surface-secondary/50"
                        />
                         <p className="text-xs text-on-surface-secondary/80 mt-1">Comma-separated words to exclude.</p>
                    </div>
                </div>
            </div>
            <div>
                 <h2 className="text-lg font-semibold text-on-surface mb-4">3. Generate Cards</h2>
                 <button
                    onClick={onGenerate}
                    disabled={isLoading || !isFileUploaded}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:bg-primary/90 disabled:bg-surface disabled:text-on-surface-secondary disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Generating...
                        </>
                    ) : (
                       <>
                        <GenerateIcon className="w-5 h-5" />
                        Generate Flashcards
                       </>
                    )}
                </button>
            </div>
        </div>
    );
};