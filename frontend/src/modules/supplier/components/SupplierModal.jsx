import { useForm } from 'react-hook-form';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function SupplierModal({ onClose, onSuccess }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            name: '',
            contactPhone: '',
            email: '',
            address: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            await api.post('/suppliers', data);
            toast.success('Supplier created successfully');
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create supplier');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-inverse-surface/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface rounded-xl shadow-elevated w-full min-w-[400px] max-w-md flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
                <div className="p-lg border-b border-outline-variant flex justify-between items-center shrink-0">
                    <h2 className="font-headline-md font-bold text-on-surface">Add New Supplier</h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors p-xs rounded-full hover:bg-error-container">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-lg overflow-y-auto flex-1">
                    <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
                        
                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-on-surface-variant">Supplier Name *</label>
                            <input
                                {...register('name', { required: 'Name is required' })}
                                className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                placeholder="Fresh Farms Pvt Ltd"
                            />
                            {errors.name && <span className="text-error font-label-sm">{errors.name.message}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-md">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-on-surface-variant">Phone Number</label>
                                <input
                                    {...register('contactPhone')}
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
                                    placeholder="contact@freshfarms.com"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-on-surface-variant">Address</label>
                            <textarea
                                {...register('address')}
                                className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors resize-none h-24"
                                placeholder="123 Market Road..."
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
                        form="supplier-form"
                        disabled={isSubmitting}
                        className="px-lg py-sm rounded font-label-md bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-xs shadow-sm"
                    >
                        {isSubmitting && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                        Save Supplier
                    </button>
                </div>
            </div>
        </div>
    );
}
