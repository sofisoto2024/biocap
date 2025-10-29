import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import Modal from './common/Modal';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (user: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState(user);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '' });
    
    useEffect(() => {
        if (isOpen) {
            setFormData(user);
            setNewPassword('');
            setConfirmPassword('');
            setErrors({ email: '', password: '' });
        }
    }, [isOpen, user]);

    const validate = () => {
        const newErrors = { email: '', password: '' };
        let isValid = true;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Por favor, introduce un correo válido.';
            isValid = false;
        }
        
        // Do not validate passwords if both fields are empty.
        // This allows users to save other profile changes without touching their password.
        if (newPassword || confirmPassword) {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
            
            if (!newPassword || !confirmPassword) {
                newErrors.password = 'Ambos campos de contraseña son requeridos para cambiarla.';
                isValid = false;
            } else if (newPassword !== confirmPassword) {
                newErrors.password = 'Las contraseñas no coinciden.';
                isValid = false;
            } else if (!passwordRegex.test(newPassword)) {
                newErrors.password = 'La contraseña debe tener al menos 8 caracteres, un número y un símbolo.';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveClick = () => {
        if (validate()) {
            // In a real app, you would handle the password change here
            // For now, we just save the other user data
            onSave(formData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Mi Perfil">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
                    <div className="flex items-center space-x-4">
                        <img
                            src={formData.avatar || 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'}
                            alt="Vista previa del Avatar"
                            className="h-16 w-16 rounded-full object-cover bg-gray-200"
                        />
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            id="photo-upload-profile"
                            className="hidden"
                            onChange={handlePhotoUpload}
                        />
                        <label
                            htmlFor="photo-upload-profile"
                            className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Cambiar Foto
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                         {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                </div>

                <hr />

                <div className="space-y-4">
                     <h3 className="text-lg font-medium text-gray-900">Cambiar Contraseña</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md" 
                            />
                        </div>
                     </div>
                     {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleSaveClick} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800">Guardar Cambios</button>
                </div>
            </div>
        </Modal>
    );
};

export default EditProfileModal;
