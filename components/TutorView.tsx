
import React, { useState, useEffect, useRef } from 'react';
import { getTutorResponseStream } from '../services/geminiService';
import type { TutorMessage } from '../types';
import SendIcon from './icons/SendIcon';
import StopIcon from './icons/StopIcon';
import LogoIcon from './icons/LogoIcon';

const TutorView: React.FC = () => {
    const [messages, setMessages] = useState<TutorMessage[]>([
        { role: 'model', text: "Hello! I'm your AI tutor. Ask me anything about your study material." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamController = useRef<{ abort: () => void } | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleStop = () => {
        if (streamController.current) {
            streamController.current.abort();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const newUserMessage: TutorMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, newUserMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        setError(null);

        let shouldContinue = true;
        streamController.current = {
            abort: () => {
                shouldContinue = false;
                setIsLoading(false);
                streamController.current = null;
            }
        };
        
        try {
            const stream = await getTutorResponseStream(currentInput);
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                if (!shouldContinue) {
                    console.log("Stream stopped by user.");
                    break;
                }
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.role === 'model') {
                        lastMessage.text = modelResponse;
                    }
                    return newMessages;
                });
            }
        } catch (err: any) {
            console.error("Error from tutor stream:", err);
            setError("Sorry, I couldn't get a response. Please try again.");
            setMessages(prev => {
                // Remove the empty model message placeholder if an error occurred
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'model' && lastMessage.text === '') {
                    return prev.slice(0, -1);
                }
                return prev;
            });
        } finally {
            if (shouldContinue) {
                setIsLoading(false);
                streamController.current = null;
            }
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto h-[75vh] flex flex-col bg-white rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 text-center p-4 border-b">AI Tutor</h2>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                                <LogoIcon />
                            </div>
                        )}
                        <div className={`max-w-md p-3 rounded-2xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-lg' : 'bg-gray-100 text-gray-800 rounded-bl-lg'}`}>
                             {msg.text || <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse rounded-sm"></span>}
                        </div>
                    </div>
                ))}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-white rounded-b-xl">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about your document..."
                        className="w-full p-3 pr-20 border-2 border-gray-200 rounded-full focus:ring-indigo-500 focus:border-indigo-500 transition"
                        disabled={isLoading}
                    />
                    <div className="absolute right-2 flex items-center">
                        {isLoading ? (
                            <button type="button" onClick={handleStop} className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600 transition" aria-label="Stop generating">
                                <StopIcon />
                            </button>
                        ) : (
                            <button type="submit" disabled={!input.trim()} className="p-2 text-white bg-indigo-500 rounded-full hover:bg-indigo-600 disabled:bg-gray-300 transition" aria-label="Send message">
                                <SendIcon />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TutorView;
