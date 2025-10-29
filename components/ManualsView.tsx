
import React, { useState, useMemo } from 'react';
import type { Manual, User, ManualCompletion } from '../types';
import Modal from './common/Modal';
import Spinner from './common/Spinner';
import { PlusIcon, CheckCircleIcon, XIcon, TrashIcon, SparklesIcon, UploadIcon, SearchIcon } from './Icons';
import { geminiService } from '../services/geminiService';
import jsPDF from 'jspdf';


interface ManualsViewProps {
    manuals: Manual[];
    addManual: (manual: Omit<Manual, 'id'>) => void;
    currentUser: User;
    manualCompletions: ManualCompletion[];
    completeManual: (manualId: number) => void;
    deleteManual: (manualId: number) => void;
}

const ManualsView: React.FC<ManualsViewProps> = ({ manuals, addManual, currentUser, manualCompletions, completeManual, deleteManual }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
    const [viewingManual, setViewingManual] = useState<Manual | null>(null);
    const [newManual, setNewManual] = useState<Partial<Omit<Manual, 'id' | 'createdOn' | 'pdfUrl'>>>({});
    const [manualImageFile, setManualImageFile] = useState<File | null>(null);
    const [manualImagePreview, setManualImagePreview] = useState<string>('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [manualToDelete, setManualToDelete] = useState<Manual | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const isAdmin = currentUser.name === 'Sofia Soto';

    const userCompletedManualIds = useMemo(() => 
        new Set(manualCompletions
            .filter(comp => comp.userId === currentUser.id)
            .map(comp => comp.manualId)
        ), [manualCompletions, currentUser.id]);
        
    const filteredManuals = useMemo(() => {
        return manuals.filter(manual =>
            manual.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [manuals, searchTerm]);

    const isSaveDisabled = useMemo(() => {
        return !newManual.title || !newManual.equipment || !manualImageFile || !newManual.imageUrl || isGeneratingImage || isConverting;
    }, [newManual, manualImageFile, isGeneratingImage, isConverting]);

    const handleGenerateImage = async () => {
        if (!newManual.equipment || newManual.imageUrl || isGeneratingImage) return;

        setIsGeneratingImage(true);
        try {
            const imageUrl = await geminiService.generateTrainingImage(newManual.equipment);
            setNewManual(prev => ({ ...prev, imageUrl }));
        } catch (error) {
            console.error("Error al generar la imagen:", error);
            alert("No se pudo generar la imagen. Inténtalo de nuevo.");
        } finally {
            setIsGeneratingImage(false);
        }
    };
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setManualImageFile(file);
            setManualImagePreview(URL.createObjectURL(file));
        }
    };
    
    const handleSaveManual = async () => {
        if (isSaveDisabled) {
            alert('Por favor, completa todos los campos, sube una imagen y espera a que se genere la portada.');
            return;
        }
        if (!manualImageFile) return;

        setIsConverting(true);

        const reader = new FileReader();
        reader.readAsDataURL(manualImageFile);
        reader.onload = (event) => {
            const imgData = event.target?.result as string;
            const img = new Image();
            img.src = imgData;
            img.onload = () => {
                const doc = new jsPDF({
                    orientation: img.width > img.height ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [img.width, img.height]
                });
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                
                doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
                const pdfDataUri = doc.output('datauristring');

                addManual({
                    title: newManual.title!,
                    equipment: newManual.equipment!,
                    imageUrl: newManual.imageUrl!,
                    pdfUrl: pdfDataUri,
                    createdOn: new Date().toISOString().split('T')[0],
                });

                setIsConverting(false);
                resetForm();
            }
            img.onerror = () => {
                 alert("Error al cargar la imagen para convertir a PDF.");
                 setIsConverting(false);
            }
        }
        reader.onerror = () => {
            alert("Error al leer el archivo de imagen.");
            setIsConverting(false);
        }
    };
    
    const handleViewManual = (manual: Manual) => {
        setViewingManual(manual);
        setIsViewerModalOpen(true);
    };
    
    const handleCompleteManual = () => {
        if (viewingManual) {
            completeManual(viewingManual.id);
            setIsViewerModalOpen(false);
            setViewingManual(null);
        }
    };

    const handleDeleteClick = (manual: Manual) => {
        setManualToDelete(manual);
        setIsConfirmDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (manualToDelete) {
            deleteManual(manualToDelete.id);
            setIsConfirmDeleteOpen(false);
            setManualToDelete(null);
        }
    };
    
    const resetForm = () => {
        setIsCreateModalOpen(false);
        setNewManual({});
        setManualImageFile(null);
        setManualImagePreview('');
        setIsGeneratingImage(false);
        setIsConverting(false);
    };
    

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-secondary hidden lg:block self-start sm:self-center">Manuales de Equipos</h1>
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
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800 transition">
                        <PlusIcon className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline">Crear Manual</span>
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredManuals.map(manual => (
                    <div 
                        key={manual.id} 
                        onClick={() => !isDeleteMode && handleViewManual(manual)}
                        className={`bg-white rounded-lg shadow-md flex flex-col overflow-hidden group transform hover:scale-105 transition-transform duration-300 relative ${!isDeleteMode ? 'cursor-pointer' : ''}`}
                    >
                        {userCompletedManualIds.has(manual.id) && (
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
                                    handleDeleteClick(manual);
                                }} 
                                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-800 transition z-20 shadow-lg"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        )}
                        <div className="h-full flex flex-col">
                           <div className="relative h-48">
                               <img src={manual.imageUrl} alt={manual.title} className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                            </div>
                           <div className="p-4 flex-grow flex flex-col">
                               <h2 className="text-lg font-bold text-secondary mb-2 flex-grow">{manual.title}</h2>
                               <div className="mt-auto pt-2 border-t border-gray-200 flex justify-between text-sm text-gray-500">
                                  <span>Equipo: {manual.equipment}</span>
                               </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={resetForm} title="Crear Nuevo Manual">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título del Manual</label>
                        <input 
                            type="text" 
                            value={newManual.title || ''} 
                            onChange={e => setNewManual({...newManual, title: e.target.value})} 
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md" 
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Equipo</label>
                        <input 
                            type="text" 
                            value={newManual.equipment || ''} 
                            onChange={e => setNewManual({...newManual, equipment: e.target.value, imageUrl: undefined})} 
                            onBlur={handleGenerateImage}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subir Imagen del Manual (se convertirá a PDF)</label>
                        <div className="mt-1 flex items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-md h-48">
                            {manualImagePreview ? (
                                <img src={manualImagePreview} alt="Vista previa del manual" className="max-h-full rounded-md object-contain" />
                            ) : (
                                <label htmlFor="manual-upload" className="cursor-pointer text-center">
                                    <UploadIcon className="mx-auto h-10 w-10 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">Haz clic para subir una imagen</p>
                                </label>
                            )}
                            <input id="manual-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                         </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Imagen de Portada (generada por IA)</label>
                         <div className="mt-1 flex items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-md h-48">
                            {isGeneratingImage ? (
                                <div className="text-center">
                                    <div className="mx-auto animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <p className="mt-2 text-sm text-gray-500">Generando portada...</p>
                                </div>
                            ) : newManual.imageUrl ? (
                                <img src={newManual.imageUrl} alt="Vista previa de portada" className="max-h-full rounded-md object-contain" />
                            ) : (
                                <div className="text-center">
                                    <SparklesIcon className="mx-auto h-10 w-10 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">Escribe un nombre de equipo para generar una portada.</p>
                                </div>
                            )}
                         </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button onClick={resetForm} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button onClick={handleSaveManual} disabled={isSaveDisabled} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800 disabled:bg-primary-300 flex items-center justify-center w-36">
                            {isConverting ? <Spinner /> : isGeneratingImage ? <Spinner/> : 'Guardar Manual'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Viewer Modal */}
            {viewingManual && (
                <Modal isOpen={isViewerModalOpen} onClose={() => setIsViewerModalOpen(false)} title={viewingManual.title} size="xxl">
                    <div className="w-full h-[75vh]">
                       <iframe src={viewingManual.pdfUrl} width="100%" height="100%" title={viewingManual.title} />
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t mt-4">
                        <span>Equipo: {viewingManual.equipment}</span>
                        <span>Creado el: {new Date(viewingManual.createdOn).toLocaleDateString('es-ES')}</span>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleCompleteManual} 
                            disabled={userCompletedManualIds.has(viewingManual.id)}
                            className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                        >
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            {userCompletedManualIds.has(viewingManual.id) ? 'Completado' : 'Marcar como Completado'}
                        </button>
                    </div>
                </Modal>
            )}

             {/* Confirm Delete Modal */}
             <Modal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="Confirmar Eliminación">
                <div>
                    <p className="text-gray-700">¿Estás seguro de que quieres eliminar el manual <span className="font-bold">{manualToDelete?.title}</span>? Esta acción es permanente.</p>
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

export default ManualsView;