
import React, { useState, useMemo } from 'react';
import type { Quiz, Question, MCQ, SubjectiveQuestion } from '../types';

interface QuizViewProps {
    quiz: Quiz;
    onQuizCompleted: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ quiz, onQuizCompleted }) => {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isChecked, setIsChecked] = useState(false);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        if (isChecked) return;
        setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const allQuestionsAnswered = useMemo(() => {
        return quiz.questions.length === Object.keys(answers).length;
    }, [quiz.questions, answers]);

    const handleCheckAnswers = () => {
        if (!isChecked) {
            onQuizCompleted();
        }
        setIsChecked(true);
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">{quiz.title}</h2>
            <div className="space-y-8">
                {quiz.questions.map((q, index) => (
                    <div key={index}>
                        <p className="font-semibold text-gray-700 mb-3">{index + 1}. {q.question}</p>
                        {q.type === 'MCQ' ? (
                            <MCQItem mcq={q} questionIndex={index} selectedAnswer={answers[index]} onAnswer={handleAnswerChange} isChecked={isChecked} />
                        ) : (
                            <SubjectiveItem subjective={q} questionIndex={index} userAnswer={answers[index]} onAnswer={handleAnswerChange} isChecked={isChecked} />
                        )}
                    </div>
                ))}
            </div>
            
            <div className="mt-10 text-center">
                <button
                    onClick={handleCheckAnswers}
                    disabled={!allQuestionsAnswered}
                    className="w-full max-w-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    {isChecked ? 'Answers Checked' : 'Check Answers'}
                </button>
            </div>
        </div>
    );
};

// --- Sub-components for different question types ---

interface MCQItemProps {
    mcq: MCQ;
    questionIndex: number;
    selectedAnswer: string;
    onAnswer: (questionIndex: number, answer: string) => void;
    isChecked: boolean;
}

const MCQItem: React.FC<MCQItemProps> = ({ mcq, questionIndex, selectedAnswer, onAnswer, isChecked }) => {
    const getOptionClass = (option: string) => {
        if (!isChecked) {
            return selectedAnswer === option ? 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-300' : 'bg-white hover:bg-gray-50';
        }
        if (option === mcq.answer) {
            return 'bg-green-100 border-green-500 text-green-800'; // Correct answer
        }
        if (selectedAnswer === option && option !== mcq.answer) {
            return 'bg-red-100 border-red-500 text-red-800'; // Incorrectly selected
        }
        return 'bg-gray-100 text-gray-500'; // Not selected
    };

    return (
        <div className="space-y-2">
            {mcq.options.map(option => (
                <button
                    key={option}
                    onClick={() => onAnswer(questionIndex, option)}
                    disabled={isChecked}
                    className={`w-full text-left p-3 border rounded-lg transition-colors text-gray-700 font-medium ${getOptionClass(option)}`}
                >
                    {option}
                </button>
            ))}
            {isChecked && (
                 <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <p className="font-bold text-blue-800">Explanation:</p>
                    <p className="text-blue-700">{mcq.explanation}</p>
                </div>
            )}
        </div>
    );
};

interface SubjectiveItemProps {
    subjective: SubjectiveQuestion;
    questionIndex: number;
    userAnswer: string;
    onAnswer: (questionIndex: number, answer: string) => void;
    isChecked: boolean;
}

const SubjectiveItem: React.FC<SubjectiveItemProps> = ({ subjective, questionIndex, userAnswer, onAnswer, isChecked }) => {
    return (
         <div>
            <textarea
                value={userAnswer || ''}
                onChange={(e) => onAnswer(questionIndex, e.target.value)}
                rows={4}
                disabled={isChecked}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-100"
                placeholder="Type your answer here..."
            />
            {isChecked && (
                <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                    <p className="font-bold text-green-800">Model Answer:</p>
                    <p className="text-green-700">{subjective.answer}</p>
                </div>
            )}
        </div>
    );
};

export default QuizView;
