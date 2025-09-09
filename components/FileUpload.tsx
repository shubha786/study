import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileState } from '../types';
import UploadIcon from './icons/UploadIcon';

interface FileUploadProps {
    onSubmit: (fileState: FileState) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onSubmit }) => {
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
        setError(null);

        if (fileRejections.length > 0) {
            setError('File is too large or not a valid type. Please upload a PDF, DOCX, or TXT file under 10MB.');
            return;
        }

        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const reader = new FileReader();

            reader.onabort = () => setError('File reading was aborted.');
            reader.onerror = () => setError('File reading has failed.');
            reader.onload = () => {
                const binaryStr = reader.result as string;
                const base64Content = binaryStr.split(',')[1];
                if (base64Content) {
                    onSubmit({
                        file,
                        name: file.name,
                        content: base64Content,
                        mimeType: file.type,
                    });
                } else {
                    setError('Could not read file content.');
                }
            };
            reader.readAsDataURL(file);
        }
    }, [onSubmit]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false,
    });

    return (
        <div className="w-full max-w-2xl text-center">
            <div
                {...getRootProps()}
                className={`p-6 sm:p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50'
                }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center">
                    <UploadIcon />
                    {isDragActive ? (
                        <p className="font-semibold text-indigo-600">Drop the file here ...</p>
                    ) : (
                        <>
                            <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PDF, DOCX, or TXT (MAX. 10MB)</p>
                        </>
                    )}
                </div>
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <div className="mt-8 text-center text-gray-600">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Unlock Your Study Potential</h2>
                <p className="max-w-prose mx-auto text-sm sm:text-base">
                    Upload your course notes, textbook chapters, or articles, and let AI create customized flashcards, quizzes, summaries, and more to supercharge your learning.
                </p>
            </div>
        </div>
    );
};

export default FileUpload;