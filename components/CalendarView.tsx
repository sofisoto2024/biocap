import React, { useState, useMemo, useRef } from 'react';
import type { CalendarEvent, User, CalendarEventType, DailyNote } from '../types';
import Modal from './common/Modal';
import { PlusIcon, StickyNoteIcon } from './Icons';

interface CalendarViewProps {
    events: CalendarEvent[];
    addEvent: (event: Omit<CalendarEvent, 'id' | 'userId'>) => void;
    currentUser: User;
    dailyNotes: DailyNote[];
    upsertNote: (note: DailyNote) => void;
}

const eventTypes: { name: CalendarEventType; color: string; bgColor: string; textColor: string; }[] = [
    { name: 'Capacitación', color: 'bg-pink-500', bgColor: 'bg-pink-100', textColor: 'text-pink-700' },
    { name: 'Lectura de Manual', color: 'bg-purple-500', bgColor: 'bg-purple-100', textColor: 'text-purple-900' },
    { name: 'Tarea General', color: 'bg-accent-500', bgColor: 'bg-accent-100', textColor: 'text-accent-700' },
];

const TimePicker: React.FC<{ value: string; onChange: (value: string) => void; }> = ({ value, onChange }) => {
    const [hour, min, period] = useMemo(() => {
        if (!value) return ['09', '00', 'AM'];
        const [time, p] = value.split(' ');
        const [h, m] = time.split(':');
        return [h, m, p];
    }, [value]);

    const handleTimeChange = (newHour: string, newMin: string, newPeriod: string) => {
        onChange(`${newHour}:${newMin} ${newPeriod}`);
    };

    return (
        <div className="flex items-center space-x-1">
            <select value={hour} onChange={e => handleTimeChange(e.target.value, min, period)} className="w-full p-2 border border-gray-300 rounded-md">
                {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => <option key={h}>{h}</option>)}
            </select>
            <span className="font-bold">:</span>
            <select value={min} onChange={e => handleTimeChange(hour, e.target.value, period)} className="w-full p-2 border border-gray-300 rounded-md">
                {['00', '15', '30', '45'].map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={period} onChange={e => handleTimeChange(hour, min, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                <option>AM</option>
                <option>PM</option>
            </select>
        </div>
    );
};

const CalendarView: React.FC<CalendarViewProps> = ({ events, addEvent, currentUser, dailyNotes, upsertNote }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'year' | 'month' | 'week'>('month');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [noteContent, setNoteContent] = useState('');
    const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id' | 'userId'>>({ title: '', date: '', time: '09:00 AM', type: 'Capacitación', notes: '' });
    const [selectedEventType, setSelectedEventType] = useState<CalendarEventType | 'all'>('all');
    
    const [popover, setPopover] = useState<{ visible: boolean; content: React.ReactNode; top: number; left: number } | null>(null);
    const calendarContainerRef = useRef<HTMLDivElement>(null);


    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const userMatch = event.userId === currentUser.id;
            const typeMatch = selectedEventType === 'all' || event.type === selectedEventType;
            return userMatch && typeMatch;
        });
    }, [events, currentUser.id, selectedEventType]);
    
    const eventsByDate = useMemo(() => {
        return filteredEvents.reduce((acc, event) => {
            (acc[event.date] = acc[event.date] || []).push(event);
            return acc;
        }, {} as Record<string, CalendarEvent[]>);
    }, [filteredEvents]);

    const notesByDate = useMemo(() => {
        return dailyNotes.reduce((acc, note) => {
            acc[note.date] = note.content;
            return acc;
        }, {} as Record<string, string>);
    }, [dailyNotes]);
    
    const changeDate = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (view === 'month') newDate.setMonth(newDate.getMonth() + offset);
            else if (view === 'week') newDate.setDate(newDate.getDate() + (offset * 7));
            else if (view === 'year') newDate.setFullYear(newDate.getFullYear() + offset);
            return newDate;
        });
    };
    
    const handleDayClick = (dateString: string) => {
        setSelectedDate(dateString);
        setNoteContent(notesByDate[dateString] || '');
        setIsNoteModalOpen(true);
    };

    const handleSaveNote = () => {
        upsertNote({ date: selectedDate, content: noteContent });
        setIsNoteModalOpen(false);
        setNoteContent('');
    };

    const handleSaveEvent = () => {
        if (!newEvent.title || !newEvent.date) {
            alert('Por favor, completa el título y la fecha.');
            return;
        }
        addEvent(newEvent);
        setIsEventModalOpen(false);
        setNewEvent({ title: '', date: '', time: '09:00 AM', type: 'Capacitación', notes: '' });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    // --- Popover Logic ---
    const handleMouseEnter = (element: HTMLElement, content: React.ReactNode) => {
        if (!calendarContainerRef.current) return;
        const containerRect = calendarContainerRef.current.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        let top = elementRect.top - containerRect.top + elementRect.height + 5;
        let left = elementRect.left - containerRect.left;

        // Prevent popover from going off-screen
        if (left + 256 > containerRect.width) { // 256px is the width of the popover (w-64)
            left = elementRect.right - containerRect.left - 256;
        }
        if (top + 150 > containerRect.height) { // Approximate height
             top = elementRect.top - containerRect.top - 150;
        }


        setPopover({ visible: true, content, top, left });
    };

    const handleMouseLeave = () => {
        setPopover(null);
    };


    const renderHeader = () => {
        let title = '';
        if (view === 'month') {
            title = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        } else if (view === 'year') {
            title = currentDate.getFullYear().toString();
        } else {
            const startOfWeek = new Date(currentDate);
            const dayOfWeek = startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1;
            startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            title = `${startOfWeek.getDate()} de ${startOfWeek.toLocaleString('es-ES', { month: 'short' })} - ${endOfWeek.getDate()} de ${endOfWeek.toLocaleString('es-ES', { month: 'short' })}, ${endOfWeek.getFullYear()}`;
        }
        
        return (
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-gray-100">&lt;</button>
                    <h2 className="text-xl font-bold text-secondary capitalize w-64 text-center">{title}</h2>
                    <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-gray-100">&gt;</button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 rounded-md text-sm font-semibold hover:bg-gray-100 border">Hoy</button>
                </div>
                 <div className="hidden sm:flex items-center border border-gray-300 rounded-md">
                   <button onClick={() => setView('year')} className={`px-3 py-1 text-sm rounded-l-md ${view === 'year' ? 'bg-secondary text-white' : 'hover:bg-gray-100'}`}>Año</button>
                   <button onClick={() => setView('month')} className={`px-3 py-1 text-sm border-l border-r border-gray-300 ${view === 'month' ? 'bg-secondary text-white' : 'hover:bg-gray-100'}`}>Mes</button>
                   <button onClick={() => setView('week')} className={`px-3 py-1 text-sm rounded-r-md ${view === 'week' ? 'bg-secondary text-white' : 'hover:bg-gray-100'}`}>Semana</button>
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDate = new Date(startOfMonth);
        startDate.setDate(startDate.getDate() - (startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1));
        const endDate = new Date(endOfMonth);
        endDate.setDate(endDate.getDate() + (7 - (endOfMonth.getDay() === 0 ? 7 : endOfMonth.getDay())));
        const days = [];
        let day = new Date(startDate);
        while (day <= endDate) { days.push(new Date(day)); day.setDate(day.getDate() + 1); }
        const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        return (
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
                {weekDays.map(day => (<div key={day} className="text-center font-semibold text-sm py-2 bg-gray-50 text-gray-600">{day}</div>))}
                {days.map((date, index) => {
                    const dateString = date.toISOString().split('T')[0];
                    const eventsForDay = eventsByDate[dateString] || [];
                    const noteForDay = notesByDate[dateString];
                    return (
                        <div key={index} onClick={() => handleDayClick(dateString)} className={`relative p-2 bg-white min-h-[120px] flex flex-col cursor-pointer ${date.getMonth() !== currentDate.getMonth() ? 'bg-gray-50 text-gray-400' : ''}`}>
                            <div className="flex justify-between items-center">
                                <time dateTime={dateString} className={`text-sm ${isToday(date) ? 'bg-pink-100 text-pink-700 rounded-full h-6 w-6 flex items-center justify-center font-bold' : ''}`}>{date.getDate()}</time>
                                {noteForDay && 
                                    <div 
                                        className="cursor-help"
                                        onMouseEnter={(e) => handleMouseEnter(e.currentTarget, <p className="whitespace-pre-wrap">{noteForDay}</p>)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <StickyNoteIcon className="w-6 h-6 text-yellow-400" />
                                    </div>
                                }
                            </div>
                            
                            {noteForDay && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 pointer-events-none">{noteForDay}</p>
                            )}
                            
                            <div className="flex-1 mt-1 overflow-y-auto text-xs space-y-1">
                                {eventsForDay.sort((a,b) => (a.time || '').localeCompare(b.time || '')).map(event => {
                                    const eventType = eventTypes.find(et => et.name === event.type);
                                    return (
                                        <div 
                                            key={event.id} 
                                            className={`${eventType?.bgColor} ${eventType?.textColor} p-1 rounded`}
                                            onMouseEnter={(e) => handleMouseEnter(e.currentTarget, (
                                                <>
                                                    <p className="font-bold whitespace-normal">{event.title}</p>
                                                    {event.time && <p className="text-gray-600">{event.time}</p>}
                                                    {event.notes && <p className="mt-1 pt-1 border-t border-gray-200 whitespace-pre-wrap text-gray-700">{event.notes}</p>}
                                                </>
                                            ))}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <p className="font-semibold text-xs truncate">{event.time ? `${event.time.split(' ')[0]} ` : ''}{event.title}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderWeekView = () => {
        return <div className="text-center p-8 bg-gray-50 rounded-lg">La vista de semana está en construcción.</div>;
    };

    const renderYearView = () => {
        return <div className="text-center p-8 bg-gray-50 rounded-lg">La vista de año está en construcción.</div>;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            <div className="w-full lg:w-1/4 bg-white p-4 rounded-lg shadow-md">
                 <h2 className="text-lg font-bold text-secondary mb-4">Tipos de Evento</h2>
                <button onClick={() => { setNewEvent({ ...newEvent, date: new Date().toISOString().split('T')[0]}); setIsEventModalOpen(true); }} className="w-full flex items-center justify-center bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-400 transition mb-4">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Crear Nuevo Evento
                </button>
                <div className="space-y-2">
                    <button onClick={() => setSelectedEventType('all')} className={`w-full text-left p-2 rounded-md transition-colors ${selectedEventType === 'all' ? 'bg-pink-100 text-pink-700 font-semibold' : 'hover:bg-gray-100'}`}>
                       Todos los Eventos
                    </button>
                    {eventTypes.map(type => (
                        <button key={type.name} onClick={() => setSelectedEventType(type.name)} className={`w-full text-left p-2 rounded-md transition-colors flex items-center ${selectedEventType === type.name ? `${type.bgColor} ${type.textColor} font-semibold` : 'hover:bg-gray-100'}`}>
                            <span className={`w-3 h-3 rounded-full mr-3 ${type.color}`}></span>{type.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-white p-6 rounded-lg shadow-md relative" ref={calendarContainerRef}>
                {renderHeader()}
                {view === 'month' ? renderMonthView() : view === 'week' ? renderWeekView() : renderYearView()}
                
                {popover?.visible && (
                    <div className="absolute z-20 w-64 bg-white rounded-lg shadow-lg border p-3 pointer-events-none" style={{ top: popover.top, left: popover.left }}>
                        {popover.content}
                    </div>
                )}
            </div>

            <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Agendar Nuevo Evento">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input type="text" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha</label>
                            <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Hora</label>
                            <TimePicker value={newEvent.time || '09:00 AM'} onChange={time => setNewEvent({ ...newEvent, time })} />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Evento</label>
                        <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value as CalendarEventType })} className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                            {eventTypes.map(type => (<option key={type.name} value={type.name}>{type.name}</option>))}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Notas (Opcional)</label>
                        <textarea value={newEvent.notes || ''} onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })} className="mt-1 w-full p-2 border border-gray-300 rounded-md" rows={3}></textarea>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button onClick={() => setIsEventModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button onClick={handleSaveEvent} className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-400">Guardar Evento</button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title={`Nota para ${selectedDate}`}>
                <div>
                    <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} className="w-full h-32 p-2 border border-gray-300 rounded-md font-sans text-sm" placeholder="Escribe tu nota aquí..."/>
                    <div className="flex justify-end space-x-2 mt-4">
                       <button onClick={() => setIsNoteModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                       <button onClick={handleSaveNote} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800">Guardar Nota</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CalendarView;
