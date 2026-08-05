import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function KitchenDashboard() {
    const [queueItems, setQueueItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/kitchen/queue');
            setQueueItems(data.items || []);
        } catch (error) {
            toast.error('Failed to load kitchen queue');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 10000); // Auto-refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (itemId, action) => {
        try {
            await api.post(`/kitchen/items/${itemId}/${action}`);
            toast.success(`Item marked as ${action}`);
            fetchQueue();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to perform action`);
        }
    };

    const markIngredientUnavailable = async (itemId) => {
        if (!window.confirm('Mark ingredients as unavailable for this item?')) return;
        try {
            await api.post(`/kitchen/items/${itemId}/ingredient-unavailable`);
            toast.success('Ingredient stock checked/updated');
            fetchQueue();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to update ingredient status`);
        }
    };

    const pendingItems = queueItems.filter(i => i.status === 'PENDING');
    const preparingItems = queueItems.filter(i => i.status === 'PREPARING');

    return (
        <div className="flex-1 p-lg overflow-y-auto bg-background flex flex-col h-full">
            <div className="flex justify-between items-center mb-xl shrink-0">
                <div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-primary">Kitchen Display System (KDS)</h1>
                    <p className="font-body-md text-on-surface-variant mt-xs">Manage active orders and preparation status.</p>
                </div>
                <button
                    onClick={fetchQueue}
                    className="p-sm rounded-full bg-surface-container hover:bg-surface-variant text-on-surface transition-colors shadow-sm flex items-center justify-center"
                    title="Refresh"
                >
                    <span className="material-symbols-outlined">refresh</span>
                </button>
            </div>

            <div className="flex gap-lg flex-1 min-h-0">
                
                {/* Incoming Orders Column */}
                <div className="flex-1 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-surface-container-low p-md border-b border-outline-variant flex justify-between items-center shrink-0">
                        <h2 className="font-headline-md font-bold text-on-surface flex items-center gap-sm">
                            <span className="material-symbols-outlined text-primary">receipt_long</span>
                            Incoming (Pending)
                        </h2>
                        <span className="bg-primary text-on-primary font-label-md px-sm py-xs rounded-full">{pendingItems.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-md flex flex-col gap-sm bg-surface">
                        {loading && pendingItems.length === 0 ? (
                             <div className="flex justify-center p-xl"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                        ) : pendingItems.length === 0 ? (
                            <div className="text-center text-on-surface-variant p-xl font-body-md">No pending items.</div>
                        ) : (
                            pendingItems.map(item => (
                                <div key={item.orderItemId} className="bg-surface-container-lowest border-l-4 border-l-secondary border border-outline-variant rounded-lg p-md shadow-soft flex flex-col">
                                    <div className="flex justify-between items-start mb-sm">
                                        <div>
                                            <h3 className="font-headline-md font-bold text-on-surface">{item.quantity}x {item.menuItemName}</h3>
                                            <div className="font-label-sm text-outline mt-xs">Table: {item.tableNumber} | Order #{item.orderId}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-md pt-sm border-t border-outline-variant/50">
                                        <button 
                                            onClick={() => markIngredientUnavailable(item.orderItemId)}
                                            className="text-error font-label-sm hover:underline"
                                        >
                                            Out of Stock?
                                        </button>
                                        <div className="flex gap-sm">
                                            <button
                                                onClick={() => handleAction(item.orderItemId, 'accept')}
                                                className="bg-surface-variant text-on-surface px-md py-sm rounded font-label-md hover:bg-outline-variant transition-colors"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleAction(item.orderItemId, 'start')}
                                                className="bg-primary text-on-primary px-md py-sm rounded font-label-md hover:bg-primary/90 transition-colors shadow-sm"
                                            >
                                                Start Prep
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Preparing Orders Column */}
                <div className="flex-1 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-surface-container-low p-md border-b border-outline-variant flex justify-between items-center shrink-0">
                        <h2 className="font-headline-md font-bold text-on-surface flex items-center gap-sm">
                            <span className="material-symbols-outlined text-secondary">skillet</span>
                            Preparing
                        </h2>
                        <span className="bg-secondary text-on-secondary font-label-md px-sm py-xs rounded-full">{preparingItems.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-md flex flex-col gap-sm bg-surface">
                        {loading && preparingItems.length === 0 ? (
                             <div className="flex justify-center p-xl"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div></div>
                        ) : preparingItems.length === 0 ? (
                            <div className="text-center text-on-surface-variant p-xl font-body-md">No items in preparation.</div>
                        ) : (
                            preparingItems.map(item => (
                                <div key={item.orderItemId} className="bg-surface-container-lowest border-l-4 border-l-primary border border-outline-variant rounded-lg p-md shadow-soft flex flex-col relative overflow-hidden">
                                    {/* Animated background strip indicating active cooking */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary/20 via-secondary to-secondary/20 animate-pulse"></div>
                                    
                                    <div className="flex justify-between items-start mb-sm mt-xs">
                                        <div>
                                            <h3 className="font-headline-md font-bold text-on-surface">{item.quantity}x {item.menuItemName}</h3>
                                            <div className="font-label-sm text-outline mt-xs">Table: {item.tableNumber} | Order #{item.orderId}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-md pt-sm border-t border-outline-variant/50">
                                        <button
                                            onClick={() => handleAction(item.orderItemId, 'ready')}
                                            className="bg-tertiary-fixed-dim text-on-tertiary-fixed px-lg py-sm rounded font-label-md hover:brightness-95 transition-colors shadow-sm flex items-center gap-xs"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">done_all</span>
                                            Mark Ready
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
