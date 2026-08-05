import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function MenuModal({ item, categories = [], onClose, onSuccess }) {
    const isEdit = !!item;
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            name: item?.name || '',
            description: item?.description || '',
            price: item?.price || '',
            categoryId: item?.category?.id || 1,
            isAvailable: item ? item.isAvailable : true,
            gstSlab: item?.gstSlab || 'FIVE',
        }
    });

    useEffect(() => {
        if (item) {
            reset({
                name: item.name || '',
                description: item.description || '',
                price: item.price || '',
                categoryId: item.category?.id || 1,
                isAvailable: item.isAvailable,
                gstSlab: item.gstSlab || 'FIVE',
            });
        }
    }, [item, reset]);

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                categoryId: parseInt(data.categoryId, 10),
            };
            if (isEdit) {
                await api.put(`/menu/items/${item.id}`, payload);
                toast.success('Menu item updated successfully');
            } else {
                await api.post('/menu/items', payload);
                toast.success('Menu item created successfully');
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} menu item`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-inverse-surface/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface rounded-xl shadow-elevated w-full min-w-[500px] max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
                <div className="p-lg border-b border-outline-variant flex justify-between items-center shrink-0">
                    <h2 className="font-headline-md font-bold text-on-surface">
                        {isEdit ? 'Edit Menu Item' : 'Add New Item'}
                    </h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors p-xs rounded-full hover:bg-error-container">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-lg overflow-y-auto flex-1">
                    <form id="menu-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
                        
                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-on-surface-variant">Item Name *</label>
                            <input
                                {...register('name', { required: 'Name is required' })}
                                className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                placeholder="Paneer Tikka"
                            />
                            {errors.name && <span className="text-error font-label-sm">{errors.name.message}</span>}
                        </div>

                        <div className="flex flex-col gap-xs">
                            <label className="font-label-md text-on-surface-variant">Description</label>
                            <textarea
                                {...register('description')}
                                className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors resize-none h-24"
                                placeholder="Spicy grilled paneer cubes..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-md">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-on-surface-variant">Price (₹) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('price', { required: 'Price is required', min: 0 })}
                                    className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                    placeholder="250.00"
                                />
                                {errors.price && <span className="text-error font-label-sm">{errors.price.message}</span>}
                            </div>
                            
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-on-surface-variant">Category *</label>
                                <select
                                    {...register('categoryId', { required: 'Category is required', valueAsNumber: true })}
                                    className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-md">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-on-surface-variant">GST Slab *</label>
                                <select
                                    {...register('gstSlab', { required: 'GST Slab is required' })}
                                    className="px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                                >
                                    <option value="FIVE">5% (Food & Beverage)</option>
                                    <option value="TWELVE">12% (Packaged Items)</option>
                                    <option value="EIGHTEEN">18% (Services/Liquor)</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-sm mt-lg">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    {...register('isAvailable')}
                                    className="w-4 h-4 text-secondary rounded border-outline-variant focus:ring-secondary"
                                />
                                <label htmlFor="isAvailable" className="font-label-md text-on-surface">Available for Ordering</label>
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
                        form="menu-form"
                        disabled={isSubmitting}
                        className="px-lg py-sm rounded font-label-md bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-xs shadow-sm"
                    >
                        {isSubmitting && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                        {isEdit ? 'Save Changes' : 'Create Item'}
                    </button>
                </div>
            </div>
        </div>
    );
}
