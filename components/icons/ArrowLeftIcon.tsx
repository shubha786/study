
import React from 'react';

const ArrowLeftIcon: React.FC<{ color?: string }> = ({ color = 'text-gray-800' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default ArrowLeftIcon;
