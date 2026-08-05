import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-full bg-background flex flex-col font-body-md text-body-md text-on-surface antialiased">
      {/* Header */}
      <header className="bg-surface border-b border-surface-variant px-xl py-md flex items-center justify-between shadow-soft shrink-0">
        <div className="flex items-center gap-md">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center shadow-soft">
            <span className="material-symbols-outlined text-on-primary text-[20px]">restaurant</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">Admin Dashboard</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Welcome back, {user?.username}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-xs px-md py-sm rounded-lg hover:bg-error-container text-error hover:text-on-error-container transition-colors font-label-md text-label-md"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-xl overflow-y-auto">
        <h2 className="font-headline-md text-headline-md mb-lg text-on-surface">Quick Access</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {/* Support Tickets Card */}
          <button
            onClick={() => navigate('/admin/support')}
            className="flex flex-col items-start p-lg bg-surface-container-lowest rounded-[12px] border border-surface-variant hover:border-primary hover:shadow-elevated transition-all text-left group"
          >
            <div className="h-12 w-12 bg-primary-container rounded-full flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-on-primary-container text-[24px]">support_agent</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Support Tickets</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">View and manage support requests from users.</p>
          </button>
          
          {/* Orders Card */}
          <button
            onClick={() => navigate('/order')}
            className="flex flex-col items-start p-lg bg-surface-container-lowest rounded-[12px] border border-surface-variant hover:border-primary hover:shadow-elevated transition-all text-left group"
          >
            <div className="h-12 w-12 bg-secondary-container rounded-full flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-on-secondary-container text-[24px]">receipt_long</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Order Management</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Access the POS and active orders system.</p>
          </button>
          
          {/* Inventory Card */}
          <button
            onClick={() => navigate('/inventory')}
            className="flex flex-col items-start p-lg bg-surface-container-lowest rounded-[12px] border border-surface-variant hover:border-primary hover:shadow-elevated transition-all text-left group"
          >
            <div className="h-12 w-12 bg-tertiary-container rounded-full flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-on-tertiary-container text-[24px]">inventory_2</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Inventory</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Manage stock, suppliers, and purchase orders.</p>
          </button>
          
          {/* Reports Card */}
          <button
            onClick={() => navigate('/reports')}
            className="flex flex-col items-start p-lg bg-surface-container-lowest rounded-[12px] border border-surface-variant hover:border-primary hover:shadow-elevated transition-all text-left group"
          >
            <div className="h-12 w-12 bg-primary-container rounded-full flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-on-primary-container text-[24px]">bar_chart</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Reports</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">View sales, feedback, and financial metrics.</p>
          </button>

          {/* Menu Card */}
          <button
            onClick={() => navigate('/menu')}
            className="flex flex-col items-start p-lg bg-surface-container-lowest rounded-[12px] border border-surface-variant hover:border-primary hover:shadow-elevated transition-all text-left group"
          >
            <div className="h-12 w-12 bg-secondary-container rounded-full flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-on-secondary-container text-[24px]">menu_book</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Menu</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Update categories, prices, and availability.</p>
          </button>

          {/* Employees Card */}
          <button
            onClick={() => navigate('/employees')}
            className="flex flex-col items-start p-lg bg-surface-container-lowest rounded-[12px] border border-surface-variant hover:border-primary hover:shadow-elevated transition-all text-left group"
          >
            <div className="h-12 w-12 bg-tertiary-container rounded-full flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-on-tertiary-container text-[24px]">badge</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Employees</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Manage staff details and system access.</p>
          </button>
        </div>
      </main>
    </div>
  );
}
