

import React, { useMemo } from 'react';
import type { Manual, User, ManualCompletion, TrainingModule, TrainingCompletion } from '../types';
import { CheckCircleIcon, ManualsIcon, TrainingIcon } from './Icons';

interface ProgressViewProps {
    manuals: Manual[];
    manualCompletions: ManualCompletion[];
    currentUser: User;
    modules: TrainingModule[];
    trainingCompletions: TrainingCompletion[];
}

const ProgressView: React.FC<ProgressViewProps> = ({ manuals, manualCompletions, currentUser, modules, trainingCompletions }) => {
    
    const { completedManuals, pendingManuals } = useMemo(() => {
        const completedIds = new Set(
            manualCompletions
                .filter(c => c.userId === currentUser.id)
                .map(c => c.manualId)
        );
        
        const completed: Manual[] = [];
        const pending: Manual[] = [];

        manuals.forEach(manual => {
            if (completedIds.has(manual.id)) {
                completed.push(manual);
            } else {
                pending.push(manual);
            }
        });

        return { completedManuals: completed, pendingManuals: pending };
    }, [manuals, manualCompletions, currentUser.id]);

     const { completedModules, pendingModules } = useMemo(() => {
        const completedIds = new Set(
            trainingCompletions
                .filter(c => c.userId === currentUser.id)
                .map(c => c.moduleId)
        );
        const completed: TrainingModule[] = [];
        const pending: TrainingModule[] = [];
        modules.forEach(module => {
            if (completedIds.has(module.id)) {
                completed.push(module);
            } else {
                pending.push(module);
            }
        });
        return { completedModules: completed, pendingModules: pending };
    }, [modules, trainingCompletions, currentUser.id]);

    const getManualCompletionDate = (manualId: number) => {
        const completion = manualCompletions.find(c => c.userId === currentUser.id && c.manualId === manualId);
        return completion ? new Date(completion.completedOn).toLocaleDateString('es-ES') : '';
    };

    const getTrainingCompletionDate = (moduleId: number) => {
        const completion = trainingCompletions.find(c => c.userId === currentUser.id && c.moduleId === moduleId);
        return completion ? new Date(completion.completedOn).toLocaleDateString('es-ES') : '';
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-secondary hidden lg:block">Mi Progreso de Capacitación</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircleIcon className="h-8 w-8 text-green-500"/>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Manuales Completados</p>
                        <p className="text-2xl font-bold text-secondary">{completedManuals.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="bg-yellow-100 p-3 rounded-full">
                        <ManualsIcon className="h-8 w-8 text-yellow-500"/>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Manuales Pendientes</p>
                        <p className="text-2xl font-bold text-secondary">{pendingManuals.length}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircleIcon className="h-8 w-8 text-green-500"/>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Capacitaciones Completadas</p>
                        <p className="text-2xl font-bold text-secondary">{completedModules.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                        <TrainingIcon className="h-8 w-8 text-purple-500"/>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Capacitaciones Pendientes</p>
                        <p className="text-2xl font-bold text-secondary">{pendingModules.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-secondary mb-4">Manuales Pendientes</h2>
                    {pendingManuals.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {pendingManuals.map(manual => (
                                <li key={manual.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-800">{manual.title}</p>
                                        <p className="text-sm text-gray-500">{manual.equipment}</p>
                                    </div>
                                    <span className="text-sm font-medium text-yellow-600">Pendiente</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-4">¡Felicidades! No tienes manuales pendientes.</p>
                    )}
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-secondary mb-4">Cápsulas de Capacitación Pendientes</h2>
                    {pendingModules.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {pendingModules.map(module => (
                                <li key={module.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-800">{module.title}</p>
                                        <p className="text-sm text-gray-500">{module.duration} min</p>
                                    </div>
                                    <span className="text-sm font-medium text-yellow-600">Pendiente</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-4">¡Felicidades! No tienes cápsulas de capacitación pendientes.</p>
                    )}
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-secondary mb-4">Historial de Manuales Completados</h2>
                     {completedManuals.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {completedManuals.map(manual => (
                                <li key={manual.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-800">{manual.title}</p>
                                        <p className="text-sm text-gray-500">{manual.equipment}</p>
                                    </div>
                                    <span className="text-sm text-green-600">Completado el {getManualCompletionDate(manual.id)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-4">Aún no has completado ningún manual.</p>
                    )}
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-secondary mb-4">Historial de Cápsulas Completadas</h2>
                     {completedModules.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {completedModules.map(module => (
                                <li key={module.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-800">{module.title}</p>
                                        <p className="text-sm text-gray-500">{module.duration} min</p>
                                    </div>
                                    <span className="text-sm text-green-600">Completado el {getTrainingCompletionDate(module.id)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-4">Aún no has completado ninguna cápsula de capacitación.</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ProgressView;