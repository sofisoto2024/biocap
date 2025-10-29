
import React from 'react';
import type { View } from '../types';
import { DashboardIcon, ManualsIcon, TrainingIcon, UsersIcon, XIcon, BookLogoIcon, CalendarIcon, ProgressIcon, SettingsIcon } from './Icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isMobileOpen, setIsMobileOpen, isCollapsed }) => {
  
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboards', icon: DashboardIcon },
    { id: 'manuals', label: 'Manuales', icon: ManualsIcon },
    { id: 'training', label: 'Capacitaciones', icon: TrainingIcon },
    { id: 'users', label: 'Usuarios', icon: UsersIcon },
  ];

  const secondaryNavItems = [
      { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
      { id: 'progress', label: 'Progreso', icon: ProgressIcon },
      { id: 'settings', label: 'Configuración', icon: SettingsIcon },
  ];

  const handleNavigation = (view: View) => {
    setCurrentView(view);
    setIsMobileOpen(false);
  }
  
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 flex flex-col bg-white dark:bg-secondary-800 text-gray-700 border-r border-gray-200 dark:border-secondary-700
    transform transition-all duration-300 ease-in-out
    ${isCollapsed ? 'w-20' : 'w-64'}
    lg:translate-x-0
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <aside className={sidebarClasses}>
      <div className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-secondary-700 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <BookLogoIcon className="h-8 w-8 text-lilac flex-shrink-0" />
            {!isCollapsed && <span className="text-xl font-bold text-secondary dark:text-white">BIOCAP</span>}
        </div>
        <button onClick={() => setIsMobileOpen(false)} className="text-gray-500 hover:text-gray-800 lg:hidden">
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-1 p-2">
        <div className="space-y-2">
            {mainNavItems.map(item => (
            <a
                key={item.id}
                href="#"
                onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.id as View);
                }}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center py-2.5 rounded-lg transition-colors duration-200 ${isCollapsed ? 'px-3 justify-center' : 'px-4'} ${
                currentView === item.id
                    ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
                <item.icon className={`h-6 w-6 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </a>
            ))}
        </div>

        <hr className={`my-3 border-gray-200 dark:border-secondary-700 ${isCollapsed ? 'mx-4' : ''}`} /> 
        
        <div className="space-y-2">
            {secondaryNavItems.map(item => (
            <a
                key={item.id}
                href="#"
                onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.id as View);
                }}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center py-2.5 rounded-lg transition-colors duration-200 ${isCollapsed ? 'px-3 justify-center' : 'px-4'} ${
                currentView === item.id
                    ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
                <item.icon className={`h-6 w-6 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </a>
            ))}
        </div>

      </nav>
      <div className={`p-4 border-t border-gray-200 dark:border-secondary-700 ${isCollapsed ? 'hidden' : 'block'}`}>
        <p className="text-xs text-gray-500 dark:text-gray-400">&copy; 2024 BIOCAP Inc.</p>
      </div>
    </aside>
  );
};

export default Sidebar;