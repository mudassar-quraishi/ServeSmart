import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function TableModal({ table, onClose, onSuccess }) {
    const isEdit = !!table;
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            tableNumber: table?.tableNumber || '',
            capacity: table?.capacity || table?.seatingCapacity || 2,
            status: table?.status || 'FREE',
        }
    });

    useEffect(() => {
        if (table) {
            reset({
                tableNumber: table.tableNumber || '',
                capacity: table.capacity || table.seatingCapacity || 2,
                status: table.status || 'FREE',
            });
        }
    }, [table, reset]);

    const onSubmit = async (data) => {
        try {
            if (isEdit) {
                await api.put(`/tables/${table.id}`, data);
                toast.success('Table updated successfully');
            } else {
                await api.post('/tables', data);
                toast.success('Table created successfully');
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} table`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-inverse-surface/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface rounded-xl shadow-elevated w-full min-w-[400px] max-w-[384px] flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
                <div className="p-lg border-b border-outline-variant flex justify-between items-center shrink-0">
                    <h2 className="font-headline-md font-bold text-on-surface">
                        {isEdit ? 'Edit Table' : 'Add New Table'}
                    </h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors p-xs rounded-full hover:bg-error-container">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-lg overflow-y-auto flex-1">
                    <form id="table-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
                        
                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-on-surface-variant">Table Number / Name *</label>
                            <input
                                {...register('tableNumber', { required: 'Table Number is required' })}
                                className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors uppercase"
                                placeholder="T-12"
                            />
                            {errors.tableNumber && <span className="text-error font-label-sm">{errors.tableNumber.message}</span>}
                        </div>

                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-on-surface-variant">Seating Capacity *</label>
                            <input
                                type="number"
                                {...register('capacity', { required: 'Capacity is required', min: 1, valueAsNumber: true })}
                                className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                placeholder="4"
                            />
                            {errors.capacity && <span className="text-error font-label-sm">{errors.capacity.message}</span>}
                        </div>

                        {!isEdit && (
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-on-surface-variant">Initial Status</label>
                                <select
                                    {...register('status')}
                                    className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                >
                                    <option value="FREE">Free</option>
                                    <option value="OCCUPIED">Occupied</option>
                                    <option value="RESERVED">Reserved</option>
                                </select>
                            </div>
                        )}
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
                        form="table-form"
                        disabled={isSubmitting}
                        className="px-lg py-sm rounded font-label-md bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-xs shadow-sm"
                    >
                        {isSubmitting && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                        {isEdit ? 'Save Changes' : 'Create Table'}
                    </button>
                </div>
            </div>
        </div>
    );
}
