import React from 'react';
import type { Flashcard } from '../types';

interface CardPreviewProps {
    card: Flashcard;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ card }) => {
    return (
        <div className="bg-background border border-border-color rounded-lg p-4">
            <div className="flex items-baseline gap-3">
                <h3 className="text-xl font-bold text-primary">{card.word}</h3>
                <span className="text-sm font-medium text-on-surface-secondary italic">{card.partOfSpeech}</span>
                {card.ipa && <span className="text-sm text-on-surface-secondary">/{card.ipa}/</span>}
            </div>
            <p className="mt-2 text-on-surface">{card.definition}</p>
            <blockquote className="mt-3 pl-3 border-l-4 border-border-color text-sm text-on-surface-secondary italic">
                "{card.exampleSentence}"
            </blockquote>
            {card.synonyms && card.synonyms.length > 0 && (
                 <div className="mt-3">
                    <span className="font-semibold text-sm">Synonyms:</span>
                    <span className="text-sm text-on-surface-secondary ml-2">{card.synonyms.join(', ')}</span>
                </div>
            )}
        </div>
    );
};