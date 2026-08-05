import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import StockModal from '../components/StockModal';
import { useAuth } from '../../../contexts/AuthContext';

export default function InventoryList() {
    const { user } = useAuth();
    const isManager = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';
    const isChef = user?.role === 'CHEF';

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalAction, setModalAction] = useState('IN'); // 'IN' or 'OUT'
    const [filter, setFilter] = useState('ALL'); // ALL, LOW_STOCK, EXPIRING

    const fetchInventory = async () => {
        try {
            setLoading(true);
            let endpoint = '/inventory';
            if (filter === 'LOW_STOCK') endpoint = '/inventory/low-stock';
            if (filter === 'EXPIRING') endpoint = '/inventory/expiring';
            
            const { data } = await api.get(endpoint);
            setInventory(data);
        } catch (error) {
            toast.error('Failed to load inventory');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [filter]);

    const openModal = (item, action) => {
        setSelectedItem(item);
        setModalAction(action);
        setIsModalOpen(true);
    };

    return (
        <div className="flex-1 p-lg overflow-y-auto bg-background">
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-primary">Inventory Management</h1>
                    <p className="font-body-md text-on-surface-variant mt-xs">Track ingredient stock, low levels, and expirations.</p>
                </div>
            </div>

            <div className="flex gap-sm mb-lg border-b border-outline-variant pb-sm">
                <button
                    onClick={() => setFilter('ALL')}
                    className={`px-md py-sm rounded-t-lg font-label-md transition-colors ${
                        filter === 'ALL' 
                            ? 'bg-surface border-b-2 border-primary text-primary font-bold' 
                            : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                >
                    All Items
                </button>
                <button
                    onClick={() => setFilter('LOW_STOCK')}
                    className={`px-md py-sm rounded-t-lg font-label-md transition-colors flex items-center gap-xs ${
                        filter === 'LOW_STOCK' 
                            ? 'bg-surface border-b-2 border-secondary text-secondary font-bold' 
                            : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Low Stock
                </button>
                <button
                    onClick={() => setFilter('EXPIRING')}
                    className={`px-md py-sm rounded-t-lg font-label-md transition-colors flex items-center gap-xs ${
                        filter === 'EXPIRING' 
                            ? 'bg-surface border-b-2 border-error text-error font-bold' 
                            : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px]">event_busy</span>
                    Expiring Soon
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : inventory.length === 0 ? (
                <div className="bg-surface rounded-xl p-xl text-center border border-outline-variant">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-md">inventory_2</span>
                    <h3 className="font-headline-md text-on-surface mb-xs">No inventory items found</h3>
                    <p className="text-on-surface-variant font-body-md mb-lg">
                        {filter === 'ALL' ? 'No items tracked yet.' : 'Great! No items matching this alert criteria.'}
                    </p>
                </div>
            ) : (
                <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-label-md">
                                    <th className="p-md font-medium">Ingredient</th>
                                    <th className="p-md font-medium">Category</th>
                                    <th className="p-md font-medium">Current Stock</th>
                                    <th className="p-md font-medium">Status</th>
                                    <th className="p-md font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item) => {
                                    const isLowStock = item.currentStock <= item.reorderThreshold;
                                    const isExpiring = item.expiryDate && new Date(item.expiryDate) <= new Date(new Date().setDate(new Date().getDate() + 7));

                                    return (
                                        <tr key={item.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-lowest transition-colors">
                                            <td className="p-md">
                                                <div className="font-label-md font-bold text-on-surface">{item.ingredient.name}</div>
                                                {item.expiryDate && (
                                                    <div className={`font-label-sm mt-xs ${isExpiring ? 'text-error font-bold' : 'text-outline'}`}>
                                                        Exp: {item.expiryDate}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-md">
                                                <span className="bg-surface-container px-sm py-xs rounded font-label-sm text-on-surface-variant">
                                                    {item.ingredient.category}
                                                </span>
                                            </td>
                                            <td className="p-md">
                                                <div className="flex items-center gap-xs">
                                                    <span className={`font-headline-md font-bold ${isLowStock ? 'text-error' : 'text-on-surface'}`}>
                                                        {item.currentStock}
                                                    </span>
                                                    <span className="font-body-md text-on-surface-variant">{item.ingredient.baseUnit}</span>
                                                </div>
                                                <div className="font-label-sm text-outline mt-xs">Threshold: {item.reorderThreshold}</div>
                                            </td>
                                            <td className="p-md">
                                                {isLowStock ? (
                                                    <span className="flex items-center gap-xs text-error font-label-md">
                                                        <span className="material-symbols-outlined text-[16px]">warning</span> Low
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-xs text-tertiary-fixed-dim font-label-md">
                                                        <span className="material-symbols-outlined text-[16px]">check_circle</span> OK
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-md text-right">
                                                <div className="flex justify-end gap-sm">
                                                    {isManager && (
                                                        <button
                                                            onClick={() => openModal(item, 'IN')}
                                                            className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-md py-sm rounded font-label-md flex items-center gap-xs"
                                                            title="Stock In"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">add</span> In
                                                        </button>
                                                    )}
                                                    {(isManager || isChef) && (
                                                        <button
                                                            onClick={() => openModal(item, 'OUT')}
                                                            className="bg-error/10 text-error hover:bg-error/20 transition-colors px-md py-sm rounded font-label-md flex items-center gap-xs"
                                                            title="Stock Out / Wastage"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">remove</span> Out
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <StockModal
                    item={selectedItem}
                    action={modalAction}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchInventory();
                    }}
                />
            )}
        </div>
    );
}
