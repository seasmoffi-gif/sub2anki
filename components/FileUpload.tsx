import React, { useState, useCallback } from 'react';
import { UploadIcon, FileIcon } from './icons';

interface FileUploadProps {
    onFileChange: (file: File | null) => void;
    file: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, file }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            onFileChange(droppedFiles[0]);
        }
    }, [onFileChange]);
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileChange(e.target.files[0]);
        }
    };

    const handleRemoveFile = () => {
        onFileChange(null);
    }

    return (
        <div className="bg-surface p-6 rounded-xl">
            <h2 className="text-lg font-semibold text-on-surface mb-4">1. Upload File</h2>
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${isDragging ? 'border-primary bg-primary/20' : 'border-border-color bg-background'}`}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".srt,.vtt,.pdf"
                    onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center justify-center space-y-2 text-on-surface-secondary">
                    <UploadIcon className="w-10 h-10" />
                    <p className="font-semibold">
                      <label htmlFor="file-upload" className="text-primary font-semibold cursor-pointer hover:underline">Click to upload</label> or drag and drop
                    </p>
                    <p className="text-xs">SRT, VTT, or PDF files</p>
                </div>
            </div>
            {file && (
                <div className="mt-4 p-3 bg-background rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileIcon className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-on-surface truncate">{file.name}</span>
                    </div>
                    <button onClick={handleRemoveFile} className="text-danger hover:text-danger/80 font-bold text-xl transition-colors">&times;</button>
                </div>
            )}
        </div>
    );
};