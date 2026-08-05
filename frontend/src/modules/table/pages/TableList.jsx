import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import TableModal from '../components/TableModal';
import { useAuth } from '../../../contexts/AuthContext';

export default function TableList() {
    const { user } = useAuth();
    const isManager = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';

    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');

    const statuses = ['ALL', 'FREE', 'OCCUPIED', 'RESERVED'];

    const fetchTables = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/tables');
            setTables(data);
        } catch (error) {
            toast.error('Failed to load tables');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this table?')) return;
        try {
            await api.delete(`/tables/${id}`);
            toast.success('Table deleted');
            fetchTables();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete table');
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/tables/${id}/status`, { status: newStatus });
            toast.success('Table status updated');
            fetchTables();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const openCreateModal = () => {
        setEditingTable(null);
        setIsModalOpen(true);
    };

    const openEditModal = (table) => {
        setEditingTable(table);
        setIsModalOpen(true);
    };

    const filteredTables = statusFilter === 'ALL' 
        ? tables 
        : tables.filter(t => t.status === statusFilter);

    const getStatusColor = (status) => {
        switch(status) {
            case 'FREE': return 'bg-tertiary-fixed text-on-tertiary-fixed';
            case 'OCCUPIED': return 'bg-secondary text-on-secondary';
            case 'RESERVED': return 'bg-primary-fixed text-on-primary-fixed';
            default: return 'bg-surface-container text-on-surface';
        }
    };

    return (
        <div className="flex-1 p-lg overflow-y-auto bg-background">
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-primary">Table Layout</h1>
                    <p className="font-body-md text-on-surface-variant mt-xs">Manage restaurant seating and table statuses.</p>
                </div>
                {isManager && (
                    <button
                        onClick={openCreateModal}
                        className="bg-secondary text-on-secondary px-lg py-sm rounded-lg font-label-md hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-xs"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Add Table
                    </button>
                )}
            </div>

            <div className="flex gap-sm mb-lg overflow-x-auto scrollbar-hide pb-sm">
                {statuses.map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-md py-sm rounded-full font-label-md whitespace-nowrap transition-colors border ${
                            statusFilter === status 
                                ? 'bg-primary text-on-primary border-primary' 
                                : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
            ) : filteredTables.length === 0 ? (
                <div className="bg-surface rounded-xl p-xl text-center border border-outline-variant">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-md">table_restaurant</span>
                    <h3 className="font-headline-md text-on-surface mb-xs">No tables found</h3>
                    <p className="text-on-surface-variant font-body-md mb-lg">There are no tables matching this criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
                    {filteredTables.map(table => (
                        <div key={table.id} className="bg-surface rounded-xl border border-outline-variant p-md shadow-sm flex flex-col relative group transition-all hover:shadow-md">
                            
                            <div className="flex justify-between items-start mb-md">
                                <h3 className="font-headline-md font-bold text-on-surface text-2xl">{table.tableNumber}</h3>
                                <div className="flex items-center gap-xs text-on-surface-variant bg-surface-container px-sm py-xs rounded">
                                    <span className="material-symbols-outlined text-[16px]">groups</span>
                                    <span className="font-label-md font-bold">{table.capacity}</span>
                                </div>
                            </div>

                            {table.isMerged && (
                                <div className="font-label-sm text-secondary bg-secondary/10 px-sm py-xs rounded mb-sm inline-block">
                                    Merged: {table.mergedWithTableNumbers}
                                </div>
                            )}

                            <div className="mt-auto pt-sm flex items-center justify-between">
                                <select
                                    value={table.status}
                                    onChange={(e) => updateStatus(table.id, e.target.value)}
                                    className={`px-sm py-xs rounded font-label-md font-bold outline-none border-none appearance-none cursor-pointer ${getStatusColor(table.status)}`}
                                >
                                    <option value="FREE">Free</option>
                                    <option value="OCCUPIED">Occupied</option>
                                    <option value="RESERVED">Reserved</option>
                                </select>
                                
                                {isManager && (
                                    <div className="flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEditModal(table)}
                                            className="text-on-surface-variant hover:text-primary transition-colors p-xs rounded hover:bg-surface-container"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(table.id)}
                                            className="text-on-surface-variant hover:text-error transition-colors p-xs rounded hover:bg-error-container"
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <TableModal
                    table={editingTable}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchTables();
                    }}
                />
            )}
        </div>
    );
}
