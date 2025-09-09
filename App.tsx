import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './services/firebase';

// Components
import FileUpload from './components/FileUpload';
import FlashcardDeck from './components/FlashcardDeck';
import QuizView from './components/QuizView';
import SummaryView from './components/SummaryView';
import QuestionPaperView from './components/QuestionPaperView';
import TutorView from './components/TutorView';
import GoalsView from './components/GoalsView';
import ProfileView from './components/ProfileView';
import Loader from './components/Loader';
import ErrorToast from './components/ErrorToast';
import GoalCompletionToast from './components/GoalCompletionToast';
import AuthPage from './components/AuthPage';

// Icons
import LogoIcon from './components/icons/LogoIcon';
import ResetIcon from './components/icons/ResetIcon';
import CardsIcon from './components/icons/CardsIcon';
import QuizIcon from './components/icons/QuizIcon';
import SummaryIcon from './components/icons/SummaryIcon';
import PaperIcon from './components/icons/PaperIcon';
import TutorIcon from './components/icons/TutorIcon';
import GoalsIcon from './components/icons/GoalsIcon';
import ProfileIcon from './components/icons/ProfileIcon';
import MoreIcon from './components/icons/MoreIcon';

// Services & Types
import { generateStudySet, initializeTutorChat } from './services/geminiService';
import { fetchGoals, addGoal, deleteGoal, updateGoalProgress } from './services/firestoreService';
import type { FileState, StudySet, View, StudyGoal } from './types';

