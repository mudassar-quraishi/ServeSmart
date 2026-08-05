import { useForm } from 'react-hook-form';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function StockModal({ item, action, onClose, onSuccess }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            quantity: '',
            unit: item?.ingredient?.baseUnit || 'KG',
            note: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            const endpoint = `/inventory/${item.ingredient.id}/stock-${action.toLowerCase()}`;
            await api.post(endpoint, data);
            toast.success(`Stock ${action === 'IN' ? 'added' : 'deducted'} successfully`);
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to adjust stock');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-inverse-surface/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface rounded-xl shadow-elevated w-full max-w-sm flex flex-col overflow-hidden animate-slide-up">
                <div className={`p-lg border-b border-outline-variant flex justify-between items-center ${action === 'IN' ? 'bg-primary/5' : 'bg-error/5'}`}>
                    <h2 className={`font-headline-md font-bold flex items-center gap-xs ${action === 'IN' ? 'text-primary' : 'text-error'}`}>
                        <span className="material-symbols-outlined">{action === 'IN' ? 'add_circle' : 'remove_circle'}</span>
                        Stock {action === 'IN' ? 'In' : 'Out'} - {item?.ingredient?.name}
                    </h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors p-xs rounded-full hover:bg-error-container">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-lg">
                    <form id="stock-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
                        
                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-on-surface-variant">Quantity *</label>
                            <div className="flex gap-sm">
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('quantity', { required: 'Quantity is required', min: 0.01 })}
                                    className="flex-1 px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                    placeholder="Enter amount"
                                />
                                <input
                                    type="text"
                                    disabled
                                    value={item?.ingredient?.baseUnit || ''}
                                    className="w-20 px-sm py-sm border border-outline-variant rounded bg-surface-container-low text-on-surface-variant text-center"
                                />
                            </div>
                            {errors.quantity && <span className="text-error font-label-sm">{errors.quantity.message}</span>}
                        </div>

                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-on-surface-variant">Note / Reason</label>
                            <input
                                {...register('note')}
                                className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                placeholder={action === 'IN' ? 'e.g. New delivery' : 'e.g. Wastage / Used in kitchen'}
                            />
                        </div>

                    </form>
                </div>

                <div className="p-md border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-sm">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-lg py-sm rounded font-label-md text-on-surface-variant hover:bg-surface-variant transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="stock-form"
                        disabled={isSubmitting}
                        className={`px-lg py-sm rounded font-label-md text-white transition-colors disabled:opacity-50 flex items-center gap-xs shadow-sm ${
                            action === 'IN' ? 'bg-primary hover:bg-primary/90' : 'bg-error hover:bg-error/90'
                        }`}
                    >
                        {isSubmitting && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
