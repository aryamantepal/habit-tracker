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

    const handleGoogleLogin = async () => {
        setLoading(true);
        setMessage('');
        setIsError(false);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: typeof window !== 'undefined' ? window.location.origin : '',
            },
        });
        if (error) {
            setMessage(error.message);
            setIsError(true);
            setLoading(false);
        }
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

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-stone-200 dark:border-stone-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-stone-900 px-2 text-stone-500 dark:text-stone-400">Or continue with</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 font-medium py-2.5 rounded-lg transition-all duration-200 text-sm disabled:opacity-50"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                            fill="#EA4335"
                            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.37 0 3.393 2.673 1.51 6.577l3.756 3.188z"
                        />
                        <path
                            fill="#34A853"
                            d="M16.04 15.345c-1.077.733-2.433 1.164-4.04 1.164-3.136 0-5.836-2.118-6.782-4.973L1.445 14.73C3.305 18.59 7.332 21.273 12 21.273c3.082 0 5.864-1.018 7.89-2.764l-3.85-3.164z"
                        />
                        <path
                            fill="#4285F4"
                            d="M23.49 12.273c0-.818-.082-1.609-.218-2.382H12v4.518h6.464a5.532 5.532 0 0 1-2.4 3.636l3.85 3.164c2.254-2.082 3.576-5.145 3.576-8.936z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.218 11.536A7.054 7.054 0 0 1 5.218 8.8l-3.756-3.188A11.96 11.96 0 0 0 0 12c0 2.29.645 4.436 1.764 6.273l3.454-2.836a7.11 7.11 0 0 1-.3-3.9z"
                        />
                    </svg>
                    Google
                </button>

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
