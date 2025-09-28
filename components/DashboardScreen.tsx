import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CandidateResult } from '../types';
import { essayQuestions } from '../constants';
import { LogoutIcon, ChevronDownIcon, DocumentTextIcon, CheckBadgeIcon, SparklesIcon, LightBulbIcon, InboxIcon } from './Icons';

interface DashboardScreenProps {
    onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onLogout }) => {
    const [results, setResults] = useState<CandidateResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:3001/results');
                if (!response.ok) {
                    throw new Error('Gagal mengambil data hasil ujian.');
                }
                const data: CandidateResult[] = await response.json();
                setResults(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Terjadi kesalahan yang tidak diketahui.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, []);

    const essayQuestionsById = useMemo(() => {
        return essayQuestions.reduce((acc, q) => {
            acc[q.id] = q.question;
            return acc;
        }, {} as { [key: number]: string });
    }, []);

    const toggleCandidateDetails = (candidateId: string) => {
        setExpandedCandidateId(prevId => (prevId === candidateId ? null : candidateId));
    };

    const renderContent = () => {
        if (isLoading) {
             return (
                <div className="space-y-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            );
        }
        if (error) {
            return <div className="text-center p-10 text-red-600 bg-white rounded-xl border border-red-200">Error: {error}</div>;
        }
        if (results.length === 0) {
            return <EmptyState />;
        }
        return (
            <div className="space-y-4">
                {results.map((res) => (
                    <CandidateCard 
                        key={res.id}
                        result={res}
                        isExpanded={expandedCandidateId === res.id}
                        onToggleExpand={() => toggleCandidateDetails(res.id)}
                        essayQuestionsById={essayQuestionsById}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Hasil Ujian</h1>
                    <button
                        onClick={onLogout}
                        className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 p-2 rounded-md hover:bg-slate-100 transition-colors"
                    >
                        <LogoutIcon className="w-5 h-5 mr-2" />
                        Logout
                    </button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {renderContent()}
            </main>
        </div>
    );
};

const EmptyState: React.FC = () => (
    <div className="text-center p-10 bg-white rounded-xl border border-slate-200">
        <div className="flex justify-center items-center mb-4">
            <InboxIcon className="w-16 h-16 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">Belum Ada Hasil</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">Saat ini belum ada data hasil ujian yang masuk. Data akan muncul di sini setelah kandidat menyelesaikan ujian.</p>
    </div>
);

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 sm:p-6">
        <div className="animate-pulse flex items-center justify-between">
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                <div>
                    <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
                    <div className="h-4 bg-slate-300 rounded w-32"></div>
                </div>
                <div>
                    <div className="h-3 bg-slate-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-slate-300 rounded w-40"></div>
                </div>
                <div className="hidden sm:block">
                    <div className="h-3 bg-slate-200 rounded w-28 mb-2"></div>
                    <div className="h-4 bg-slate-300 rounded w-36"></div>
                </div>
                <div>
                    <div className="h-3 bg-slate-200 rounded w-16 mb-2"></div>
                    <div className="h-6 bg-slate-300 rounded w-24"></div>
                </div>
            </div>
            <div className="h-6 w-6 bg-slate-200 rounded-md ml-4"></div>
        </div>
    </div>
);


interface CandidateCardProps {
    result: CandidateResult;
    isExpanded: boolean;
    onToggleExpand: () => void;
    essayQuestionsById: { [key: number]: string };
}

const CandidateCard: React.FC<CandidateCardProps> = ({ result, isExpanded, onToggleExpand, essayQuestionsById }) => {
    const scorePercentage = (result.score / result.totalPossibleScore) * 100;
    
    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden transition-all duration-300">
            <button onClick={onToggleExpand} className="w-full text-left p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 focus:outline-none focus:bg-slate-100">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                    <div>
                        <p className="text-sm text-slate-500">Nama Kandidat</p>
                        <p className="font-bold text-slate-800 truncate">{result.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Tanggal Ujian</p>
                        <p className="font-medium text-slate-700">{new Date(result.submissionDate).toLocaleString('id-ID')}</p>
                    </div>
                     <div className="hidden sm:block">
                        <p className="text-sm text-slate-500">Pilihan Ganda</p>
                        <p className="font-medium text-slate-700">
                            <span className="text-green-600 font-semibold">{result.correctAnswersCount} Benar</span> / {result.correctAnswersCount + result.incorrectAnswersCount} Soal
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Skor Akhir</p>
                        <p className={`font-bold text-lg ${scorePercentage >= 75 ? 'text-green-600' : scorePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {result.score} <span className="text-sm font-normal text-slate-500">/ {result.totalPossibleScore}</span>
                        </p>
                    </div>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/50">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Detail Jawaban</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold text-slate-700 mb-2 flex items-center"><DocumentTextIcon className="w-5 h-5 mr-2" /> Data Diri</h4>
                            <ul className="text-sm space-y-1 text-slate-600">
                                <li><strong>Email:</strong> {result.email}</li>
                                <li><strong>WhatsApp:</strong> {result.whatsapp}</li>
                                <li><strong>Alamat:</strong> {result.address}</li>
                            </ul>
                        </div>
                        <div>
                             <h4 className="font-bold text-slate-700 mb-2 flex items-center"><CheckBadgeIcon className="w-5 h-5 mr-2 text-green-500" /> Pilihan Ganda</h4>
                             <ul className="text-sm space-y-1 text-slate-600">
                                <li><strong>Benar:</strong> {result.correctAnswersCount}</li>
                                <li><strong>Salah:</strong> {result.incorrectAnswersCount}</li>
                             </ul>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center"><LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" /> Jawaban Esai</h4>
                        <div className="space-y-6">
                            {Object.entries(result.essayAnswers).map(([questionId, answer]) => (
                                <EssayAnswerAnalysis 
                                    key={questionId}
                                    question={essayQuestionsById[Number(questionId)]}
                                    answer={answer}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface EssayAnswerAnalysisProps {
    question: string;
    answer: string;
}

const EssayAnswerAnalysis: React.FC<EssayAnswerAnalysisProps> = ({ question, answer }) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const handleAnalyze = useCallback(async () => {
        setIsAnalyzing(true);
        setAnalysis(null);
        setAnalysisError(null);
        try {
            const response = await fetch('http://localhost:3001/analyze-essay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, answer })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menganalisis jawaban.');
            }

            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (err) {
            if (err instanceof Error) {
                setAnalysisError(err.message);
            } else {
                setAnalysisError('Terjadi kesalahan yang tidak diketahui.');
            }
        } finally {
            setIsAnalyzing(false);
        }
    }, [question, answer]);

    const renderAnalysis = (text: string) => {
        if (!text) return null;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        const content = lines.map((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                return <li key={index}>{trimmedLine.substring(2)}</li>;
            }
            return <p key={index} className={index > 0 ? 'mt-2' : ''}>{line}</p>;
        });

        const isList = lines.some(line => line.trim().startsWith('* ') || line.trim().startsWith('- '));
        
        return isList ? <ul className="list-disc list-inside space-y-1">{content}</ul> : <div>{content}</div>;
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-800 text-sm mb-1">Pertanyaan:</p>
            <p className="text-sm text-slate-600 mb-3 italic">"{question}"</p>
            <p className="font-semibold text-slate-800 text-sm mb-1">Jawaban Kandidat:</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-100 p-3 rounded-md">{answer}</p>
            
            <div className="mt-4">
                {analysis && (
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <h5 className="font-bold text-indigo-800 text-sm mb-2 flex items-center"><SparklesIcon className="w-5 h-5 mr-2" /> Analisis AI</h5>
                        <div className="text-sm text-indigo-700 space-y-2">{renderAnalysis(analysis)}</div>
                    </div>
                )}
                {analysisError && <p className="text-sm text-red-600 mt-2">Error: {analysisError}</p>}
                
                {!analysis && (
                    <button 
                        onClick={handleAnalyze} 
                        disabled={isAnalyzing}
                        className="flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 disabled:cursor-wait transition-colors"
                    >
                         <SparklesIcon className="w-4 h-4 mr-2" />
                         {isAnalyzing ? 'Menganalisis...' : 'Analisis Jawaban dengan AI'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default DashboardScreen;