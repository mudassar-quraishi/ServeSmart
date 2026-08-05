import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import EmployeeModal from '../components/EmployeeModal';

export default function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/employees');
            setEmployees(data.content || []); // Assuming Page<EmployeeResponse>
        } catch (error) {
            toast.error('Failed to load employees');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this employee?')) return;
        try {
            await api.delete(`/employees/${id}`);
            toast.success('Employee deactivated successfully');
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete employee');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await api.put(`/employees/${id}/role`, { roleName: newRole });
            toast.success('Role updated successfully');
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const openCreateModal = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const openEditModal = (employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    return (
        <div className="flex-1 p-lg overflow-y-auto">
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-primary">Employees</h1>
                    <p className="font-body-md text-on-surface-variant mt-xs">Manage staff accounts, roles, and access.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-secondary text-on-secondary px-lg py-sm rounded-lg font-label-md hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-xs"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Employee
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
            ) : employees.length === 0 ? (
                <div className="bg-surface rounded-xl p-xl text-center border border-outline-variant">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-md">badge</span>
                    <h3 className="font-headline-md text-on-surface mb-xs">No employees found</h3>
                    <p className="text-on-surface-variant font-body-md mb-lg">Start by adding your first staff member.</p>
                    <button onClick={openCreateModal} className="bg-secondary/10 text-secondary px-md py-sm rounded font-label-md hover:bg-secondary/20 transition-colors">
                        Add Employee
                    </button>
                </div>
            ) : (
                <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-label-md">
                                    <th className="p-md font-medium">Name / Username</th>
                                    <th className="p-md font-medium">Contact</th>
                                    <th className="p-md font-medium">Role</th>
                                    <th className="p-md font-medium">Specialization</th>
                                    <th className="p-md font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-lowest transition-colors">
                                        <td className="p-md">
                                            <div className="font-label-md font-bold text-on-surface">{emp.fullName}</div>
                                            <div className="font-label-sm text-outline mt-xs">@{emp.username}</div>
                                        </td>
                                        <td className="p-md">
                                            <div className="font-body-md text-on-surface">{emp.phone || '-'}</div>
                                            <div className="font-label-sm text-outline mt-xs">{emp.email}</div>
                                        </td>
                                        <td className="p-md">
                                            <select
                                                value={emp.roleName}
                                                onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                                                className="bg-surface-container-low border border-outline-variant rounded px-sm py-xs font-label-sm focus:outline-none focus:border-secondary"
                                            >
                                                <option value="MANAGER">Manager</option>
                                                <option value="WAITER">Waiter</option>
                                                <option value="CHEF">Chef</option>
                                                <option value="CASHIER">Cashier</option>
                                                <option value="SUPER_ADMIN">Super Admin</option>
                                            </select>
                                        </td>
                                        <td className="p-md">
                                            <span className="font-body-md text-on-surface">{emp.specialization || '-'}</span>
                                        </td>
                                        <td className="p-md text-right">
                                            <div className="flex justify-end gap-sm">
                                                <button
                                                    onClick={() => openEditModal(emp)}
                                                    className="text-on-surface-variant hover:text-primary transition-colors p-xs rounded hover:bg-surface-container"
                                                    title="Edit Details"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    className="text-on-surface-variant hover:text-error transition-colors p-xs rounded hover:bg-error-container"
                                                    title="Deactivate"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">person_off</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <EmployeeModal
                    employee={editingEmployee}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchEmployees();
                    }}
                />
            )}
        </div>
    );
}
