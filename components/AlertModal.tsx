import React from 'react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="alertdialog" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 m-4 max-w-sm w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-800 mb-3">{title}</h3>
                <p className="text-sm text-slate-600 mb-6">{message}</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Mengerti
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AlertModal;
