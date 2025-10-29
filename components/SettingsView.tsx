

import React from 'react';
import { SunIcon, MoonIcon, EditIcon, LogoutIcon } from './Icons';

type Theme = 'light' | 'dark';

interface SettingsViewProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    onEditProfile: () => void;
    onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme, onEditProfile, onLogout }) => {

    const handleThemeChange = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-secondary hidden lg:block dark:text-white">Configuración</h1>

            {/* Appearance Settings */}
            <div className="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-secondary dark:text-gray-100 mb-4">Apariencia</h2>
                <div className="flex items-center justify-between">
                    <p className="text-gray-600 dark:text-gray-300">Tema Oscuro</p>
                    <button
                        onClick={handleThemeChange}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                            theme === 'dark' ? 'bg-primary' : 'bg-gray-200'
                        }`}
                    >
                        <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${
                                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-1.5">
                            <SunIcon className={`w-3 h-3 text-yellow-400 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} />
                            <MoonIcon className={`w-3 h-3 text-white ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                    </button>
                </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-secondary dark:text-gray-100 mb-4">Cuenta</h2>
                <div className="space-y-3">
                    <button onClick={onEditProfile} className="w-full text-left flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors">
                        <EditIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-200">Editar Mi Perfil</span>
                    </button>
                    <button onClick={onLogout} className="w-full text-left flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors">
                        <LogoutIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                         <span className="text-gray-700 dark:text-gray-200">Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;