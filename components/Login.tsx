import React, { useState } from 'react';
import { LOCAL_STORAGE_KEY_TOKEN } from '../constants';

interface User {
    id: string;
    email: string;
    passwordHash: string; // Storing a mock hash
}

interface LoginProps {
    onLogin: (userId: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLoginView) {
            void handleLogin();
        } else {
            void handleSignup();
        }
    };
    const handleLogin = async () => {
        try {
            const res = await fetch(`${window.location.origin.replace(/:\d+$/, ':5000')}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Invalid credentials');
                return;
            }
            // store token
            localStorage.setItem(LOCAL_STORAGE_KEY_TOKEN, data.token);
            // session user (used by App to namespace keys)
            sessionStorage.setItem('billmitra_current_user', data.user.email);
            onLogin(data.user.email);
        } catch (err) {
            console.error(err);
            setError('Login failed');
        }
    };

    const handleSignup = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        try {
            const res = await fetch(`${window.location.origin.replace(/:\d+$/, ':5000')}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: '', email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Signup failed');
                return;
            }
            // store token & login
            localStorage.setItem(LOCAL_STORAGE_KEY_TOKEN, data.token);
            sessionStorage.setItem('billmitra_current_user', data.user.email);
            onLogin(data.user.email);
        } catch (err) {
            console.error(err);
            setError('Signup failed');
        }
    };
    
    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 sm:p-12 space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-primary">Welcome to BillMitra</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {isLoginView ? 'Sign in to manage your invoices.' : 'Create your account to get started.'}
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={isLoginView ? "current-password" : "new-password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    {!isLoginView && (
                        <div>
                            <label htmlFor="confirm-password"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirm Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                />
                            </div>
                        </div>
                    )}
                    
                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition duration-150"
                        >
                            {isLoginView ? 'Sign in' : 'Create Account'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={toggleView} className="ml-1 font-medium text-primary hover:text-primary-dark focus:outline-none focus:underline">
                             {isLoginView ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};