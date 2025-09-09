
import React, { useEffect, useState } from 'react';
import type { StudyGoal } from '../types';
import TrophyIcon from './icons/TrophyIcon';

interface GoalCompletionToastProps {
    goal: StudyGoal;
    onDismiss: () => void;
}

const GoalCompletionToast: React.FC<GoalCompletionToastProps> = ({ goal, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Fade in
        const timerIn = setTimeout(() => setIsVisible(true), 100);
        // Start fade out process before component is removed from DOM
        const timerOut = setTimeout(() => setIsVisible(false), 4500);

        return () => {
            clearTimeout(timerIn);
            clearTimeout(timerOut);
        };
    }, []);

    const goalText = goal.type === 'flashcards' 
        ? `Reviewed ${goal.target} flashcards` 
        : `Completed ${goal.target} ${goal.target > 1 ? 'quizzes' : 'quiz'}`;

    return (
        <div 
            className={`fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-sm p-4 bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            role="alert"
            aria-live="assertive"
        >
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <TrophyIcon />
                </div>
                <div>
                    <p className="font-bold text-gray-800">Goal Complete!</p>
                    <p className="text-sm text-gray-600">You achieved your {goal.frequency} goal: {goalText}.</p>
                </div>
                <button onClick={onDismiss} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" aria-label="Dismiss notification">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default GoalCompletionToast;
