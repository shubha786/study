import React, { useEffect, useState } from 'react';
import ErrorIcon from './icons/ErrorIcon';

interface ErrorToastProps {
    message: string;
    onDismiss: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                // Allow time for fade-out animation before calling onDismiss
                setTimeout(onDismiss, 500);
            }, 5000);

            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [message, onDismiss]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 500);
    };

    if (!message) return null;

    return (
        <div
            className={`fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-sm p-4 bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            role="alert"
            aria-live="assertive"
        >
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <ErrorIcon />
                </div>
                <div>
                    <p className="font-bold text-gray-800">An Error Occurred</p>
                    <p className="text-sm text-gray-600">{message}</p>
                </div>
                <button onClick={handleDismiss} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" aria-label="Dismiss notification">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ErrorToast;
