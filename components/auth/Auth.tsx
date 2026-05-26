'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        if (isSignUp) {
            const { error, data } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                setMessage(error.message);
                setIsError(true);
            } else if (data?.user && data.session === null) {
                // Supabase by default requires email verification
                setMessage('Verification email sent! Please check your inbox.');
                setIsError(false);
            } else {
                setMessage('Signed up successfully!');
                setIsError(false);
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setMessage(error.message);
                setIsError(true);
            }
        }
        setLoading(false);
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 p-4 transition-colors duration-200">
            <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-xl p-8 border border-stone-200 dark:border-stone-800">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-stone-500 dark:text-stone-400 text-sm">
                        {isSignUp ? 'Sign up to track and sync your habits' : 'Sign in to sync your habits across devices'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                            Email address
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                                <Mail className="w-4 h-4" />
                            </span>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-stone-400 focus:border-transparent outline-none transition-all bg-stone-50 dark:bg-stone-950 focus:bg-white dark:focus:bg-stone-900 text-sm text-stone-900 dark:text-stone-100"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                                <Lock className="w-4 h-4" />
                            </span>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-stone-400 focus:border-transparent outline-none transition-all bg-stone-50 dark:bg-stone-950 focus:bg-white dark:focus:bg-stone-900 text-sm text-stone-900 dark:text-stone-100"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            isSignUp ? 'Sign Up' : 'Sign In'
                        )}
                    </button>
                </form>



                <div className="mt-6 text-center text-sm">
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setMessage('');
                            setIsError(false);
                        }}
                        className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline font-medium"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>

                {message && (
                    <div className={`mt-6 p-3 rounded-lg text-xs text-center border ${
                        isError 
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50' 
                            : 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50'
                    }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
