import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function CustomerModal({ customer, onClose, onSuccess }) {
    const isEdit = !!customer;
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            name: customer?.name || '',
            phone: customer?.phone || '',
            email: customer?.email || '',
        }
    });

    useEffect(() => {
        if (customer) {
            reset({
                name: customer.name || '',
                phone: customer.phone || '',
                email: customer.email || '',
            });
        }
    }, [customer, reset]);

    const onSubmit = async (data) => {
        try {
            if (isEdit) {
                await api.put(`/customers/${customer.id}`, data);
                toast.success('Customer updated successfully');
            } else {
                await api.post('/customers', data);
                toast.success('Customer created successfully');
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} customer`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-inverse-surface/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface rounded-xl shadow-elevated w-full min-w-[400px] max-w-sm flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
                <div className="p-lg border-b border-outline-variant flex justify-between items-center shrink-0">
                    <h2 className="font-headline-md font-bold text-on-surface">
                        {isEdit ? 'Edit Customer' : 'Add New Customer'}
                    </h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors p-xs rounded-full hover:bg-error-container">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-lg overflow-y-auto flex-1">
                    <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
                        
                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-on-surface-variant">Full Name *</label>
                            <input
                                {...register('name', { required: 'Name is required' })}
                                className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                placeholder="Alice Smith"
                            />
                            {errors.name && <span className="text-error font-label-sm">{errors.name.message}</span>}
                        </div>

                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-on-surface-variant">Phone Number *</label>
                            <input
                                {...register('phone', { 
                                    required: 'Phone number is required',
                                    pattern: {
                                        value: /^\+?[0-9\s-]{10,15}$/,
                                        message: 'Invalid phone number format'
                                    }
                                })}
                                className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                placeholder="+91 98765 43210"
                            />
                            {errors.phone && <span className="text-error font-label-sm">{errors.phone.message}</span>}
                        </div>

                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-on-surface-variant">Email</label>
                            <input
                                type="email"
                                {...register('email')}
                                className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                placeholder="alice@example.com"
                            />
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
                        form="customer-form"
                        disabled={isSubmitting}
                        className="px-lg py-sm rounded font-label-md bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-xs shadow-sm"
                    >
                        {isSubmitting && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                        {isEdit ? 'Save Changes' : 'Create Customer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
