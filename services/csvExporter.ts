import type { Flashcard } from '../types';

function formatCardForAnki(card: Flashcard): { front: string; back: string } {
    const front = card.word;
    const back = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: left; color: #E5E5E7;">
            <div style="font-weight: bold; font-size: 1.2em;">
                ${card.partOfSpeech}
                ${card.ipa ? `<span style="color: #8E8E93; margin-left: 10px;">/${card.ipa}/</span>` : ''}
            </div>
            <hr style="margin: 10px 0; border-top: 1px solid #38383A; border-bottom: none;">
            <p style="font-size: 1.1em;">${card.definition}</p>
            <blockquote style="border-left: 4px solid #38383A; padding-left: 10px; margin: 10px 0; color: #8E8E93; font-style: italic;">
                "${card.exampleSentence}"
            </blockquote>
            ${card.synonyms && card.synonyms.length > 0 ? `
                <div style="margin-top: 10px;">
                    <strong style="color: #E5E5E7;">Synonyms:</strong> ${card.synonyms.join(', ')}
                </div>
            ` : ''}
        </div>
    `.replace(/\s\s+/g, ' ').trim(); // Clean up whitespace

    return { front, back };
}

export const exportToCsv = (cards: Flashcard[]) => {
    const csvRows = cards.map(card => {
        const { front, back } = formatCardForAnki(card);
        // Anki uses semicolons by default, but double quotes handle commas within fields
        const escapedBack = `"${back.replace(/"/g, '""')}"`;
        return `${front};${escapedBack}`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + ["Front;Back", ...csvRows].join("\r\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "anki_deck.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
};