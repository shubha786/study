import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import LogoIcon from './icons/LogoIcon';

type AuthMode = 'login' | 'signup' | 'forgot';

const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
            } else if (mode === 'signup') {
                await createUserWithEmailAndPassword(auth, email, password);
            } else if (mode === 'forgot') {
                await sendPasswordResetEmail(auth, email);
                setMessage('Password reset email sent! Please check your inbox.');
            }
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsLoading(false);
        }
    };

    const renderForm = () => {
        switch (mode) {
            case 'forgot':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-800">Reset Password</h2>
                        <p className="text-center text-gray-500 mb-6 text-sm">Enter your email to receive a reset link.</p>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50" type="submit" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </>
                );
            default: // login and signup
                return (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-800">{mode === 'login' ? 'Welcome Back!' : 'Create an Account'}</h2>
                        <p className="text-center text-gray-500 mb-6 text-sm">{mode === 'login' ? 'Sign in to continue to StudyAI.' : 'Get started with your personal study assistant.'}</p>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50" type="submit" disabled={isLoading}>
                            {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                        </button>
                    </>
                );
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center items-center gap-3 mb-6">
                    <LogoIcon />
                    <h1 className="text-3xl font-bold text-gray-800">StudyAI</h1>
                </div>
                <div className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
                    <form onSubmit={handleAuthAction}>
                        {renderForm()}
                        {error && <p className="text-red-500 text-xs italic mt-4 text-center">{error}</p>}
                        {message && <p className="text-green-500 text-xs italic mt-4 text-center">{message}</p>}
                    </form>
                </div>
                <div className="text-center">
                    {mode === 'login' && <p className="text-sm text-gray-600">Don't have an account? <button onClick={() => { setMode('signup'); setError(null); }} className="font-bold text-indigo-600 hover:text-indigo-800">Sign Up</button></p>}
                    {mode === 'signup' && <p className="text-sm text-gray-600">Already have an account? <button onClick={() => { setMode('login'); setError(null); }} className="font-bold text-indigo-600 hover:text-indigo-800">Sign In</button></p>}
                    {mode !== 'forgot' && <button onClick={() => { setMode('forgot'); setError(null); }} className="text-xs text-gray-500 hover:text-indigo-700 mt-2">Forgot Password?</button>}
                    {mode === 'forgot' && <button onClick={() => { setMode('login'); setError(null); setMessage(null); }} className="text-xs text-gray-500 hover:text-indigo-700 mt-2">Back to Sign In</button>}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
