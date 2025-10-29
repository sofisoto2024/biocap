

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Card from './common/Card';
import { UsersIcon, ManualsIcon, TrainingIcon, SparklesIcon } from './Icons';
import Modal from './common/Modal';
import Spinner from './common/Spinner';
import { geminiService } from '../services/geminiService';
import type { User, Manual, TrainingModule, TrainingRecord, Activity } from '../types';

interface DashboardViewProps {
    users: User[];
    manuals: Manual[];
    modules: TrainingModule[];
    records: TrainingRecord[];
    activity: Activity[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ users, manuals, modules, records, activity }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [insights, setInsights] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const totalUsers = users.length;
    const totalManuals = manuals.length;
    const totalModules = modules.length;
    
    const handleGetInsights = async () => {
        setIsModalOpen(true);
        setIsLoading(true);
        const result = await geminiService.getDashboardInsights(records);
        setInsights(result);
        setIsLoading(false);
    };

    const statusCounts = users.reduce((acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
    }, {} as Record<User['status'], number>);

    const pieChartData = [
        { name: 'Capacitados', value: statusCounts['Capacitado'] || 0 },
        { name: 'Atrasados', value: statusCounts['Atrasado'] || 0 },
        { name: 'Pendientes', value: statusCounts['Pendiente'] || 0 },
    ];

    const COLORS = ['#F9A8D4', '#FDBA74', '#C4B5FD']; // Pastel Pink, Pastel Orange, Pastel Purple

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold">
            {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-secondary hidden lg:block">Dashboards</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card icon={<UsersIcon className="h-8 w-8 text-primary"/>} title="Usuarios Totales" value={totalUsers.toString()} iconBgClass="bg-primary-100" />
                <Card icon={<ManualsIcon className="h-8 w-8 text-pink-500"/>} title="Manuales Disponibles" value={totalManuals.toString()} iconBgClass="bg-pink-100" />
                <Card icon={<TrainingIcon className="h-8 w-8 text-purple-500"/>} title="Cápsulas de Capacitación" value={totalModules.toString()} iconBgClass="bg-purple-100" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-secondary mb-4">Estado General de Capacitaciones</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={110}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-secondary mb-4">Actividad de la Plataforma (Últimos 7 días)</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={activity} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="views" name="Visitas" stroke="#8425EB" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-secondary mb-4">Finalización de Capacitación por Departamento</h2>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={records}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" fill="#F9A8D4" name="Completado" />
                        <Bar dataKey="pending" fill="#C4B5FD" name="Pendiente" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                <div>
                  <h2 className="text-xl font-semibold text-secondary mb-2">Análisis con IA</h2>
                  <p className="text-gray-600 mb-4">Permite que Gemini analice tus datos de capacitación para ofrecerte ideas y recomendaciones prácticas para mejorar.</p>
                </div>
                <button onClick={handleGetInsights} className="w-full lg:w-auto lg:self-start mt-auto flex items-center justify-center bg-secondary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-secondary-800 transition duration-300">
                    <SparklesIcon className="h-5 w-5 mr-2"/>
                    Generar Análisis
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Análisis de Capacitación con IA">
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Spinner />
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br />') }}>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DashboardView;