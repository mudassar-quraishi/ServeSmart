import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function ReportDashboard() {
    const [loading, setLoading] = useState(true);
    const [dailySales, setDailySales] = useState(null);
    const [monthlySales, setMonthlySales] = useState(null);
    const [topItems, setTopItems] = useState([]);
    const [chefPerformance, setChefPerformance] = useState([]);
    
    // Default dates
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const [dailyRes, monthlyRes, itemsRes, chefRes] = await Promise.all([
                api.get(`/reports/daily-sales?date=${selectedDate}`),
                api.get(`/reports/monthly-sales?month=${selectedMonth}`),
                api.get('/reports/top-items?limit=5'),
                api.get('/reports/chef-performance')
            ]);
            
            setDailySales(dailyRes.data);
            setMonthlySales(monthlyRes.data);
            setTopItems(itemsRes.data);
            setChefPerformance(chefRes.data);
        } catch (error) {
            toast.error('Failed to load reports');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [selectedDate, selectedMonth]);

    const topItemsChartData = {
        labels: topItems.map(item => `Item ID ${item.menuItemId}`), // We'd ideally join with Menu names
        datasets: [
            {
                label: 'Quantity Sold',
                data: topItems.map(item => item.totalQuantity),
                backgroundColor: 'rgba(253, 148, 62, 0.7)',
            },
        ],
    };

    const chefPerformanceChartData = {
        labels: chefPerformance.map(chef => `Chef ID ${chef.chefId}`), // Ideally joined with Employee names
        datasets: [
            {
                label: 'Items Completed',
                data: chefPerformance.map(chef => chef.itemsCompleted),
                backgroundColor: [
                    'rgba(15, 17, 22, 0.7)',
                    'rgba(253, 148, 62, 0.7)',
                    'rgba(189, 238, 197, 0.7)',
                    'rgba(226, 226, 233, 0.7)'
                ],
            },
        ],
    };

    return (
        <div className="flex-1 p-lg overflow-y-auto bg-background">
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-primary">Reports & Analytics</h1>
                    <p className="font-body-md text-on-surface-variant mt-xs">Key metrics and insights for your business.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="flex flex-col gap-lg">
                    
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                        <div className="bg-surface rounded-xl p-md border border-outline-variant shadow-sm flex flex-col justify-center h-32 relative overflow-hidden">
                            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-surface-container opacity-50">payments</span>
                            <div className="relative z-10">
                                <div className="font-label-md text-on-surface-variant mb-xs flex justify-between">
                                    Today's Revenue
                                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-[10px] bg-transparent outline-none border-b border-outline" />
                                </div>
                                <div className="font-headline-lg font-bold text-primary">₹{dailySales?.totalRevenue?.toFixed(2) || '0.00'}</div>
                                <div className="font-label-sm text-outline mt-xs">{dailySales?.completedOrders || 0} completed orders</div>
                            </div>
                        </div>

                        <div className="bg-surface rounded-xl p-md border border-outline-variant shadow-sm flex flex-col justify-center h-32 relative overflow-hidden">
                            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-surface-container opacity-50">calendar_month</span>
                            <div className="relative z-10">
                                <div className="font-label-md text-on-surface-variant mb-xs flex justify-between">
                                    Monthly Revenue
                                    <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="text-[10px] bg-transparent outline-none border-b border-outline" />
                                </div>
                                <div className="font-headline-lg font-bold text-secondary">₹{monthlySales?.totalRevenue?.toFixed(2) || '0.00'}</div>
                                <div className="font-label-sm text-outline mt-xs">{monthlySales?.totalOrders || 0} total orders</div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg">
                            <h3 className="font-headline-md font-bold text-on-surface mb-md">Top Selling Items</h3>
                            <div className="h-64">
                                <Bar data={topItemsChartData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>

                        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg">
                            <h3 className="font-headline-md font-bold text-on-surface mb-md">Chef Performance</h3>
                            <div className="h-64 flex justify-center">
                                <Pie data={chefPerformanceChartData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
