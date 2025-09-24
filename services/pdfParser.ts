import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source to the static CDN path configured in the importmap.
// This is required for the library to work correctly in a web worker and fixes the URL construction error.
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.mjs';

/**
 * Parses a PDF file and extracts its text content.
 * @param file The PDF file to parse.
 * @returns A promise that resolves to an object containing the full text and an array of lines/sentences.
 */
export const parsePdf = async (file: File): Promise<{ text: string; lines: string[] }> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const numPages = pdf.numPages;
    const pageTexts: string[] = [];

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
        pageTexts.push(pageText);
    }
    
    const fullText = pageTexts.join('\n');
    
    // A simple approach to split the text into sentences for context searching.
    // It splits by sentence-ending punctuation followed by a space or newline.
    const lines = fullText.match(/[^.!?]+[.!?]*/g) || [fullText];

    return {
        text: fullText.replace(/[\r\n]+/g, ' ').trim(),
        lines: lines.map(line => line.trim()).filter(line => line.length > 0)
    };
};
