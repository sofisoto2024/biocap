
import React, { useState, useMemo } from 'react';
import Modal from './common/Modal';
import { CheckCircleIcon, UploadIcon, XIcon, SparklesIcon, TrashIcon, PlusIcon, SearchIcon } from './Icons';
import Spinner from './common/Spinner';
import type { User, TrainingModule, TrainingCompletion } from '../types';
import { geminiService } from '../services/geminiService';

interface TrainingViewProps {
    modules: TrainingModule[];
    addModule: (module: Omit<TrainingModule, 'id'>) => void;
    currentUser: User;
    trainingCompletions: TrainingCompletion[];
    completeTrainingModule: (moduleId: number) => void;
    deleteModule: (moduleId: number) => void;
}


const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    let videoId = '';
    try {
        if (url.includes('watch?v=')) {
            const urlParams = new URL(url).searchParams;
            videoId = urlParams.get('v') || '';
        } else if (url.includes('youtu.be/')) {
            const match = url.match(/youtu\.be\/([^&?/]+)/);
            videoId = match ? match[1] : '';
        } else if (url.includes('/embed/')) {
            const match = url.match(/\/embed\/([^&?/]+)/);
            videoId = match ? match[1] : '';
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    } catch (error) {
        console.error("Invalid URL for YouTube parsing", error);
        return null;
    }
    return null;
};


