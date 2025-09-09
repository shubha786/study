// services/firestoreService.ts
import { db } from './firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import type { StudyGoal, GoalType, GoalFrequency } from '../types';

const getGoalsCollection = (userId: string) => collection(db, 'users', userId, 'goals');

export const fetchGoals = async (userId: string): Promise<StudyGoal[]> => {
    const goalsCollection = getGoalsCollection(userId);
    const snapshot = await getDocs(goalsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyGoal));
};

export const addGoal = async (userId: string, goalData: Omit<StudyGoal, 'id' | 'progress' | 'lastReset'>): Promise<StudyGoal> => {
    const newGoalData = {
        ...goalData,
        progress: 0,
        lastReset: Date.now(),
    };
    const goalsCollection = getGoalsCollection(userId);
    const docRef = await addDoc(goalsCollection, newGoalData);
    return { id: docRef.id, ...newGoalData };
};

export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
    const goalDoc = doc(db, 'users', userId, 'goals', goalId);
    await deleteDoc(goalDoc);
};

export const updateGoalProgress = async (userId: string, goalId: string, newProgress: number): Promise<void> => {
    const goalDoc = doc(db, 'users', userId, 'goals', goalId);
    await updateDoc(goalDoc, { progress: newProgress });
};
