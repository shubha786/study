import React, { useState } from 'react';
import CopyIcon from './icons/CopyIcon';

interface SummaryViewProps {
    summary: string;
}

const SummaryView: React.FC<SummaryViewProps> = ({ summary }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy');

    const handleCopy = () => {
        navigator.clipboard.writeText(summary);
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy'), 2000);
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-gray-800">Key Concepts Summary</h2>
                 <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200 transition-colors"
                 >
                    <CopyIcon />
                    {copyButtonText}
                 </button>
            </div>
           
            <div className="prose prose-indigo max-w-none text-gray-700 space-y-4" style={{ whiteSpace: 'pre-wrap' }}>
                {summary}
            </div>
        </div>
    );
};

export default SummaryView;