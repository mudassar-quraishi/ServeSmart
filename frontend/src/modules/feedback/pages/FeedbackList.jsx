import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function FeedbackList() {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/feedback');
            setFeedback(data);
        } catch (error) {
            toast.error('Failed to load feedback');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`material-symbols-outlined text-[20px] ${i < rating ? 'text-secondary' : 'text-outline-variant'}`}>
                star
            </span>
        ));
    };

    const getAverageRating = () => {
        if (feedback.length === 0) return 0;
        const total = feedback.reduce((sum, item) => sum + item.rating, 0);
        return (total / feedback.length).toFixed(1);
    };

    return (
        <div className="flex-1 p-lg overflow-y-auto bg-background flex flex-col">
            <div className="flex justify-between items-center mb-xl shrink-0">
                <div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-primary">Customer Feedback</h1>
                    <p className="font-body-md text-on-surface-variant mt-xs">Review ratings and comments from completed orders.</p>
                </div>
            </div>

            <div className="mb-lg flex gap-md shrink-0">
                <div className="bg-surface border border-outline-variant rounded-xl p-md flex items-center gap-md shadow-sm w-64">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[24px]">grade</span>
                    </div>
                    <div>
                        <div className="font-label-md text-on-surface-variant">Average Rating</div>
                        <div className="font-headline-lg font-bold text-on-surface flex items-center gap-xs">
                            {getAverageRating()} 
                            <span className="font-label-sm text-outline font-normal">/ 5.0</span>
                        </div>
                    </div>
                </div>
                <div className="bg-surface border border-outline-variant rounded-xl p-md flex items-center gap-md shadow-sm w-64">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[24px]">reviews</span>
                    </div>
                    <div>
                        <div className="font-label-md text-on-surface-variant">Total Reviews</div>
                        <div className="font-headline-lg font-bold text-on-surface">{feedback.length}</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
            ) : feedback.length === 0 ? (
                <div className="bg-surface rounded-xl p-xl text-center border border-outline-variant">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-md">feedback</span>
                    <h3 className="font-headline-md text-on-surface mb-xs">No feedback received yet</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                    {feedback.map(item => (
                        <div key={item.id} className="bg-surface rounded-xl border border-outline-variant p-md shadow-sm flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-sm">
                                <div className="flex flex-col">
                                    <span className="font-label-md font-bold text-on-surface">
                                        {item.customer ? item.customer.name : 'Anonymous'}
                                    </span>
                                    <span className="font-label-sm text-outline mt-xs">
                                        Order #{item.order?.id}
                                    </span>
                                </div>
                                <div className="flex bg-surface-container-low px-xs py-xs rounded">
                                    {renderStars(item.rating)}
                                </div>
                            </div>
                            
                            <div className="mt-md text-on-surface-variant font-body-md bg-surface-container-lowest p-sm rounded border border-outline-variant/30 flex-1 relative">
                                <span className="material-symbols-outlined absolute top-sm left-sm text-outline opacity-20 text-[32px]">format_quote</span>
                                <p className="relative z-10 pl-md pt-xs italic">
                                    {item.comment || 'No comment provided.'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
