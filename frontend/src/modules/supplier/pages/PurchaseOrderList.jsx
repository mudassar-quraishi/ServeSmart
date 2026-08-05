import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function PurchaseOrderList() {
    const [pos, setPos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPOs = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/purchase-orders');
            setPos(data);
        } catch (error) {
            toast.error('Failed to load purchase orders');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPOs();
    }, []);

    const handleReceive = async (id) => {
        if (!window.confirm('Mark this PO as received? This will update inventory stock automatically.')) return;
        try {
            await api.post(`/purchase-orders/${id}/receive`);
            toast.success('PO received and inventory updated');
            fetchPOs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to receive PO');
        }
    };

    return (
        <div className="flex-1 p-lg overflow-y-auto bg-background">
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-primary">Purchase Orders</h1>
                    <p className="font-body-md text-on-surface-variant mt-xs">Track orders from suppliers and receive stock.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
            ) : pos.length === 0 ? (
                <div className="bg-surface rounded-xl p-xl text-center border border-outline-variant">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-md">receipt_long</span>
                    <h3 className="font-headline-md text-on-surface mb-xs">No purchase orders found</h3>
                </div>
            ) : (
                <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-label-md">
                                    <th className="p-md font-medium">PO #</th>
                                    <th className="p-md font-medium">Supplier</th>
                                    <th className="p-md font-medium">Order Date</th>
                                    <th className="p-md font-medium">Status</th>
                                    <th className="p-md font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pos.map((po) => (
                                    <tr key={po.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-md font-label-md font-bold text-on-surface">PO-{po.id}</td>
                                        <td className="p-md font-body-md text-on-surface">{po.supplier?.name}</td>
                                        <td className="p-md font-body-md text-on-surface">{po.orderDate}</td>
                                        <td className="p-md">
                                            <span className={`px-sm py-xs rounded font-label-sm ${
                                                po.status === 'PENDING' ? 'bg-secondary/10 text-secondary' :
                                                po.status === 'RECEIVED' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                                                'bg-error/10 text-error'
                                            }`}>
                                                {po.status}
                                            </span>
                                        </td>
                                        <td className="p-md text-right">
                                            {po.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleReceive(po.id)}
                                                    className="bg-primary text-on-primary px-md py-sm rounded font-label-md hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-xs ml-auto"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">inventory</span>
                                                    Receive PO
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
