import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { questions, totalMcQuestions } from '../constants';
import { CandidateResult, MultipleChoiceQuestion, EssayQuestion } from '../types';
import ConfirmationModal from './ConfirmationModal';
import AlertModal from './AlertModal';
import { ArrowLeftIcon } from './Icons';

interface ExamScreenProps {
    onSubmit: () => void;
    onBack: () => void;
}

const ExamScreen: React.FC<ExamScreenProps> = ({ onSubmit, onBack }) => {
    const [mcAnswers, setMcAnswers] = useState<{ [key: number]: string }>({});
    const [essayAnswers, setEssayAnswers] = useState<{ [key: number]: string }>({});
    const [candidateName, setCandidateName] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [address, setAddress] = useState('');
    const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 minutes in seconds
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isBackConfirmModalOpen, setIsBackConfirmModalOpen] = useState(false);
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const mcQuestions = useMemo(() => questions.filter((q) => q.type === 'multiple-choice') as MultipleChoiceQuestion[], []);
    const essayQuestions = useMemo(() => questions.filter((q) => q.type === 'essay') as EssayQuestion[], []);
    
    const isSubmitted = useRef(false);

    const handleMcChange = useCallback((questionId: number, answer: string) => {
        setMcAnswers(prev => ({ ...prev, [questionId]: answer }));
    }, []);

    const handleEssayChange = useCallback((questionId: number, answer: string) => {
        setEssayAnswers(prev => ({ ...prev, [questionId]: answer }));
    }, []);

    const performSubmit = useCallback(async () => {
        if (isSubmitted.current || isSubmitting) return;
        
        setIsSubmitting(true);
        isSubmitted.current = true;

        let score = 0;
        let correctAnswersCount = 0;
        mcQuestions.forEach(q => {
            if (mcAnswers[q.id] === q.answer) {
                score += 4;
                correctAnswersCount++;
            }
        });

        const incorrectAnswersCount = totalMcQuestions - correctAnswersCount;
        const totalPossibleScore = totalMcQuestions * 4;

        const resultPayload: Omit<CandidateResult, 'id' | 'submissionDate'> = {
            name: candidateName || "Kandidat",
            email,
            whatsapp,
            address,
            multipleChoiceAnswers: mcAnswers,
            essayAnswers: essayAnswers,
            score,
            totalPossibleScore,
            correctAnswersCount,
            incorrectAnswersCount,
        };
        
        try {
            const response = await fetch('http://localhost:3001/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resultPayload),
            });

            if (!response.ok) {
                throw new Error('Gagal mengirimkan jawaban ke server.');
            }
            
            onSubmit();

        } catch (error) {
            console.error('Submission error:', error);
            setAlertModal({
                isOpen: true,
                title: 'Gagal Mengirim',
                message: 'Terjadi kesalahan saat mengirim jawaban Anda. Silakan periksa koneksi internet Anda dan coba lagi, atau hubungi HRD.',
            });
            isSubmitted.current = false; // Allow re-submission
        } finally {
            setIsSubmitting(false);
        }

    }, [candidateName, email, whatsapp, address, mcAnswers, essayAnswers, mcQuestions, onSubmit, totalMcQuestions, isSubmitting]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (!isSubmitted.current) {
                        setAlertModal({
                            isOpen: true,
                            title: 'Waktu Habis!',
                            message: 'Jawaban Anda akan dikirimkan secara otomatis.'
                        });
                        setTimeout(performSubmit, 2000); 
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [performSubmit]);

    const handleFormSubmitEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!candidateName.trim() || !email.trim() || !whatsapp.trim() || !address.trim()) {
            setAlertModal({ 
                isOpen: true, 
                title: 'Data Diri Belum Lengkap',
                message: 'Harap lengkapi semua kolom data diri Anda sebelum melanjutkan.' 
            });
            return;
        }

        const allMcAnswered = mcQuestions.every(q => mcAnswers[q.id]);
        const allEssayAnswered = essayQuestions.every(q => essayAnswers[q.id] && essayAnswers[q.id].trim() !== '');

        if (!allMcAnswered || !allEssayAnswered) {
             setConfirmationMessage('Beberapa pertanyaan masih kosong. Apakah Anda yakin ingin mengirimkan jawaban Anda?');
        } else {
            setConfirmationMessage('Apakah Anda yakin ingin mengirimkan jawaban Anda? Anda tidak dapat mengubahnya lagi setelah ini.');
        }

        setIsConfirmModalOpen(true);
    };

    const handleConfirmAndSubmit = () => {
        setIsConfirmModalOpen(false);
        performSubmit();
    };

    const groupedMcQuestions = useMemo(() => {
        // Fix: A category might be undefined, which is not a valid object key in TypeScript.
        // Provide a default value to ensure the key is always a string.
        // This resolves a type inference issue that caused the 'qs' variable later on to be 'unknown'.
        return mcQuestions.reduce((acc, q) => {
            const category = q.category || 'Uncategorized';
            (acc[category] = acc[category] || []).push(q);
            return acc;
        }, {} as Record<string, MultipleChoiceQuestion[]>);
    }, [mcQuestions]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="">
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
                title={alertModal.title}
                message={alertModal.message}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmAndSubmit}
                title="Konfirmasi Pengiriman Jawaban"
                message={confirmationMessage || 'Apakah Anda yakin ingin mengirimkan jawaban Anda? Anda tidak dapat mengubahnya lagi setelah ini.'}
                confirmText="Ya, Kirim Jawaban"
            />
             <ConfirmationModal
                isOpen={isBackConfirmModalOpen}
                onClose={() => setIsBackConfirmModalOpen(false)}
                onConfirm={onBack}
                title="Kembali ke Halaman Utama?"
                message="Jika Anda kembali, semua jawaban yang telah diisi akan hilang. Apakah Anda yakin ingin melanjutkan?"
                confirmText="Ya, Kembali"
                confirmButtonVariant="danger"
            />
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:justify-between items-center gap-4 sm:gap-0">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsBackConfirmModalOpen(true)}
                            className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 p-2 rounded-md hover:bg-slate-100 transition-colors"
                            aria-label="Kembali ke halaman utama"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900 text-center sm:text-left">Ujian Rekrutmen</h1>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-sm text-slate-500">Sisa Waktu</p>
                        <p className={`text-2xl font-bold tabular-nums ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </p>
                    </div>
                </div>
            </header>
            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleFormSubmitEvent} className="space-y-12">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-3">Data Diri Kandidat</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label htmlFor="candidateName" className="block text-sm font-medium text-slate-700">Nama Lengkap <span className="text-red-500">*</span></label>
                                <input id="candidateName" type="text" value={candidateName} onChange={e => setCandidateName(e.target.value)} required placeholder="Masukkan nama lengkap Anda" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Aktif <span className="text-red-500">*</span></label>
                                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="contoh@email.com" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700">Nomor WhatsApp Aktif <span className="text-red-500">*</span></label>
                                <input id="whatsapp" type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required placeholder="08xxxxxxxxxx" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-slate-700">Alamat Lengkap <span className="text-red-500">*</span></label>
                                <textarea id="address" rows={3} value={address} onChange={e => setAddress(e.target.value)} required placeholder="Masukkan alamat lengkap Anda" className="mt-1 w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"></textarea>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 border-b pb-2 mb-6">I. Soal Pilihan Ganda</h2>
                        {Object.entries(groupedMcQuestions).map(([category, qs]) => (
                            <div key={category} className="mb-8">
                                <h3 className="text-lg font-semibold text-slate-700 mb-4">{category}</h3>
                                {qs.map((q) => (
                                    <div key={q.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
                                        <p className="font-medium text-slate-800 mb-4">{q.id}. {q.question}</p>
                                        <div className="space-y-3">
                                            {Object.entries(q.options).map(([key, value]) => (
                                                <label key={key} className="flex items-center p-2 sm:p-3 rounded-md hover:bg-slate-50 cursor-pointer transition-colors">
                                                    <input
                                                        type="radio"
                                                        name={`question-${q.id}`}
                                                        value={key}
                                                        onChange={() => handleMcChange(q.id, key)}
                                                        checked={mcAnswers[q.id] === key}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                                    />
                                                    <span className="ml-3 text-sm text-slate-700">({key}) {value}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div>
                         <h2 className="text-2xl font-bold text-slate-800 border-b pb-2 mb-6">II. Soal Esai</h2>
                         <div className="space-y-6">
                            {essayQuestions.map((q, index) => (
                                <div key={q.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                                    <label htmlFor={`question-essay-${q.id}`} className="block font-medium text-slate-800 mb-2">
                                        {index + 1}. {q.question}
                                    </label>
                                    <textarea
                                        id={`question-essay-${q.id}`}
                                        rows={5}
                                        className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="Tulis jawaban Anda di sini..."
                                        value={essayAnswers[q.id] || ''}
                                        onChange={(e) => handleEssayChange(q.id, e.target.value)}
                                    />
                                </div>
                            ))}
                         </div>
                    </div>
                    
                    <div className="pt-6">
                         <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-lg disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Mengirim...' : 'Kirim Jawaban'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ExamScreen;