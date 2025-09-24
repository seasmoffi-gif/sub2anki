import React from 'react';

export const Footer: React.FC = () => (
    <footer className="mt-8 py-4 border-t border-border-color">
        <div className="container mx-auto px-4 md:px-8 text-center text-sm text-on-surface-secondary">
            <p>&copy; {new Date().getFullYear()} Sub-Anki. All Rights Reserved.</p>
            <p className="mt-1">Generate AI-powered language flashcards from your favorite media.</p>
        </div>
    </footer>
);