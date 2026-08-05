import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './router/ProtectedRoute';
import Login from './modules/auth/pages/Login';
import CreateOrder from './modules/order/pages/CreateOrder';
import SupportTickets from './modules/admin/pages/SupportTickets';
import AdminDashboard from './modules/admin/pages/AdminDashboard';
import MainLayout from './layouts/MainLayout';
import EmployeeList from './modules/employee/pages/EmployeeList';
import CustomerList from './modules/customer/pages/CustomerList';
import MenuList from './modules/menu/pages/MenuList';
import TableList from './modules/table/pages/TableList';
import KitchenDashboard from './modules/kitchen/pages/KitchenDashboard';
import InventoryList from './modules/inventory/pages/InventoryList';
import SupplierList from './modules/supplier/pages/SupplierList';
import PurchaseOrderList from './modules/supplier/pages/PurchaseOrderList';
import FeedbackList from './modules/feedback/pages/FeedbackList';
import ReportDashboard from './modules/report/pages/ReportDashboard';
import OrderList from './modules/order/pages/OrderList';

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes wrapped in MainLayout */}
                <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER', 'WAITER', 'CHEF', 'CASHIER']} />}>
                    <Route element={<MainLayout />}>
                        {/* SUPER_ADMIN / MANAGER */}
                        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER']}><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/employees" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER']}><EmployeeList /></ProtectedRoute>} />
                        <Route path="/customers" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER', 'WAITER']}><CustomerList /></ProtectedRoute>} />
                        <Route path="/menu" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER', 'WAITER', 'CHEF', 'CASHIER']}><MenuList /></ProtectedRoute>} />
                        <Route path="/tables" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER', 'WAITER']}><TableList /></ProtectedRoute>} />
                        <Route path="/kitchen" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER', 'CHEF']}><KitchenDashboard /></ProtectedRoute>} />
                        <Route path="/inventory" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER', 'CHEF']}><InventoryList /></ProtectedRoute>} />
                        <Route path="/suppliers" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER']}><SupplierList /></ProtectedRoute>} />
                        <Route path="/purchase-orders" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER']}><PurchaseOrderList /></ProtectedRoute>} />
                        <Route path="/feedback" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER']}><FeedbackList /></ProtectedRoute>} />
                        <Route path="/reports" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER']}><ReportDashboard /></ProtectedRoute>} />
                        <Route path="/admin/support" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SupportTickets /></ProtectedRoute>} />
                        
                        {/* Order management routes */}
                        <Route path="/orders" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER', 'WAITER', 'CASHIER']}><OrderList /></ProtectedRoute>} />
                        <Route path="/order" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER', 'WAITER', 'CHEF', 'CASHIER']}><CreateOrder /></ProtectedRoute>} />
                    </Route>
                </Route>

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/order" />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;