
export const parseSubtitle = (content: string): { text: string; lines: string[] } => {
    // Remove VTT headers
    let cleanContent = content.replace(/WEBVTT[\r\n]*/, '');
    
    // Remove timestamps and cue identifiers (like numbers in SRT)
    cleanContent = cleanContent.replace(/^\d+[\r\n]+/gm, ''); // SRT numbers
    cleanContent = cleanContent.replace(/[\d:,.-]+ --> [\d:,.-]+.*/g, ''); // Timestamps
    
    // Remove cue settings/tags
    cleanContent = cleanContent.replace(/<[^>]+>/g, ' '); // HTML-like tags
    
    // Normalize line breaks and spaces
    cleanContent = cleanContent.replace(/[\r\n]+/g, '\n').trim();
    
    const lines = cleanContent.split('\n').filter(line => line.trim() !== '');
    const fullText = lines.join(' ');

    return {
        text: fullText,
        lines: lines
    };
};
