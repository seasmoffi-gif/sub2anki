import React from 'react';
import { LogoIcon } from './icons';

export const Header: React.FC = () => (
    <header className="bg-surface border-b border-border-color">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center gap-3">
            <LogoIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                Sub<span className="text-primary">-</span>Anki
            </h1>
            <span className="text-sm text-on-surface-secondary mt-1 hidden sm:inline">AI Flashcard Generator</span>
        </div>
    </header>
);