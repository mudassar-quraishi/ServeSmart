import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function EmployeeModal({ employee, onClose, onSuccess }) {
    const isEdit = !!employee;
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            fullName: employee?.fullName || '',
            phone: employee?.phone || '',
            email: employee?.email || '',
            username: employee?.username || '',
            password: '',
            roleName: employee?.roleName || 'WAITER',
            specialization: employee?.specialization || '',
            hireDate: employee?.hireDate || new Date().toISOString().split('T')[0],
        }
    });

    useEffect(() => {
        if (employee) {
            reset({
                fullName: employee.fullName || '',
                phone: employee.phone || '',
                email: employee.email || '',
                username: employee.username || '',
                roleName: employee.roleName || 'WAITER',
                specialization: employee.specialization || '',
                hireDate: employee.hireDate || new Date().toISOString().split('T')[0],
            });
        }
    }, [employee, reset]);

    const onSubmit = async (data) => {
        try {
            if (isEdit) {
                // Update
                const payload = {
                    fullName: data.fullName,
                    phone: data.phone,
                    specialization: data.specialization,
                    hireDate: data.hireDate,
                };
                await api.put(`/employees/${employee.id}`, payload);
                toast.success('Employee updated successfully');
            } else {
                // Create
                await api.post('/employees', data);
                toast.success('Employee created successfully');
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} employee`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-inverse-surface/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface rounded-xl shadow-elevated w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
                <div className="p-lg border-b border-outline-variant flex justify-between items-center shrink-0">
                    <h2 className="font-headline-md font-bold text-on-surface">
                        {isEdit ? 'Edit Employee Details' : 'Add New Employee'}
                    </h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors p-xs rounded-full hover:bg-error-container">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-lg overflow-y-auto flex-1">
                    <form id="employee-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
                        
                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-on-surface-variant">Full Name *</label>
                            <input
                                {...register('fullName', { required: 'Full name is required' })}
                                className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                placeholder="John Doe"
                            />
                            {errors.fullName && <span className="text-error font-label-sm">{errors.fullName.message}</span>}
                        </div>

                        {!isEdit && (
                            <div className="grid grid-cols-2 gap-md">
                                <div className="flex flex-col gap-xs">
                                    <label className="font-label-md text-on-surface-variant">Username *</label>
                                    <input
                                        {...register('username', { required: 'Username is required' })}
                                        className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                        placeholder="johndoe"
                                    />
                                    {errors.username && <span className="text-error font-label-sm">{errors.username.message}</span>}
                                </div>
                                <div className="flex flex-col gap-xs">
                                    <label className="font-label-md text-on-surface-variant">Password *</label>
                                    <input
                                        type="password"
                                        {...register('password', { required: 'Password is required' })}
                                        className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                        placeholder="••••••••"
                                    />
                                    {errors.password && <span className="text-error font-label-sm">{errors.password.message}</span>}
                                </div>
                            </div>
                        )}

                        {!isEdit && (
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-on-surface-variant">Role *</label>
                                <select
                                    {...register('roleName', { required: 'Role is required' })}
                                    className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                >
                                    <option value="MANAGER">Manager</option>
                                    <option value="WAITER">Waiter</option>
                                    <option value="CHEF">Chef</option>
                                    <option value="CASHIER">Cashier</option>
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-md">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-on-surface-variant">Phone Number</label>
                                <input
                                    {...register('phone')}
                                    className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-on-surface-variant">Email</label>
                                <input
                                    type="email"
                                    {...register('email')}
                                    className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-md">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-on-surface-variant">Specialization</label>
                                <input
                                    {...register('specialization')}
                                    className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                    placeholder="e.g. North Indian"
                                />
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-on-surface-variant">Hire Date</label>
                                <input
                                    type="date"
                                    {...register('hireDate')}
                                    className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-md border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-sm shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-lg py-sm rounded font-label-md text-on-surface-variant hover:bg-surface-variant transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="employee-form"
                        disabled={isSubmitting}
                        className="px-lg py-sm rounded font-label-md bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-xs shadow-sm"
                    >
                        {isSubmitting && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                        {isEdit ? 'Save Changes' : 'Create Employee'}
                    </button>
                </div>
            </div>
        </div>
    );
}
