import React from 'react';
import { BuildingOfficeIcon, UserPlusIcon } from './Icons';

interface LandingScreenProps {
    onStartExam: () => void;
    onCompanyLogin: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onStartExam, onCompanyLogin }) => {
    return (
        <div className="flex flex-col items-center justify-center flex-grow p-4">
            <div className="w-full max-w-lg text-center">
                 <h1 className="text-4xl font-bold text-slate-800">Ujian Rekrutmen Online</h1>
                 <p className="text-slate-500 mt-2 mb-12">PT. Batavia Alumindo Industri</p>

                <div className="space-y-6">
                     <button
                        onClick={onStartExam}
                        className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-lg flex items-center justify-center"
                    >
                        <UserPlusIcon className="w-6 h-6 mr-3" />
                        Mulai Ujian (Calon Karyawan)
                    </button>
                     <button
                        onClick={onCompanyLogin}
                        className="w-full bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 flex items-center justify-center"
                    >
                        <BuildingOfficeIcon className="w-5 h-5 mr-3" />
                        Login Perusahaan (HRD)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingScreen;
