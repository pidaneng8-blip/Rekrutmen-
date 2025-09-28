import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, ArrowLeftIcon } from './Icons';

interface LoginScreenProps {
    onLogin: () => void;
    onBack: () => void;
}

const COMPANY_PASSWORD = 'BATAVIAHRD';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onBack }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password === COMPANY_PASSWORD) {
            onLogin();
        } else {
            setError('Password yang Anda masukkan salah.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center flex-grow p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                     <h1 className="text-3xl font-bold text-slate-800">Login Perusahaan</h1>
                     <p className="text-slate-500 mt-2">Akses dashboard hasil ujian.</p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 sr-only">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError('');
                                    }}
                                    required
                                    className={`block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none sm:text-sm ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                    placeholder="Masukkan password HRD"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Lihat Dashboard
                        </button>
                    </form>
                </div>
                 <div className="text-center mt-6">
                    <button onClick={onBack} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center w-full">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Kembali ke Halaman Utama
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
