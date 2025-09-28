import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmButtonVariant?: 'primary' | 'danger';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText,
    cancelText, 
    confirmButtonVariant = 'primary' 
}) => {
    if (!isOpen) return null;

    const confirmButtonClass = confirmButtonVariant === 'danger'
        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 m-4 max-w-md w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
                <p className="text-sm text-slate-600 mb-8">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-200 text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                        aria-label="Batal"
                    >
                        {cancelText || 'Batal'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButtonClass}`}
                        aria-label="Konfirmasi"
                    >
                        {confirmText || 'Ya, Konfirmasi'}
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

export default ConfirmationModal;