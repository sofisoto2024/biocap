

export type View = 'dashboard' | 'manuals' | 'training' | 'users' | 'calendar' | 'progress' | 'settings';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Clínico' | 'Técnico';
  avatar: string;
  department?: 'Cardiología' | 'Radiología' | 'Cirugía' | 'UCI' | 'Administración';
  lastTraining: string;
  status: 'Capacitado' | 'Pendiente' | 'Atrasado';
  password?: string;
}

export interface Manual {
  id: number;
  title: string;
  equipment: string;
  createdOn: string;
  imageUrl: string; // For the card cover
  pdfUrl: string;   // URL to the generated PDF from an image
}

export interface ManualCompletion {
  manualId: number;
  userId: number;
  completedOn: string;
}

export interface TrainingModule {
  id: number;
  title: string;
  description: string;
  duration: number; // in minutes
  assignedTo: number; // number of users
  imageUrl: string;
  videoUrl?: string;
  videoType?: 'upload' | 'youtube';
}

export interface TrainingCompletion {
  moduleId: number;
  userId: number;
  completedOn: string;
}

export interface TrainingRecord {
    department: string;
    completed: number;
    pending: number;
}

export interface Activity {
  day: string;
  views: number;
}

export type CalendarEventType = 'Capacitación' | 'Lectura de Manual' | 'Tarea General';

export interface CalendarEvent {
    id: number;
    title: string;
    date: string; // YYYY-MM-DD
    time?: string; // HH:MM AM/PM
    notes?: string;
    userId: number; // To link to a user
    type: CalendarEventType;
}

export interface DailyNote {
    date: string; // YYYY-MM-DD
    content: string;
}