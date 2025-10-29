

import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ManualsView from './components/ManualsView';
import TrainingView from './components/TrainingView';
import UsersView from './components/UsersView';
import CalendarView from './components/CalendarView';
import ProgressView from './components/ProgressView';
import SettingsView from './components/SettingsView';
import EditProfileModal from './components/EditProfileModal';
import LoginView from './components/LoginView';
import { MenuIcon, LogoutIcon, SwitchUserIcon, EditIcon } from './components/Icons';
import type { User, TrainingModule, TrainingRecord, Manual, Activity, View, CalendarEvent, DailyNote, ManualCompletion, TrainingCompletion } from './types';

// --- Start of Data Management ---

const initialUsers: User[] = [
  { id: 1, name: 'Dr. Juan Pérez', email: 'juan.perez@hospital.com', password: 'password123', role: 'Clínico', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a', department: 'Cirugía', lastTraining: '2024-05-15', status: 'Capacitado' },
  { id: 2, name: 'Dra. Susana Lewis', email: 'susana.lewis@hospital.com', password: 'password123', role: 'Clínico', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704c', department: 'Cardiología', lastTraining: '2024-06-01', status: 'Capacitado' },
  { id: 3, name: 'Enf. Carol Hathaway', email: 'carol.hathaway@hospital.com', password: 'password123', role: 'Clínico', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b', department: 'UCI', lastTraining: '2024-03-20', status: 'Atrasado' },
  { id: 4, name: 'Dr. Pedro Benton', email: 'pedro.benton@hospital.com', password: 'password123', role: 'Clínico', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', department: 'Cirugía', lastTraining: '2024-07-10', status: 'Pendiente' },
  { id: 5, name: 'Téc. Marcos Greene', email: 'marcos.greene@hospital.com', password: 'password123', role: 'Técnico', avatar: 'https://i.pravatar.cc/150?u=a042581f4e290267043', lastTraining: '2024-05-30', status: 'Capacitado' },
  { id: 6, name: 'Enf. Abby Lockhart', email: 'abby.lockhart@hospital.com', password: 'password123', role: 'Clínico', avatar: 'https://i.pravatar.cc/150?u=a042581f4e290267042', department: 'UCI', lastTraining: '2024-07-12', status: 'Pendiente' },
  { 
    id: 7, 
    name: 'Sofia Soto', 
    email: 'sofi.soto@duocuc.cl', 
    password: 'So2003soto..',
    role: 'Clínico', 
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', 
    department: 'Administración', 
    lastTraining: '2024-07-18', 
    status: 'Capacitado' 
  },
];

const initialModules: TrainingModule[] = [
    { id: 1, title: 'Operación del Desfibrilador Modelo X2', description: 'Guía completa para el uso del nuevo desfibrilador X2.', duration: 45, assignedTo: 12, imageUrl: 'https://images.unsplash.com/photo-1629424755494-3d2371a3a5f9?q=80&w=1470&auto=format&fit=crop' },
    { id: 2, title: 'Protocolos de Seguridad para Resonancia Magnética', description: 'Capacitación de seguridad obligatoria para todo el personal de radiología.', duration: 60, assignedTo: 8, imageUrl: 'https://images.unsplash.com/photo-1581092446332-723f7358d7a1?q=80&w=800&auto=format&fit=crop' },
    { id: 3, title: 'Configuración y Monitoreo de Ventiladores', description: 'Instrucciones paso a paso para ventiladores de UCI.', duration: 75, assignedTo: 15, imageUrl: 'https://images.unsplash.com/photo-1584362358239-4b125950882e?q=80&w=800&auto=format&fit=crop' },
];

const initialRecords: TrainingRecord[] = [
    { department: 'Cardiología', completed: 18, pending: 4 },
    { department: 'Radiología', completed: 12, pending: 2 },
    { department: 'Cirugía', completed: 25, pending: 10 },
    { department: 'UCI', completed: 20, pending: 15 },
];

const initialManuals: Manual[] = [];

const initialActivity: Activity[] = [
    { day: 'Lun', views: 88 },
    { day: 'Mar', views: 110 },
    { day: 'Mié', views: 150 },
    { day: 'Jue', views: 135 },
    { day: 'Vie', views: 180 },
    { day: 'Sáb', views: 160 },
    { day: 'Dom', views: 210 },
];

const initialCalendarEvents: CalendarEvent[] = [
    { id: 1, title: 'Recertificación Desfibrilador', date: '2024-08-15', time: '09:00 AM', notes: 'Sala de conferencias 3A.', userId: 1, type: 'Capacitación' },
    { id: 2, title: 'Seguridad RM para Personal Nuevo', date: '2024-08-22', time: '02:00 PM', userId: 4, type: 'Capacitación' },
    { id: 3, title: 'Capacitación Ventiladores UCI', date: '2024-08-22', time: '10:30 AM', userId: 3, type: 'Capacitación' },
    { id: 4, title: 'Leer manual ECHO-500', date: '2024-08-10', notes: 'Enfocarse en el capítulo 4.', userId: 2, type: 'Lectura de Manual'},
    { id: 5, title: 'Reunión de equipo', date: '2024-08-10', time: '11:00 AM', userId: 7, type: 'Tarea General'},
    { id: 6, title: 'Revisar Protocolos', date: '2024-08-12', userId: 7, type: 'Lectura de Manual'},
];

const initialDailyNotes: DailyNote[] = [
    { date: '2024-08-10', content: 'Día ocupado con la reunión de equipo y la lectura del manual.' },
    { date: '2024-08-25', content: 'Preparar informe de capacitación mensual.' },
];

// --- End of Data Management ---


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Centralized State Management
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [modules, setModules] = useState<TrainingModule[]>(initialModules);
  const [records, setRecords] = useState<TrainingRecord[]>(initialRecords);
  const [manuals, setManuals] = useState<Manual[]>(initialManuals);
  const [manualCompletions, setManualCompletions] = useState<ManualCompletion[]>([
    { manualId: 2, userId: 7, completedOn: '2024-07-20'} // Example completion for current user
  ]);
  const [trainingCompletions, setTrainingCompletions] = useState<TrainingCompletion[]>([
    { moduleId: 2, userId: 7, completedOn: '2024-07-25' } // Example completion for current user
  ]);
  const [activity, setActivity] = useState<Activity[]>(initialActivity);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>(initialDailyNotes);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Authentication
  const handleLogin = (email: string, password_provided: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.password === password_provided) {
      setLoggedInUser(user);
      setLoginError(null);
    } else {
      setLoginError('Correo electrónico o contraseña incorrectos.');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setCurrentView('dashboard'); // Reset view on logout
  };

  // State Manipulation Functions
  const addManual = (manual: Omit<Manual, 'id'>) => {
      setManuals(prev => [...prev, { ...manual, id: Date.now() }]);
  };
  
  const deleteManual = (manualId: number) => {
    setManuals(prev => prev.filter(manual => manual.id !== manualId));
    setManualCompletions(prev => prev.filter(comp => comp.manualId !== manualId));
  };
  
  const completeManual = (manualId: number) => {
    if (!loggedInUser) return;
    const isCompleted = manualCompletions.some(
        comp => comp.manualId === manualId && comp.userId === loggedInUser.id
    );
    if (!isCompleted) {
        setManualCompletions(prev => [
            ...prev,
            {
                manualId,
                userId: loggedInUser.id,
                completedOn: new Date().toISOString().split('T')[0],
            },
        ]);
        // Also update user status if needed
        const updatedUser = { ...loggedInUser, status: 'Capacitado' as const, lastTraining: new Date().toISOString().split('T')[0] };
        setLoggedInUser(updatedUser);
        updateUser(updatedUser);
    }
  };
  
  const addModule = (module: Omit<TrainingModule, 'id'>) => {
      setModules(prev => [...prev, { ...module, id: Date.now() }]);
  };

  const deleteModule = (moduleId: number) => {
    setModules(prev => prev.filter(module => module.id !== moduleId));
    setTrainingCompletions(prev => prev.filter(comp => comp.moduleId !== moduleId));
  };
  
  const completeTrainingModule = (moduleId: number) => {
    if (!loggedInUser) return;
    const isCompleted = trainingCompletions.some(
        comp => comp.moduleId === moduleId && comp.userId === loggedInUser.id
    );
    if (!isCompleted) {
        setTrainingCompletions(prev => [
            ...prev,
            {
                moduleId,
                userId: loggedInUser.id,
                completedOn: new Date().toISOString().split('T')[0],
            },
        ]);
        // Also update user status if needed
        const updatedUser = { ...loggedInUser, status: 'Capacitado' as const, lastTraining: new Date().toISOString().split('T')[0] };
        setLoggedInUser(updatedUser);
        updateUser(updatedUser);
    }
  };
  
  const addUser = (user: Omit<User, 'id' | 'lastTraining' | 'status'>) => {
      const newUser: User = {
          ...user,
          id: Date.now(),
          lastTraining: new Date().toISOString().split('T')[0],
          status: 'Pendiente',
      };
      setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
  };
  
  const handleUpdateProfile = (updatedUser: User) => {
    setLoggedInUser(updatedUser);
    updateUser(updatedUser);
    setIsEditProfileModalOpen(false);
  };

  const deleteUser = (userId: number) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };


  const addEvent = (event: Omit<CalendarEvent, 'id' | 'userId'>) => {
      if (!loggedInUser) return;
      setCalendarEvents(prev => [...prev, { ...event, id: Date.now(), userId: loggedInUser.id }]);
  };
  
  const upsertNote = (note: DailyNote) => {
    setDailyNotes(prev => {
        const existingNoteIndex = prev.findIndex(n => n.date === note.date);
        if (existingNoteIndex > -1) {
            const updatedNotes = [...prev];
            updatedNotes[existingNoteIndex] = note;
            return updatedNotes;
        }
        return [...prev, note];
    });
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!loggedInUser) {
    return <LoginView onLogin={handleLogin} error={loginError} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView users={users} manuals={manuals} modules={modules} records={records} activity={activity} />;
      case 'manuals':
        return <ManualsView manuals={manuals} addManual={addManual} currentUser={loggedInUser} manualCompletions={manualCompletions} completeManual={completeManual} deleteManual={deleteManual} />;
      case 'training':
        return <TrainingView modules={modules} addModule={addModule} currentUser={loggedInUser} trainingCompletions={trainingCompletions} completeTrainingModule={completeTrainingModule} deleteModule={deleteModule} />;
      case 'users':
        return <UsersView users={users} addUser={addUser} deleteUser={deleteUser} updateUser={updateUser} currentUser={loggedInUser} />;
      case 'calendar':
        return <CalendarView events={calendarEvents} addEvent={addEvent} currentUser={loggedInUser} dailyNotes={dailyNotes} upsertNote={upsertNote} />;
      case 'progress':
        return <ProgressView manuals={manuals} manualCompletions={manualCompletions} currentUser={loggedInUser} modules={modules} trainingCompletions={trainingCompletions} />;
      case 'settings':
        return <SettingsView theme={theme} setTheme={setTheme} onEditProfile={() => setIsEditProfileModalOpen(true)} onLogout={handleLogout} />;
      default:
        return <DashboardView users={users} manuals={manuals} modules={modules} records={records} activity={activity} />;
    }
  };
  
  const viewTitles: Record<View, string> = {
    dashboard: "Dashboards",
    manuals: "Manuales de Equipos",
    training: "Cápsulas de Capacitación",
    users: "Gestión de Usuarios",
    calendar: "Calendario",
    progress: "Mi Progreso",
    settings: "Configuración",
  };

  return (
    <div className="flex h-screen font-sans text-secondary-800 dark:text-secondary-200 bg-secondary-100 dark:bg-secondary-900">
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      ></div>
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isMobileOpen={isMobileSidebarOpen} 
        setIsMobileOpen={setIsMobileSidebarOpen}
        isCollapsed={isSidebarCollapsed}
      />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="flex items-center justify-between p-4 bg-white dark:bg-secondary-800 border-b border-gray-200 dark:border-secondary-700">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-gray-500 dark:text-gray-400 hidden lg:block mr-4">
              <MenuIcon className="h-6 w-6" />
            </button>
            <button onClick={() => setIsMobileSidebarOpen(true)} className="text-gray-500 dark:text-gray-400 lg:hidden">
              <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-secondary dark:text-white lg:hidden">{viewTitles[currentView]}</h1>
          </div>
          <div className="relative" ref={profileMenuRef}>
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{loggedInUser.name}</span>
              <img
                className="h-9 w-9 rounded-full object-cover"
                src={loggedInUser.avatar}
                alt="User avatar"
              />
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-700 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10">
                <button onClick={() => { setIsEditProfileModalOpen(true); setIsProfileMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-secondary-600">
                  <EditIcon className="w-4 h-4 mr-2" />
                  Editar Perfil
                </button>
                <button className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-secondary-600">
                  <SwitchUserIcon className="w-4 h-4 mr-2" />
                  Cambiar de Cuenta
                </button>
                <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-secondary-600">
                  <LogoutIcon className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderView()}
        </main>
      </div>

      <EditProfileModal 
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        user={loggedInUser}
        onSave={handleUpdateProfile}
      />
    </div>
  );
};

export default App;