import React from 'react';
import type { QuestionPaper } from '../types';
import DownloadIcon from './icons/DownloadIcon';

interface QuestionPaperViewProps {
    questionPaper: QuestionPaper;
}

const QuestionPaperView: React.FC<QuestionPaperViewProps> = ({ questionPaper }) => {
    const handleDownload = () => {
        const content = `
# ${questionPaper.title}
**Total Marks: ${questionPaper.totalMarks}**

---

${questionPaper.questions.map((q, index) => `${index + 1}. ${q.question} (${q.marks} marks)`).join('\n\n')}
        `;
        const blob = new Blob([content.trim()], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${questionPaper.title.replace(/\s/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{questionPaper.title}</h2>
                    <p className="text-gray-500 font-semibold">Total Marks: {questionPaper.totalMarks}</p>
                </div>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <DownloadIcon />
                    <span>Download</span>
                </button>
            </div>
            
            <div className="space-y-6">
                {questionPaper.questions.map((q, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <span className="font-bold text-gray-700">{index + 1}.</span>
                        <div className="flex-grow">
                            <p className="text-gray-800">{q.question}</p>
                            <p className="text-sm font-semibold text-indigo-500 mt-1">{q.marks} {q.marks > 1 ? 'Marks' : 'Mark'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionPaperView;
