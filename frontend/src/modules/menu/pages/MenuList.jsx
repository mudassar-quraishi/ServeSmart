import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import MenuModal from '../components/MenuModal';
import { useAuth } from '../../../contexts/AuthContext';

export default function MenuList() {
    const { user } = useAuth();
    const isManager = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';
    
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeCategory, setActiveCategory] = useState('ALL');

    const categories = ['ALL', 'STARTER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE'];

    const fetchMenu = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/menu');
            setMenuItems(data);
        } catch (error) {
            toast.error('Failed to load menu items');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this menu item?')) return;
        try {
            await api.delete(`/menu/${id}`);
            toast.success('Menu item deleted');
            fetchMenu();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete item');
        }
    };

    const toggleAvailability = async (item) => {
        if (!isManager) return;
        try {
            await api.patch(`/menu/${item.id}/availability`, { isAvailable: !item.isAvailable });
            toast.success('Availability updated');
            fetchMenu();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update availability');
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const filteredItems = activeCategory === 'ALL' 
        ? menuItems 
        : menuItems.filter(item => item.category === activeCategory);

    return (
        <div className="flex-1 p-lg overflow-y-auto">
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-primary">Menu Management</h1>
                    <p className="font-body-md text-on-surface-variant mt-xs">Manage your offerings, categories, and prices.</p>
                </div>
                {isManager && (
                    <button
                        onClick={openCreateModal}
                        className="bg-secondary text-on-secondary px-lg py-sm rounded-lg font-label-md hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-xs"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Add Item
                    </button>
                )}
            </div>

            <div className="flex gap-sm mb-lg overflow-x-auto scrollbar-hide pb-sm">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-md py-sm rounded-full font-label-md whitespace-nowrap transition-colors border ${
                            activeCategory === category 
                                ? 'bg-primary text-on-primary border-primary' 
                                : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
                        }`}
                    >
                        {category.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-surface rounded-xl p-xl text-center border border-outline-variant">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-md">restaurant_menu</span>
                    <h3 className="font-headline-md text-on-surface mb-xs">No items found</h3>
                    <p className="text-on-surface-variant font-body-md mb-lg">There are no menu items in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                    {filteredItems.map(item => (
                        <div key={item.id} className={`bg-surface rounded-xl border ${item.isAvailable ? 'border-outline-variant' : 'border-error/30 opacity-75'} p-md shadow-sm flex flex-col relative group transition-all hover:shadow-md`}>
                            
                            <div className="flex justify-between items-start mb-sm">
                                <h3 className="font-headline-md font-bold text-on-surface line-clamp-1">{item.name}</h3>
                                <div className="font-headline-md font-bold text-secondary">₹{item.price}</div>
                            </div>
                            
                            <p className="text-on-surface-variant font-body-md text-sm line-clamp-2 mb-md flex-1">
                                {item.description || 'No description available.'}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-sm border-t border-outline-variant/50">
                                <div className="flex items-center gap-xs">
                                    <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-tertiary-fixed-dim' : 'bg-error'}`}></span>
                                    <span className="font-label-sm text-on-surface-variant">
                                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                                    </span>
                                </div>
                                
                                {isManager && (
                                    <div className="flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => toggleAvailability(item)}
                                            className="text-on-surface-variant hover:text-primary transition-colors p-xs rounded hover:bg-surface-container"
                                            title={item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                {item.isAvailable ? 'block' : 'check_circle'}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="text-on-surface-variant hover:text-primary transition-colors p-xs rounded hover:bg-surface-container"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
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
                <MenuModal
                    item={editingItem}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchMenu();
                    }}
                />
            )}
        </div>
    );
}
