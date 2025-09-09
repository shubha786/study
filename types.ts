// types.ts

export interface FileState {
    file: File;
    name: string;
    content: string; // base64 encoded
    mimeType: string;
}

// For Flashcards
export interface Flashcard {
    question: string;
    answer: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

// For Quizzes
export interface MCQ {
    type: 'MCQ';
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export interface SubjectiveQuestion {
    type: 'Subjective';
    question: string;
    answer: string;
}

export type Question = MCQ | SubjectiveQuestion;

export interface Quiz {
    title: string;
    questions: Question[];
}

// For Question Paper
export interface PaperQuestion {
    question: string;
    marks: number;
}

export interface QuestionPaper {
    title: string;
    totalMarks: number;
    questions: PaperQuestion[];
}

// Main study set structure
export interface StudySet {
    flashcards: Flashcard[];
    quiz: Quiz;
    summary: string;
    questionPaper: QuestionPaper;
}

// For Study Goals
export type GoalType = 'flashcards' | 'quizzes';
export type GoalFrequency = 'daily' | 'weekly';

export interface StudyGoal {
    id: string;
    type: GoalType;
    target: number;
    frequency: GoalFrequency;
    progress: number;
    lastReset: number; // timestamp
}

// For AI Tutor
export interface TutorMessage {
    role: 'user' | 'model';
    text: string;
}

export type View = 'flashcards' | 'quiz' | 'summary' | 'questionPaper' | 'tutor' | 'goals' | 'profile';