// Hook to check screen size
const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);
    useEffect(() => {
        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [query]);
    return matches;
};

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [fileState, setFileState] = useState<FileState | null>(null);
    const [studySet, setStudySet] = useState<StudySet | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<View>('flashcards');
    const [goals, setGoals] = useState<StudyGoal[]>([]);
    const [completedGoal, setCompletedGoal] = useState<StudyGoal | null>(null);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const isDesktop = useMediaQuery('(min-width: 640px)');

    // --- Effects ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            fetchGoals(user.uid).then(setGoals);
        } else {
            setGoals([]);
        }
    }, [user]);
    
    // --- Handlers ---
    const handleFileSubmit = async (file: FileState) => {
        setIsLoading(true);
        setError(null);
        setStudySet(null);
        setFileState(file);
        try {
            const result = await generateStudySet(file);
            setStudySet(result);
            initializeTutorChat(result.summary);
            setCurrentView('flashcards');
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFileState(null);
        setStudySet(null);
        setError(null);
    };

    const handleLogout = async () => {
        await signOut(auth);
        handleReset();
    };

    const handleViewChange = (view: View) => {
        setCurrentView(view);
        setIsMoreMenuOpen(false);
    }
    
    // --- Goal Management ---
    const handleAddGoal = useCallback(async (goalData: Omit<StudyGoal, 'id' | 'progress' | 'lastReset'>) => {
        if (!user) return;
        const newGoal = await addGoal(user.uid, goalData);
        setGoals(prev => [...prev, newGoal]);
    }, [user]);

    const handleDeleteGoal = useCallback(async (id: string) => {
        if (!user) return;
        await deleteGoal(user.uid, id);
        setGoals(prev => prev.filter(g => g.id !== id));
    }, [user]);

    const handleProgressUpdate = useCallback((type: 'flashcards' | 'quizzes') => {
        if (!user) return;
        setGoals(prevGoals => {
            const updatedGoals = prevGoals.map(goal => {
                if (goal.type === type) {
                    const newProgress = goal.progress + 1;
                    if (newProgress >= goal.target && goal.progress < goal.target) {
                        setCompletedGoal(goal);
                    }
                    updateGoalProgress(user.uid, goal.id, newProgress);
                    return { ...goal, progress: newProgress };
                }
                return goal;
            });
            return updatedGoals;
        });
    }, [user]);

    // --- Render Logic ---
    const renderContent = () => {
        if (isLoading) return <Loader message="Generating your personalized study set..." />;
        if (!studySet) return <FileUpload onSubmit={handleFileSubmit} />;

        switch (currentView) {
            case 'flashcards': return <FlashcardDeck cards={studySet.flashcards} onCardReviewed={() => handleProgressUpdate('flashcards')} />;
            case 'quiz': return <QuizView quiz={studySet.quiz} onQuizCompleted={() => handleProgressUpdate('quizzes')} />;
            case 'summary': return <SummaryView summary={studySet.summary} />;
            case 'questionPaper': return <QuestionPaperView questionPaper={studySet.questionPaper} />;
            case 'tutor': return <TutorView />;
            case 'goals': return <GoalsView goals={goals} onAddGoal={handleAddGoal} onDeleteGoal={handleDeleteGoal} />;
            case 'profile': return <ProfileView user={user!} onLogout={handleLogout} />;
            default: return null;
        }
    };

    const mainNavItems: { view: View; label: string; icon: React.ReactNode }[] = [
        { view: 'flashcards', label: 'Flashcards', icon: <CardsIcon /> },
        { view: 'quiz', label: 'Quiz', icon: <QuizIcon /> },
        { view: 'summary', label: 'Summary', icon: <SummaryIcon /> },
        { view: 'tutor', label: 'AI Tutor', icon: <TutorIcon /> },
    ];
    
    const moreNavItems: { view: View; label: string; icon: React.ReactNode }[] = [
        { view: 'questionPaper', label: 'Exam', icon: <PaperIcon /> },
        { view: 'goals', label: 'Goals', icon: <GoalsIcon /> },
        { view: 'profile', label: 'Profile', icon: <ProfileIcon /> },
    ];
    
    const allNavItems = [...mainNavItems, ...moreNavItems];

    if (authLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader message="Loading..." /></div>;
    if (!user) return <AuthPage />;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
            {/* Header (Desktop and Mobile) */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <LogoIcon />
                        <h1 className="text-xl font-bold text-gray-800">StudyAI</h1>
                    </div>
                    {studySet && (
                        <div className="flex items-center gap-4">
                            <p className="hidden sm:block text-sm font-medium text-gray-600 truncate max-w-xs">{fileState?.name}</p>
                            <button onClick={handleReset} className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Generate new study set">
                                <ResetIcon />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 flex flex-col sm:flex-row">
                {/* Desktop Sidebar Navigation */}
                {isDesktop && studySet && (
                    <nav className="w-64 bg-white border-r border-gray-200 p-4">
                        <ul className="space-y-2">
                            {allNavItems.map(item => (
                                <li key={item.view}>
                                    <button onClick={() => handleViewChange(item.view)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${currentView === item.view ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                                        {item.icon} {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 pb-24 sm:pb-6">
                    <div className="flex justify-center">
                        {renderContent()}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Tab Bar */}
            {!isDesktop && studySet && (
                <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
                    <nav className="flex justify-around items-center h-16">
                        {mainNavItems.map(item => (
                            <button key={item.view} onClick={() => handleViewChange(item.view)} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${currentView === item.view ? 'text-indigo-600' : 'text-gray-500'}`}>
                                {item.icon}
                                <span className="text-xs font-medium mt-1">{item.label}</span>
                            </button>
                        ))}
                        <div className="relative">
                             <button onClick={() => setIsMoreMenuOpen(prev => !prev)} className={`flex flex-col items-center justify-center w-full h-full px-4 transition-colors ${isMoreMenuOpen ? 'text-indigo-600' : 'text-gray-500'}`}>
                                <MoreIcon />
                                <span className="text-xs font-medium mt-1">More</span>
                            </button>
                            {isMoreMenuOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100">
                                    <ul className="py-2">
                                        {moreNavItems.map(item => (
                                            <li key={item.view}>
                                                <button onClick={() => handleViewChange(item.view)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                    {item.icon} {item.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </nav>
                </footer>
            )}

            <ErrorToast message={error} onDismiss={() => setError(null)} />
            {completedGoal && <GoalCompletionToast goal={completedGoal} onDismiss={() => setCompletedGoal(null)} />}
        </div>
    );
}

export default App;
