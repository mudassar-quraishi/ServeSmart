import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import CustomerModal from '../components/CustomerModal';

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCustomers = async (phone = '') => {
        try {
            setLoading(true);
            const { data } = await api.get('/customers', { params: { phone } });
            // Assume the API returns an array or page object
            setCustomers(Array.isArray(data) ? data : (data.content || [])); 
        } catch (error) {
            toast.error('Failed to load customers');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // debounce search
        const delayDebounceFn = setTimeout(() => {
            fetchCustomers(searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const openCreateModal = () => {
        setEditingCustomer(null);
        setIsModalOpen(true);
    };

    const openEditModal = (customer) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    return (
        <div className="flex-1 p-lg overflow-y-auto">
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-primary">Customers</h1>
                    <p className="font-body-md text-on-surface-variant mt-xs">Manage customer profiles and view their loyalty points.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-secondary text-on-secondary px-lg py-sm rounded-lg font-label-md hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-xs"
                >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Add Customer
                </button>
            </div>

            <div className="mb-md flex gap-md">
                <div className="relative flex-1 max-w-md">
                    <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                    <input
                        type="text"
                        placeholder="Search by phone number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-xl pr-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors font-body-md"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
            ) : customers.length === 0 ? (
                <div className="bg-surface rounded-xl p-xl text-center border border-outline-variant">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-md">groups</span>
                    <h3 className="font-headline-md text-on-surface mb-xs">No customers found</h3>
                    <p className="text-on-surface-variant font-body-md mb-lg">
                        {searchQuery ? 'No customers matched your search.' : 'Add your first customer to get started.'}
                    </p>
                    {!searchQuery && (
                        <button onClick={openCreateModal} className="bg-secondary/10 text-secondary px-md py-sm rounded font-label-md hover:bg-secondary/20 transition-colors">
                            Add Customer
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-label-md">
                                    <th className="p-md font-medium">Name</th>
                                    <th className="p-md font-medium">Contact</th>
                                    <th className="p-md font-medium">Loyalty Points</th>
                                    <th className="p-md font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-md font-label-md font-bold text-on-surface">
                                            {customer.name}
                                        </td>
                                        <td className="p-md">
                                            <div className="font-body-md text-on-surface">{customer.phone}</div>
                                            {customer.email && <div className="font-label-sm text-outline mt-xs">{customer.email}</div>}
                                        </td>
                                        <td className="p-md font-body-md text-on-surface">
                                            <div className="flex items-center gap-xs">
                                                <span className="material-symbols-outlined text-secondary text-[18px]">stars</span>
                                                <span className="font-bold">{customer.loyaltyPoints}</span>
                                            </div>
                                        </td>
                                        <td className="p-md text-right">
                                            <button
                                                onClick={() => openEditModal(customer)}
                                                className="text-on-surface-variant hover:text-primary transition-colors p-xs rounded hover:bg-surface-container inline-flex items-center"
                                                title="Edit Details"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <CustomerModal
                    customer={editingCustomer}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchCustomers(searchQuery);
                    }}
                />
            )}
        </div>
    );
}
