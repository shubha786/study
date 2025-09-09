// services/geminiService.ts

// FIX: Replaced non-existent `GenerateContentStreamResult` with `GenerateContentResponse`.
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import type { FileState, StudySet } from '../types';

const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set. Please ensure it is configured in your environment.");
}
const ai = new GoogleGenAI({ apiKey });

const studySetSchema = {
    type: Type.OBJECT,
    properties: {
        flashcards: {
            type: Type.ARRAY,
            description: "A list of flashcards. Each flashcard should have a question, a concise answer, and a difficulty level ('Easy', 'Medium', or 'Hard'). Aim for 10-20 flashcards.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The question or term on the front of the flashcard." },
                    answer: { type: Type.STRING, description: "The answer or definition on the back of the flashcard." },
                    difficulty: { type: Type.STRING, description: "Difficulty level: 'Easy', 'Medium', or 'Hard'." }
                },
                required: ["question", "answer", "difficulty"]
            }
        },
        quiz: {
            type: Type.OBJECT,
            description: "A quiz with a title and a mix of 5-10 Multiple Choice (MCQ) and Subjective questions.",
            properties: {
                title: { type: Type.STRING, description: "A suitable title for the quiz based on the document's content." },
                questions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, description: "Either 'MCQ' or 'Subjective'." },
                            question: { type: Type.STRING, description: "The question text." },
                            options: { type: Type.ARRAY, description: "For MCQ type: An array of 4 option strings.", items: { type: Type.STRING } },
                            answer: { type: Type.STRING, description: "The correct answer. For MCQ, it must be one of the options. For Subjective, it's a model answer." },
                            explanation: { type: Type.STRING, description: "For MCQ type: A brief explanation for the correct answer." }
                        },
                        required: ["type", "question", "answer"]
                    }
                }
            },
            required: ["title", "questions"]
        },
        summary: {
            type: Type.STRING,
            description: "A concise, well-structured summary of the key concepts, definitions, and important points from the document. Use markdown for formatting (e.g., headings, bold text, lists)."
        },
        questionPaper: {
            type: Type.OBJECT,
            description: "A mock question paper with a title, total marks, and a list of questions with marks assigned to each.",
            properties: {
                title: { type: Type.STRING, description: "Title for the question paper." },
                totalMarks: { type: Type.NUMBER, description: "The total marks for the paper." },
                questions: {
                    type: Type.ARRAY,
                    description: "A list of questions for the paper.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING, description: "The question text." },
                            marks: { type: Type.NUMBER, description: "Marks allotted to the question." }
                        },
                        required: ["question", "marks"]
                    }
                }
            },
            required: ["title", "totalMarks", "questions"]
        }
    },
    required: ["flashcards", "quiz", "summary", "questionPaper"]
};

export const generateStudySet = async (fileState: FileState): Promise<StudySet> => {
    try {
        const model = 'gemini-2.5-flash';
        
        const filePart = {
            inlineData: {
                data: fileState.content,
                mimeType: fileState.mimeType,
            },
        };

        const prompt = `Based on the provided document ("${fileState.name}"), generate a comprehensive study set. The set should include:
1.  Flashcards: Create 10-20 flashcards covering key terms, concepts, and definitions.
2.  Quiz: Design a quiz with a mix of 5-10 multiple-choice and subjective questions to test understanding.
3.  Summary: Provide a concise summary of the document's main points.
4.  Question Paper: Create a mock question paper with marks for each question.

Return the entire study set in a single JSON object matching the provided schema.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [filePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: studySetSchema,
            },
        });

        const jsonText = response.text.trim();
        const studySetData: StudySet = JSON.parse(jsonText);
        
        if (!studySetData.flashcards || !studySetData.quiz || !studySetData.summary || !studySetData.questionPaper) {
            throw new Error("Generated data is missing one or more required fields.");
        }

        return studySetData;

    } catch (error) {
        console.error("Error generating study set:", error);
        if (error instanceof Error) {
            if (error.message.includes('SAFETY')) {
                 throw new Error("The content could not be processed due to safety settings. Please try with a different document.");
            }
            throw new Error(`Failed to generate study materials. Please check the document and try again. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating study materials.");
    }
};

let chatSession: Chat | null = null;

export const initializeTutorChat = (studyContext: string) => {
    const systemInstruction = `You are an expert AI tutor. Your role is to help the user understand their study material. The user has uploaded a document, and here is its summary:\n\n---\n${studyContext}\n---\n\nAnswer the user's questions based on this context. Be helpful, encouraging, and clear in your explanations. If a question is outside the scope of the document, politely state that you can only answer questions related to the provided material.`;

    chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        },
    });
};

// FIX: Updated return type to use `AsyncGenerator<GenerateContentResponse>` for the stream.
export const getTutorResponseStream = async (newMessage: string): Promise<AsyncGenerator<GenerateContentResponse>> => {
    if (!chatSession) {
        // Fallback initialization if tutor is accessed before a document is processed.
        initializeTutorChat("General knowledge. The user hasn't uploaded a document yet, but be a helpful tutor.");
    }
    // FIX: Added non-null assertion as chatSession is guaranteed to be initialized.
    return await chatSession!.sendMessageStream({ message: newMessage });
};
