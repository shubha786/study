
import React, { useState } from 'react';
import { StudyGoal, GoalType, GoalFrequency } from '../types';

interface GoalsViewProps {
    goals: StudyGoal[];
    onAddGoal: (goal: Omit<StudyGoal, 'id' | 'progress' | 'lastReset'>) => void;
    onDeleteGoal: (id: string) => void;
}

const GoalsView: React.FC<GoalsViewProps> = ({ goals, onAddGoal, onDeleteGoal }) => {
    const [type, setType] = useState<GoalType>('flashcards');
    const [target, setTarget] = useState<number>(10);
    const [frequency, setFrequency] = useState<GoalFrequency>('daily');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (target > 0) {
            onAddGoal({ type, target, frequency });
            setTarget(10); // Reset form
        }
    };
    
    const goalTitle = (goal: StudyGoal) => {
      const typeText = goal.type === 'flashcards' ? 'Flashcards' : 'Quizzes';
      return `Review ${goal.target} ${typeText}`;
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            {/* Add Goal Form */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Set a New Study Goal</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="goal-type" className="block text-sm font-medium text-gray-700">Activity</label>
                        <select id="goal-type" value={type} onChange={e => setType(e.target.value as GoalType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="flashcards">Review Flashcards</option>
                            <option value="quizzes">Complete Quizzes</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="goal-target" className="block text-sm font-medium text-gray-700">Target</label>
                         <input type="number" id="goal-target" value={target} onChange={e => setTarget(parseInt(e.target.value, 10))} min="1" className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="goal-frequency" className="block text-sm font-medium text-gray-700">Frequency</label>
                        <select id="goal-frequency" value={frequency} onChange={e => setFrequency(e.target.value as GoalFrequency)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                    <button type="submit" className="sm:col-span-3 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                        Add Goal
                    </button>
                </form>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
                 <h3 className="text-xl font-bold text-gray-700">Your Progress</h3>
                {goals.length === 0 ? (
                    <p className="text-gray-500 bg-white p-4 rounded-lg text-center">You haven't set any goals yet. Add one above to get started!</p>
                ) : (
                    goals.map(goal => {
                        const progressPercentage = Math.min((goal.progress / goal.target) * 100, 100);
                        return (
                            <div key={goal.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
                                <div className="flex-grow">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <p className="font-semibold text-gray-800">{goalTitle(goal)}</p>
                                        <p className="text-sm font-bold text-indigo-600">{goal.progress} / {goal.target}</p>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                     <p className="text-xs text-gray-500 mt-1 capitalize">{goal.frequency}</p>
                                </div>
                                <button onClick={() => onDeleteGoal(goal.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" aria-label={`Delete goal: ${goalTitle(goal)}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default GoalsView;
