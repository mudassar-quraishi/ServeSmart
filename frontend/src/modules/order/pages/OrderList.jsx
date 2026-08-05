import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';

export default function OrderList() {
    const { user } = useAuth();
    const canSettle = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER' || user?.role === 'CASHIER';

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/orders');
            setOrders(data);
        } catch (error) {
            toast.error('Failed to load orders');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleCheckout = async (id) => {
        if (!window.confirm('Generate bill and checkout table?')) return;
        try {
            const { data } = await api.post(`/orders/${id}/checkout`);
            toast.success(`Bill generated! Total: ₹${data.finalTotalAmount}`);
            fetchOrders();
            // Open bill summary or print dialog here if needed
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to checkout');
        }
    };

    const handleSettle = async (id, method) => {
        if (!window.confirm(`Settle order via ${method}?`)) return;
        try {
            await api.post(`/orders/${id}/settle`, null, { params: { paymentMethod: method } });
            toast.success('Payment settled successfully');
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to settle payment');
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'NEW': return 'bg-surface-variant text-on-surface';
            case 'CONFIRMED': return 'bg-secondary/20 text-secondary';
            case 'PREPARING': return 'bg-primary/20 text-primary';
            case 'READY': return 'bg-tertiary-fixed text-on-tertiary-fixed';
            case 'SERVED': return 'bg-secondary text-on-secondary';
            case 'BILLED': return 'bg-error-container text-on-error-container';
            case 'SETTLED': return 'bg-outline-variant text-on-surface-variant';
            case 'CANCELLED': return 'bg-error text-on-error';
            default: return 'bg-surface-variant text-on-surface';
        }
    };

    return (
        <div className="flex-1 p-lg overflow-y-auto bg-background">
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-primary">Order Management</h1>
                    <p className="font-body-md text-on-surface-variant mt-xs">View order history, billing, and settlements.</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="p-sm rounded-full bg-surface-container hover:bg-surface-variant text-on-surface transition-colors shadow-sm flex items-center justify-center"
                    title="Refresh"
                >
                    <span className="material-symbols-outlined">refresh</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-surface rounded-xl p-xl text-center border border-outline-variant">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-md">receipt_long</span>
                    <h3 className="font-headline-md text-on-surface mb-xs">No orders found</h3>
                </div>
            ) : (
                <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-label-md">
                                    <th className="p-md font-medium">Order ID</th>
                                    <th className="p-md font-medium">Table</th>
                                    <th className="p-md font-medium">Customer</th>
                                    <th className="p-md font-medium">Status</th>
                                    <th className="p-md font-medium">Amount</th>
                                    <th className="p-md font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-md font-label-md font-bold text-on-surface">#{order.id}</td>
                                        <td className="p-md font-body-md text-on-surface">
                                            {order.table?.tableNumber || `Takeaway (ID: ${order.table?.id})` || 'N/A'}
                                        </td>
                                        <td className="p-md font-body-md text-on-surface">
                                            {order.customer ? order.customer.name : 'Walk-in'}
                                        </td>
                                        <td className="p-md">
                                            <span className={`px-sm py-xs rounded font-label-sm ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-md font-label-md font-bold text-on-surface">
                                            ₹{order.finalTotalAmount?.toFixed(2) || order.totalAmount?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="p-md text-right">
                                            <div className="flex justify-end gap-sm">
                                                {order.status !== 'SETTLED' && order.status !== 'CANCELLED' && order.status !== 'BILLED' && canSettle && (
                                                    <button
                                                        onClick={() => handleCheckout(order.id)}
                                                        className="bg-primary/10 text-primary hover:bg-primary/20 px-sm py-xs rounded font-label-sm transition-colors"
                                                    >
                                                        Checkout / Bill
                                                    </button>
                                                )}
                                                {order.status === 'BILLED' && canSettle && (
                                                    <div className="flex gap-xs">
                                                        <button
                                                            onClick={() => handleSettle(order.id, 'CASH')}
                                                            className="bg-secondary text-on-secondary hover:bg-secondary/90 px-sm py-xs rounded font-label-sm transition-colors"
                                                        >
                                                            Cash
                                                        </button>
                                                        <button
                                                            onClick={() => handleSettle(order.id, 'CARD')}
                                                            className="bg-tertiary-fixed text-on-tertiary-fixed hover:brightness-95 px-sm py-xs rounded font-label-sm transition-colors"
                                                        >
                                                            Card/UPI
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
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
