import React, { useState, useCallback } from 'react';
import LandingScreen from './components/LandingScreen';
import LoginScreen from './components/LoginScreen';
import ExamScreen from './components/ExamScreen';
import DashboardScreen from './components/DashboardScreen';
import { CheckCircleIcon } from './components/Icons';

type View = 'landing' | 'login' | 'exam' | 'submitted';

const App: React.FC = () => {
    const [view, setView] = useState<View>('landing');
    const [isCompanyLoggedIn, setIsCompanyLoggedIn] = useState(false);

    const handleCompanyLogin = useCallback(() => {
        setIsCompanyLoggedIn(true);
    }, []);

    const handleLogout = useCallback(() => {
        setIsCompanyLoggedIn(false);
        setView('landing'); // Go back to landing on logout
    }, []);

    const handleSubmitExam = useCallback(() => {
        setView('submitted');
    }, []);

    const renderContent = () => {
        if (isCompanyLoggedIn) {
            return <DashboardScreen onLogout={handleLogout} />;
        }

        switch (view) {
            case 'landing':
                return <LandingScreen onStartExam={() => setView('exam')} onCompanyLogin={() => setView('login')} />;
            case 'login':
                return <LoginScreen onLogin={handleCompanyLogin} onBack={() => setView('landing')} />;
            case 'exam':
                return <ExamScreen onSubmit={handleSubmitExam} onBack={() => setView('landing')} />;
            case 'submitted':
                 return (
                    <div className="flex flex-col items-center justify-center flex-grow p-4">
                        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg text-center max-w-lg">
                            <div className="flex justify-center items-center mb-4">
                                <CheckCircleIcon className="w-16 h-16 text-blue-500" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Selesai!</h1>
                            <p className="text-slate-600 mb-6">Hasil ujian Anda telah berhasil dikirim. Selanjutnya jawaban Anda akan segera ditinjau oleh perusahaan.</p>
                            <button
                                onClick={() => setView('landing')}
                                className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Kembali ke Halaman Utama
                            </button>
                        </div>
                    </div>
                );
            default:
                return <LandingScreen onStartExam={() => setView('exam')} onCompanyLogin={() => setView('login')} />;
        }
    };

    return (
        <div className="min-h-screen antialiased flex flex-col bg-slate-100">
            <main className="flex-grow flex flex-col">{renderContent()}</main>
            <footer className="text-center p-4 text-sm text-slate-500 border-t border-slate-200">
                MZF@2025 HRD PT. Batavia Alumindo Industri
            </footer>
        </div>
    );
};

export default App;