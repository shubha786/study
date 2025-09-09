
import React, { useState, useMemo } from 'react';
import type { Flashcard } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface FlashcardDeckProps {
    cards: Flashcard[];
    onCardReviewed: () => void;
}

type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard';

const difficultyConfig = {
    Easy: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    Medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    Hard: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
};

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards, onCardReviewed }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>('All');
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

    const filteredCards = useMemo(() => {
        const newFilteredCards = difficultyFilter === 'All'
            ? cards
            : cards.filter(card => card.difficulty === difficultyFilter);
        setCurrentIndex(0);
        setIsFlipped(false);
        return newFilteredCards;
    }, [cards, difficultyFilter]);

    const handleSwipe = (direction: 'left' | 'right') => {
        if (filteredCards.length === 0) return;
        
        onCardReviewed(); // Track progress for goals
        
        setSwipeDirection(direction);
        setTimeout(() => {
            setIsFlipped(false);
            setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredCards.length);
            setSwipeDirection(null);
        }, 300);
    };

    const currentCard = filteredCards[currentIndex];
    const cardDifficulty = currentCard?.difficulty || 'Easy';
    const config = difficultyConfig[cardDifficulty];

    if (filteredCards.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-xl shadow-md">
                 <h2 className="text-xl font-semibold text-gray-700">No cards match this difficulty.</h2>
                 <p className="text-gray-500 mt-2">Try selecting another filter or generating a new study set.</p>
                 <div className="mt-6 flex justify-center gap-2">
                    {(['All', 'Easy', 'Medium', 'Hard'] as Difficulty[]).map(level => (
                        <button
                            key={level}
                            onClick={() => setDifficultyFilter(level)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${difficultyFilter === level ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    const getCardTransform = () => {
        if (swipeDirection === 'left') return 'translateX(-150%) rotate(-15deg)';
        if (swipeDirection === 'right') return 'translateX(150%) rotate(15deg)';
        return 'translateX(0) rotate(0)';
    };

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center">
             <div className="mb-6 w-full flex justify-center gap-2">
                {(['All', 'Easy', 'Medium', 'Hard'] as Difficulty[]).map(level => (
                    <button
                        key={level}
                        onClick={() => setDifficultyFilter(level)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${difficultyFilter === level ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {level}
                    </button>
                ))}
            </div>

            <div className="relative w-full h-80" style={{ perspective: '1000px' }}>
                 <div
                    className="absolute w-full h-full transition-transform duration-300 ease-in-out"
                    style={{ transform: getCardTransform() }}
                >
                    <div
                        className={`w-full h-full cursor-pointer rounded-xl shadow-lg border-2 ${config.border} transition-transform duration-500`}
                        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        {/* Front of the card */}
                        <div className="absolute w-full h-full bg-white rounded-xl p-6 flex flex-col justify-between items-center text-center" style={{ backfaceVisibility: 'hidden' }}>
                            <div className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                                {cardDifficulty}
                            </div>
                            <p className="text-2xl font-semibold text-gray-800 flex-grow flex items-center">{currentCard.question}</p>
                            <p className="text-sm text-gray-400">Tap to reveal answer</p>
                        </div>

                        {/* Back of the card */}
                        <div className="absolute w-full h-full bg-white rounded-xl p-6 flex flex-col justify-center items-center text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <p className="text-xl font-medium text-gray-700">{currentCard.answer}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="text-gray-500 font-semibold my-4">{currentIndex + 1} / {filteredCards.length}</p>

            <div className="flex items-center gap-6">
                <button
                    onClick={() => handleSwipe('left')}
                    className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center transition transform hover:scale-110 shadow-md"
                    aria-label="I didn't know this"
                >
                    <ArrowLeftIcon color="text-red-500" />
                </button>
                <button
                    onClick={() => handleSwipe('right')}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center transition transform hover:scale-110 shadow-lg"
                    aria-label="I knew this"
                >
                    <ArrowRightIcon color="text-green-500" />
                </button>
            </div>
        </div>
    );
};

export default FlashcardDeck;
