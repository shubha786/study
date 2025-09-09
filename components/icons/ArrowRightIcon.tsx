
import React from 'react';

const ArrowRightIcon: React.FC<{ color?: string }> = ({ color = 'text-gray-800' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export default ArrowRightIcon;
