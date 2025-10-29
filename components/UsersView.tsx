

import React, { useState, useMemo } from 'react';
import type { User } from '../types';
import Modal from './common/Modal';
import { PlusIcon, TrashIcon, HealthIcon, GearIcon, EditIcon } from './Icons';

type NewUserFormState = Omit<User, 'id' | 'lastTraining' | 'status'>;

interface UsersViewProps {
    users: User[];
    addUser: (user: NewUserFormState) => void;
    deleteUser: (userId: number) => void;
    updateUser: (user: User) => void;
    currentUser: User;
}

const initialFormState: NewUserFormState = {
    name: '',
    email: '',
    role: 'Clínico',
    department: 'Cardiología',
    avatar: '',
};

const UsersView: React.FC<UsersViewProps> = ({ users, addUser, deleteUser, updateUser, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    
    const [newUser, setNewUser] = useState<NewUserFormState>(initialFormState);
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [formErrors, setFormErrors] = useState({ email: '', password: '' });
    const [editFormErrors, setEditFormErrors] = useState({ email: '', password: '' });

    const isAdmin = currentUser.name === 'Sofia Soto';

    const validateForm = () => {
        const errors = { email: '', password: '' };
        let isValid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (newUser.email && !emailRegex.test(newUser.email)) {
            errors.email = 'Por favor, introduce un correo válido.';
            isValid = false;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (password && !passwordRegex.test(password)) {
            errors.password = '8+ caracteres, un número y un símbolo.';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };
    
    const isSaveDisabled = useMemo(() => {
        if (!newUser.name || !newUser.email || !password || (newUser.role === 'Clínico' && !newUser.department)) {
            return true;
        }
        // This is a computed property, calling a state setter inside is an anti-pattern.
        // The validation logic should be separate.
        return formErrors.email !== '' || formErrors.password !== '';
    }, [newUser, password, formErrors]);

    const validateEditForm = () => {
        if (!userToEdit) return false;
        const errors = { email: '', password: '' };
        let isValid = true;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (userToEdit.email && !emailRegex.test(userToEdit.email)) {
            errors.email = 'Por favor, introduce un correo válido.';
            isValid = false;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (newPassword && !passwordRegex.test(newPassword)) { // Only validate if new password is entered
            errors.password = '8+ caracteres, un número y un símbolo.';
            isValid = false;
        }
        setEditFormErrors(errors);
        return isValid;
    };

    const isEditSaveDisabled = useMemo(() => {
        if (!userToEdit || !userToEdit.name || !userToEdit.email || (userToEdit.role === 'Clínico' && !userToEdit.department)) {
            return true;
        }
        return editFormErrors.email !== '' || editFormErrors.password !== '';
    }, [userToEdit, editFormErrors]);

    const getStatusBadge = (status: User['status']) => {
        switch (status) {
            case 'Capacitado':
                return 'bg-green-100 text-green-800';
            case 'Pendiente':
                return 'bg-yellow-100 text-yellow-800';
            case 'Atrasado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    const handleEditClick = (user: User) => {
        setUserToEdit(user);
        setIsEditModalOpen(true);
        setNewPassword('');
        setEditFormErrors({ email: '', password: '' });
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete.id);
            setIsConfirmModalOpen(false);
            setUserToDelete(null);
        }
    };

    const handleSaveUser = () => {
        if (validateForm()) {
            addUser(newUser);
            setIsModalOpen(false);
            setNewUser(initialFormState);
            setPassword('');
            setFormErrors({ email: '', password: '' });
        }
    };

    const handleUpdateUser = () => {
        if (userToEdit && validateEditForm()) {
            updateUser(userToEdit);
            setIsEditModalOpen(false);
            setUserToEdit(null);
            setNewPassword('');
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };
    
    // Validate on blur for better UX
    const handleBlur = () => {
        validateForm();
    }

    const handleEditBlur = () => {
        validateEditForm();
    }

    const handleRoleChange = (selectedRole: 'Clínico' | 'Técnico') => {
        setNewUser(prev => {
            const updatedUser = { ...prev, role: selectedRole };
            if (selectedRole === 'Técnico') {
                delete (updatedUser as Partial<NewUserFormState>).department;
            } else {
                updatedUser.department = prev.department || 'Cardiología';
            }
            return updatedUser;
        });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewUser(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Edit Modal Handlers ---
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!userToEdit) return;
        const { name, value } = e.target;
        setUserToEdit(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(e.target.value);
    };

    const handleEditRoleChange = (selectedRole: 'Clínico' | 'Técnico') => {
        setUserToEdit(prev => {
            if (!prev) return null;
            const updatedUser = { ...prev, role: selectedRole };
            if (selectedRole === 'Técnico') {
                delete (updatedUser as Partial<User>).department;
            } else {
                updatedUser.department = prev.department || 'Cardiología';
            }
            return updatedUser;
        });
    };

    const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && userToEdit) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserToEdit(prev => prev ? { ...prev, avatar: reader.result as string } : null);
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-secondary hidden lg:block">Gestión de Usuarios</h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800 transition">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Crear Nuevo Usuario
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nombre</th>
                                <th scope="col" className="px-6 py-3">Departamento</th>
                                <th scope="col" className="px-6 py-3">Última Capacitación</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <img className="h-9 w-9 rounded-full object-cover" src={user.avatar} alt={user.name} />
                                            <span>{user.name}</span>
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">{user.department || 'N/A'}</td>
                                    <td className="px-6 py-4">{user.lastTraining}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                       {isAdmin && user.id !== currentUser.id && (
                                            <div className="flex items-center justify-end">
                                                <button onClick={() => handleEditClick(user)} className="text-primary-600 hover:text-primary-800 p-1 rounded-full hover:bg-primary-100 mr-2">
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteClick(user)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                       )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Create User Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nuevo Usuario">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
                        <div className="flex items-center space-x-4">
                            <img
                                src={newUser.avatar || 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'}
                                alt="Vista previa del Avatar"
                                className="h-16 w-16 rounded-full object-cover bg-gray-200"
                            />
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                id="photo-upload"
                                className="hidden"
                                onChange={handlePhotoUpload}
                            />
                            <label
                                htmlFor="photo-upload"
                                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Subir Foto
                            </label>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input type="text" name="name" value={newUser.name} onChange={handleInputChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                            <input type="email" name="email" value={newUser.email} onChange={handleInputChange} onBlur={handleBlur} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input type="password" name="password" value={password} onChange={handlePasswordChange} onBlur={handleBlur} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                            {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                        </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          onClick={() => handleRoleChange('Clínico')}
                          className={`cursor-pointer p-4 border rounded-lg text-center transition-all duration-200 flex flex-col items-center justify-center ${newUser.role === 'Clínico' ? 'border-primary ring-2 ring-primary bg-primary-50' : 'border-gray-300 hover:border-gray-400'}`}
                        >
                          <HealthIcon className="w-6 h-6 text-blue-400 mb-2" />
                          <h3 className="font-semibold text-gray-800">Clínico</h3>
                          <p className="text-xs text-gray-500 mt-1">Personal médico que opera directamente los equipos.</p>
                        </div>
                        <div
                          onClick={() => handleRoleChange('Técnico')}
                          className={`cursor-pointer p-4 border rounded-lg text-center transition-all duration-200 flex flex-col items-center justify-center ${newUser.role === 'Técnico' ? 'border-primary ring-2 ring-primary bg-primary-50' : 'border-gray-300 hover:border-gray-400'}`}
                        >
                          <GearIcon className="w-6 h-6 text-purple-500 mb-2" />
                          <h3 className="font-semibold text-gray-800">Técnico</h3>
                          <p className="text-xs text-gray-500 mt-1">Personal de mantenimiento y calibración de equipos.</p>
                        </div>
                      </div>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700">Área Específica</label>
                        <select name="department" value={newUser.department || ''} onChange={handleInputChange} disabled={newUser.role === 'Técnico'} className="mt-1 w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed">
                            <option>Cardiología</option>
                            <option>Radiología</option>
                            <option>Cirugía</option>
                            <option>UCI</option>
                            <option>Administración</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button onClick={handleSaveUser} disabled={isSaveDisabled} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800 disabled:bg-gray-400 disabled:cursor-not-allowed">Guardar Usuario</button>
                    </div>
                </div>
            </Modal>

            {/* Edit User Modal */}
            {userToEdit && (
                 <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Editar Usuario: ${userToEdit.name}`}>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
                            <div className="flex items-center space-x-4">
                                <img
                                    src={userToEdit.avatar || 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'}
                                    alt="Vista previa del Avatar"
                                    className="h-16 w-16 rounded-full object-cover bg-gray-200"
                                />
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    id="photo-upload-edit"
                                    className="hidden"
                                    onChange={handleEditPhotoUpload}
                                />
                                <label
                                    htmlFor="photo-upload-edit"
                                    className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    Cambiar Foto
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                                <input type="text" name="name" value={userToEdit.name} onChange={handleEditInputChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                <input type="email" name="email" value={userToEdit.email} onChange={handleEditInputChange} onBlur={handleEditBlur} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                                {editFormErrors.email && <p className="text-red-500 text-xs mt-1">{editFormErrors.email}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Nueva Contraseña (dejar en blanco para no cambiar)</label>
                                <input type="password" name="password" value={newPassword} onChange={handleNewPasswordChange} onBlur={handleEditBlur} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                                {editFormErrors.password && <p className="text-red-500 text-xs mt-1">{editFormErrors.password}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div onClick={() => handleEditRoleChange('Clínico')} className={`cursor-pointer p-4 border rounded-lg text-center transition-all duration-200 flex flex-col items-center justify-center ${userToEdit.role === 'Clínico' ? 'border-primary ring-2 ring-primary bg-primary-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                    <HealthIcon className="w-6 h-6 text-blue-400 mb-2 mx-auto" />
                                    <h3 className="font-semibold text-gray-800">Clínico</h3>
                                    <p className="text-xs text-gray-500 mt-1">Personal médico que opera directamente los equipos.</p>
                                </div>
                                <div onClick={() => handleEditRoleChange('Técnico')} className={`cursor-pointer p-4 border rounded-lg text-center transition-all duration-200 flex flex-col items-center justify-center ${userToEdit.role === 'Técnico' ? 'border-primary ring-2 ring-primary bg-primary-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                    <GearIcon className="w-6 h-6 text-purple-500 mb-2 mx-auto" />
                                    <h3 className="font-semibold text-gray-800">Técnico</h3>
                                    <p className="text-xs text-gray-500 mt-1">Personal de mantenimiento y calibración de equipos.</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Área Específica</label>
                            <select name="department" value={userToEdit.department || ''} onChange={handleEditInputChange} disabled={userToEdit.role === 'Técnico'} className="mt-1 w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100">
                                <option>Cardiología</option>
                                <option>Radiología</option>
                                <option>Cirugía</option>
                                <option>UCI</option>
                                <option>Administración</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <button onClick={() => setIsEditModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                            <button onClick={handleUpdateUser} disabled={isEditSaveDisabled} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800 disabled:bg-gray-400">Guardar Cambios</button>
                        </div>
                    </div>
                 </Modal>
            )}


            {/* Confirm Delete Modal */}
             <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirmar Eliminación">
                <div>
                    <p className="text-gray-700">¿Estás seguro de que quieres eliminar a <span className="font-bold">{userToDelete?.name}</span>? Esta acción es permanente.</p>
                    <div className="flex justify-end space-x-2 pt-6">
                        <button onClick={() => setIsConfirmModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button onClick={confirmDelete} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-800">
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UsersView;