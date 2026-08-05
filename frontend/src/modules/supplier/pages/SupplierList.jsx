import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import SupplierModal from '../components/SupplierModal';

export default function SupplierList() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/suppliers');
            setSuppliers(data);
        } catch (error) {
            toast.error('Failed to load suppliers');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    return (
        <div className="flex-1 p-lg overflow-y-auto bg-background">
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-primary">Suppliers</h1>
                    <p className="font-body-md text-on-surface-variant mt-xs">Manage vendors and purchase order sources.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-secondary text-on-secondary px-lg py-sm rounded-lg font-label-md hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-xs"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Supplier
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
            ) : suppliers.length === 0 ? (
                <div className="bg-surface rounded-xl p-xl text-center border border-outline-variant">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-md">local_shipping</span>
                    <h3 className="font-headline-md text-on-surface mb-xs">No suppliers found</h3>
                    <p className="text-on-surface-variant font-body-md mb-lg">Start by adding your first vendor.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                    {suppliers.map(supplier => (
                        <div key={supplier.id} className="bg-surface rounded-xl border border-outline-variant p-md shadow-sm flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-sm mb-md pb-sm border-b border-outline-variant/50">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">storefront</span>
                                </div>
                                <h3 className="font-headline-md font-bold text-on-surface">{supplier.name}</h3>
                            </div>
                            
                            <div className="flex flex-col gap-sm flex-1">
                                <div className="flex items-center gap-sm text-on-surface-variant font-body-md">
                                    <span className="material-symbols-outlined text-[18px]">call</span>
                                    {supplier.contactPhone || 'N/A'}
                                </div>
                                <div className="flex items-center gap-sm text-on-surface-variant font-body-md">
                                    <span className="material-symbols-outlined text-[18px]">mail</span>
                                    {supplier.email || 'N/A'}
                                </div>
                                <div className="flex items-center gap-sm text-on-surface-variant font-body-md">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    <span className="line-clamp-2">{supplier.address || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <SupplierModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchSuppliers();
                    }}
                />
            )}
        </div>
    );
}
