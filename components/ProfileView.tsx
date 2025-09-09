import React from 'react';
import type { User } from 'firebase/auth';
import LogoutIcon from './icons/LogoutIcon';

interface ProfileViewProps {
    user: User;
    onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
    return (
        <div className="w-full max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Your Profile</h2>
            <div className="space-y-4">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <span className="text-lg font-semibold text-gray-800">{user.email}</span>
                </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">User UID</span>
                    <span className="text-xs font-mono text-gray-600 bg-gray-100 p-2 rounded">{user.uid}</span>
                </div>
            </div>
            <div className="mt-10 text-center">
                <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl"
                >
                    <LogoutIcon />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default ProfileView;
