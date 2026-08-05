import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard', roles: ['SUPER_ADMIN', 'MANAGER'] },
    { name: 'New Order', path: '/order', icon: 'restaurant', roles: ['SUPER_ADMIN', 'MANAGER', 'WAITER', 'CHEF', 'CASHIER'] },
    { name: 'Orders', path: '/orders', icon: 'receipt_long', roles: ['SUPER_ADMIN', 'MANAGER', 'WAITER', 'CASHIER'] },
    { name: 'Kitchen', path: '/kitchen', icon: 'soup_kitchen', roles: ['SUPER_ADMIN', 'MANAGER', 'CHEF'] },
    { name: 'Tables', path: '/tables', icon: 'table_restaurant', roles: ['SUPER_ADMIN', 'MANAGER', 'WAITER'] },
    { name: 'Menu', path: '/menu', icon: 'menu_book', roles: ['SUPER_ADMIN', 'MANAGER'] },
    { name: 'Inventory', path: '/inventory', icon: 'inventory_2', roles: ['SUPER_ADMIN', 'MANAGER', 'CHEF'] },
    { name: 'Suppliers', path: '/suppliers', icon: 'local_shipping', roles: ['SUPER_ADMIN', 'MANAGER'] },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: 'shopping_cart', roles: ['SUPER_ADMIN', 'MANAGER'] },
    { name: 'Employees', path: '/employees', icon: 'badge', roles: ['SUPER_ADMIN', 'MANAGER'] },
    { name: 'Customers', path: '/customers', icon: 'groups', roles: ['SUPER_ADMIN', 'MANAGER', 'WAITER'] },
    { name: 'Feedback', path: '/feedback', icon: 'feedback', roles: ['SUPER_ADMIN', 'MANAGER'] },
    { name: 'Reports', path: '/reports', icon: 'bar_chart', roles: ['SUPER_ADMIN', 'MANAGER'] },
    { name: 'Support', path: '/admin/support', icon: 'support_agent', roles: ['SUPER_ADMIN'] }
];

export default function MainLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) return null;

    const visibleNavItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden text-on-surface">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-sidebar-width' : 'w-[80px]'} 
                flex flex-col bg-surface-container-lowest border-r border-outline-variant transition-all duration-300 z-20 shrink-0`}
            >
                {/* Logo Area */}
                <div className="h-[72px] flex items-center px-md border-b border-outline-variant shrink-0 justify-between">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-sm overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
                                <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
                            </div>
                            <span className="font-headline-md font-bold text-primary truncate tracking-tight">ServeSmart</span>
                        </div>
                    )}
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-sm rounded-full hover:bg-surface-container text-on-surface-variant transition-colors flex items-center justify-center mx-auto"
                    >
                        <span className="material-symbols-outlined">
                            {isSidebarOpen ? 'menu_open' : 'menu'}
                        </span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-md px-sm flex flex-col gap-xs scrollbar-hide">
                    {visibleNavItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 group relative
                                ${isActive 
                                    ? 'bg-secondary/10 text-secondary font-bold shadow-sm' 
                                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                }
                                ${!isSidebarOpen && 'justify-center px-sm'}
                            `}
                            title={!isSidebarOpen ? item.name : ''}
                        >
                            <span className={`material-symbols-outlined transition-colors duration-200 ${!isSidebarOpen && 'text-[24px]'}`}>
                                {item.icon}
                            </span>
                            {isSidebarOpen && (
                                <span className="font-label-md text-label-md truncate whitespace-nowrap">
                                    {item.name}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile / Logout */}
                <div className="p-md border-t border-outline-variant shrink-0">
                    <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} bg-surface-container rounded-lg p-sm`}>
                        {isSidebarOpen && (
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-label-md text-on-surface font-bold truncate">{user.username}</span>
                                <span className="font-label-sm text-on-surface-variant text-[10px] uppercase truncate tracking-wider">{user.role.replace('_', ' ')}</span>
                            </div>
                        )}
                        <button 
                            onClick={handleLogout}
                            className="text-on-surface-variant hover:text-error transition-colors p-xs rounded-full hover:bg-error-container flex items-center justify-center"
                            title="Logout"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
                <Outlet />
            </main>
        </div>
    );
}