const TrainingView: React.FC<TrainingViewProps> = ({ modules, addModule, currentUser, trainingCompletions, completeTrainingModule, deleteModule }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
    const [newModule, setNewModule] = useState<Partial<Omit<TrainingModule, 'id' | 'duration' | 'assignedTo'>>>({});
    const [videoTab, setVideoTab] = useState<'upload' | 'youtube'>('upload');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [youtubeLink, setYoutubeLink] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isVideoCompleted, setIsVideoCompleted] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState<TrainingModule | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const isAdmin = currentUser.name === 'Sofia Soto';
    
    const userCompletedModuleIds = useMemo(() =>
        new Set(trainingCompletions
            .filter(comp => comp.userId === currentUser.id)
            .map(comp => comp.moduleId)
        ), [trainingCompletions, currentUser.id]);

    const filteredModules = useMemo(() => {
        return modules.filter(module =>
            module.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [modules, searchTerm]);

    const isSaveDisabled = useMemo(() => {
        return !newModule.title || !newModule.description || !newModule.imageUrl || isGeneratingImage;
    }, [newModule, isGeneratingImage]);

    const handleSaveModule = () => {
        if (isSaveDisabled) {
             alert("Por favor, completa todos los campos requeridos (Título, Contenido e Imagen).");
            return;
        }

        const moduleToSave: Omit<TrainingModule, 'id'> = {
            title: newModule.title!,
            description: newModule.description!,
            imageUrl: newModule.imageUrl!,
            duration: Math.ceil(newModule.description!.length / 100), // Estimate duration
            assignedTo: 0
        };

        if (videoFile) {
            moduleToSave.videoUrl = URL.createObjectURL(videoFile);
            moduleToSave.videoType = 'upload';
        } else if (youtubeLink) {
            const embedUrl = getYouTubeEmbedUrl(youtubeLink);
            if (embedUrl) {
                moduleToSave.videoUrl = embedUrl;
                moduleToSave.videoType = 'youtube';
            } else {
                alert("El enlace de YouTube no es válido. Por favor, verifica la URL.");
                return;
            }
        }

        addModule(moduleToSave);
        resetModal();
    };
    
    const resetModal = () => {
        setIsModalOpen(false);
        setNewModule({});
        setVideoFile(null);
        setYoutubeLink('');
        setVideoTab('upload');
        setIsGeneratingImage(false);
    }

    const handleGenerateImage = async () => {
        if (!newModule.title || newModule.imageUrl || isGeneratingImage) return;

        setIsGeneratingImage(true);
        try {
            const imageUrl = await geminiService.generateTrainingImage(newModule.title);
            setNewModule(prev => ({ ...prev, imageUrl }));
        } catch (error) {
            console.error("Error al generar la imagen:", error);
            alert("No se pudo generar la imagen. Inténtalo de nuevo.");
        } finally {
            setIsGeneratingImage(false);
        }
    };
    
    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setVideoFile(file);
        if (file) {
            setYoutubeLink(''); // Ensure exclusivity
        }
    };

    const handleYoutubeLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const link = e.target.value;
        setYoutubeLink(link);
        if (link) {
            setVideoFile(null); // Ensure exclusivity
        }
    };
    
    const handleOpenModule = (module: TrainingModule) => {
        setSelectedModule(module);
        setIsVideoCompleted(false); // Reset on open
    };

    const handleCompleteTraining = () => {
        if (selectedModule) {
            completeTrainingModule(selectedModule.id);
            setSelectedModule(null);
        }
    };
    
    const handleDeleteClick = (module: TrainingModule) => {
        setModuleToDelete(module);
        setIsConfirmDeleteOpen(true);
    };
    
    const confirmDelete = () => {
        if (moduleToDelete) {
            deleteModule(moduleToDelete.id);
            setIsConfirmDeleteOpen(false);
            setModuleToDelete(null);
        }
    };
    
    const formatContent = (content = '') => {
        // Simple formatter for the specific Gemini output structure
        return content
            .replace(/\*\*(.*?)\*\*/g, '<h3 class="font-bold text-md text-secondary mt-4 mb-2">$1</h3>')
            .replace(/\n/g, '<br />');
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-secondary hidden lg:block self-start sm:self-center">Cápsulas de Capacitación</h1>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                     <div className="relative flex-grow">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    {isAdmin && (
                        <button 
                            onClick={() => setIsDeleteMode(!isDeleteMode)} 
                            className={`flex items-center text-white font-bold py-2 px-4 rounded-lg transition ${isDeleteMode ? 'bg-red-600 hover:bg-red-800' : 'bg-secondary-600 hover:bg-secondary-800'}`}
                        >
                            <TrashIcon className="w-5 h-5 md:mr-2" />
                             <span className="hidden md:inline">{isDeleteMode ? 'Finalizar' : 'Eliminar'}</span>
                        </button>
                    )}
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800 transition">
                         <PlusIcon className="w-5 h-5 md:mr-2" />
                         <span className="hidden md:inline">Crear Cápsula</span>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map(module => (
                    <div 
                        key={module.id} 
                        onClick={() => !isDeleteMode && handleOpenModule(module)}
                        className={`bg-white rounded-lg shadow-md flex flex-col overflow-hidden group transform hover:scale-105 transition-transform duration-300 relative ${!isDeleteMode ? 'cursor-pointer' : ''}`}
                    >
                        {userCompletedModuleIds.has(module.id) && (
                            <div className="absolute inset-0 bg-pink-100 bg-opacity-70 flex items-center justify-center z-10 pointer-events-none">
                                <span className="text-3xl font-bold text-pink-700 uppercase transform -rotate-12 select-none">
                                    Completada
                                </span>
                            </div>
                        )}
                        {isDeleteMode && isAdmin && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(module);
                                }} 
                                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-800 transition z-20 shadow-lg"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        )}
                        <div className="h-full flex flex-col">
                            <div className="relative h-48">
                               <img src={module.imageUrl} alt={module.title} className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                            </div>
                            <div className="p-4 flex-grow flex flex-col">
                               <h2 className="text-lg font-bold text-secondary mb-2 flex-grow">{module.title}</h2>
                               <div className="mt-auto pt-2 border-t border-gray-200 flex justify-between text-sm text-gray-500">
                                  <span>Duración: {module.duration} min</span>
                                  <span>Asignado a: {module.assignedTo} usuarios</span>
                               </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={resetModal} title="Crear Nueva Cápsula de Capacitación">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                        <input
                            id="title"
                            type="text"
                            value={newModule.title || ''}
                            onChange={(e) => setNewModule({ ...newModule, title: e.target.value, imageUrl: undefined })}
                            onBlur={handleGenerateImage}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Contenido (compatible con Markdown)</label>
                        <textarea
                            id="description"
                            rows={8}
                            value={newModule.description || ''}
                            onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Imagen de Portada (generada por IA)</label>
                         <div className="mt-1 flex items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-md h-48">
                            {isGeneratingImage ? (
                                <div className="text-center">
                                    <div className="mx-auto animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <p className="mt-2 text-sm text-gray-500">Generando imagen...</p>
                                </div>
                            ) : newModule.imageUrl ? (
                                <img src={newModule.imageUrl} alt="Vista previa de la capacitación" className="max-h-full rounded-md object-contain" />
                            ) : (
                                <div className="text-center">
                                    <SparklesIcon className="mx-auto h-10 w-10 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">Escribe un título para generar una imagen.</p>
                                </div>
                            )}
                         </div>
                    </div>
                     <hr className="my-4" />
                    <div>
                        <h3 className="text-md font-medium text-gray-800 mb-2">Opcional: Adjuntar Video</h3>
                        <div className="flex border-b border-gray-200">
                            <button onClick={() => setVideoTab('upload')} className={`py-2 px-4 text-sm font-medium ${videoTab === 'upload' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                                Subir Video
                            </button>
                            <button onClick={() => setVideoTab('youtube')} className={`py-2 px-4 text-sm font-medium ${videoTab === 'youtube' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                                Enlace de YouTube
                            </button>
                        </div>
                        <div className="pt-4">
                            {videoTab === 'upload' && (
                                <div>
                                    <label htmlFor="video-upload" className="block text-sm font-medium text-gray-700">Seleccionar archivo de video</label>
                                    <input id="video-upload" type="file" accept="video/*" onChange={handleVideoFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                                    {videoFile && <p className="text-xs text-gray-600 mt-2">Archivo seleccionado: {videoFile.name}</p>}
                                </div>
                            )}
                            {videoTab === 'youtube' && (
                                <div>
                                    <label htmlFor="youtube-link" className="block text-sm font-medium text-gray-700">Pegar enlace de YouTube</label>
                                    <input id="youtube-link" type="text" value={youtubeLink} onChange={handleYoutubeLinkChange} placeholder="https://www.youtube.com/watch?v=..." className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button onClick={resetModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button onClick={handleSaveModule} disabled={isSaveDisabled} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800 disabled:bg-gray-400 disabled:cursor-not-allowed">Guardar Cápsula</button>
                    </div>
                </div>
            </Modal>
            
            {selectedModule && (
                <Modal isOpen={!!selectedModule} onClose={() => setSelectedModule(null)} title={selectedModule.title} size="xxl">
                    <div className="space-y-4">
                        {selectedModule.videoUrl ? (
                            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                                {selectedModule.videoType === 'youtube' ? (
                                    <iframe
                                        className="w-full h-full"
                                        src={selectedModule.videoUrl}
                                        title={selectedModule.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video
                                        className="w-full h-full"
                                        src={selectedModule.videoUrl}
                                        controls
                                        onEnded={() => setIsVideoCompleted(true)}
                                    >
                                        Tu navegador no soporta el tag de video.
                                    </video>
                                )}
                            </div>
                        ) : (
                            <img src={selectedModule.imageUrl} alt={selectedModule.title} className="w-full h-64 object-cover rounded-lg border" />
                        )}
                        
                        <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: formatContent(selectedModule.description) }} />
                        
                        <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t">
                            <span>Duración: {selectedModule.duration} min</span>
                            <span>Asignado a: {selectedModule.assignedTo} usuarios</span>
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4">
                             <button onClick={() => setSelectedModule(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cerrar</button>
                             <button 
                                onClick={handleCompleteTraining} 
                                disabled={(selectedModule.videoType === 'upload' && !isVideoCompleted) || userCompletedModuleIds.has(selectedModule.id)}
                                className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                             >
                                <CheckCircleIcon className="w-5 h-5 mr-2" />
                                {userCompletedModuleIds.has(selectedModule.id) ? 'Completada' : 'Capacitación Completa'}
                             </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Confirm Delete Modal */}
            <Modal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="Confirmar Eliminación">
                <div>
                    <p className="text-gray-700">¿Estás seguro de que quieres eliminar la cápsula <span className="font-bold">{moduleToDelete?.title}</span>? Esta acción es permanente.</p>
                    <div className="flex justify-end space-x-2 pt-6">
                        <button onClick={() => setIsConfirmDeleteOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button onClick={confirmDelete} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-800">
                            Eliminar Definitivamente
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TrainingView;