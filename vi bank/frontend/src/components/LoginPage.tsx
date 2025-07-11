// In src/components/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useApp();
    const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();

    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPassword, setCustomerPassword] = useState('');

    // --- THIS IS THE FIX for Agent Login ---
    // This logic is now greatly simplified.
    useEffect(() => {
        // When listening stops and we have a transcript...
        if (!isListening && transcript) {
            const agentName = transcript.trim();
            // If the name is not empty...
            if (agentName) {
                // Create a temporary agent user object. No backend call needed.
                const agentUser = {
                    name: agentName,
                    // Create a fake but unique email for the context
                    email: `${agentName.toLowerCase().replace(/\s/g, '')}@vibank.agent`,
                    role: 'agent' as const, // Set role to agent
                };
                // Log the user in and navigate to the dashboard.
                login(agentUser);
                navigate('/agent-dashboard');
            }
            // Clear the transcript for the next attempt.
            resetTranscript();
        }
    }, [isListening, transcript, login, navigate, resetTranscript]);

    // --- THIS IS THE FIX for Customer Login ---
    // This function will now perform a "mock" login without calling a real backend.
    // This prevents any "trouble connecting" errors for the demo.
    const handleCustomerLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        // You can add more complex validation here if needed
        if (customerEmail && customerPassword) {
            const customerUser = {
                name: 'Hemanth Reddy', // You can use a fixed name or derive from email
                email: customerEmail,
                role: 'customer' as const,
            };
            login(customerUser);
            navigate('/customer-dashboard');
        }
    };

    // Spacebar listener for voice login
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !isListening) {
                e.preventDefault();
                startListening();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space' && isListening) {
                stopListening();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isListening, startListening, stopListening]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <div className="w-full max-w-4xl flex flex-col items-center gap-8">
                {/* Customer Login Form */}
                <div className="w-full max-w-md bg-blue-900/50 backdrop-blur-sm p-8 rounded-2xl border border-blue-700">
                    <form onSubmit={handleCustomerLogin}>
                        <div className="text-center mb-6">
                            <span className="text-5xl text-green-400">👥</span>
                            <h2 className="text-3xl font-bold mt-2">Customer Login</h2>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Email</label>
                            <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600" />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-1">Password</label>
                            <input type="password" value={customerPassword} onChange={(e) => setCustomerPassword(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600" />
                        </div>
                        <button type="submit" className="w-full p-3 bg-green-600 rounded-lg font-bold">
                            Login as Customer
                        </button>
                    </form>
                </div>

                {/* Agent Voice Login Section */}
                <div className="w-full max-w-md text-center p-6 rounded-2xl border-dashed border-2 border-yellow-500">
                    <h2 className="text-2xl font-bold">Agent Voice Login</h2>
                    <p className="text-yellow-300 mt-2">Hold <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border rounded-lg">Spacebar</kbd> and say your name.</p>
                    <div className="mt-4 text-5xl">
                        <span className={isListening ? 'animate-pulse' : ''}>🎙️</span>
                    </div>
                    {/* The error message display has been removed */}
                </div>
            </div>
            <p className="mt-8 text-center text-gray-300">
                New Customer? <Link to="/signup" className="font-semibold text-green-400 hover:underline">Create an Account</Link>
            </p>
        </div>
    );
};

export default LoginPage;