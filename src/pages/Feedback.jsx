import { useEffect, useState, useMemo } from 'react';
import { fetchFeedbacks } from '../api/feedbackService';
import Loader from '../components/Loader';
import { Star, MessageSquare } from 'lucide-react';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchFeedbacks();
        setFeedbacks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const avgRating = useMemo(() => {
    if (feedbacks.length === 0) return '0.0';
    const sum = feedbacks.reduce((acc, f) => acc + (Number(f.rating) || 5), 0);
    return (sum / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const ratingBreakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach((f) => {
      const r = Math.round(Number(f.rating) || 5);
      if (counts[r] !== undefined) counts[r] += 1;
    });
    return counts;
  }, [feedbacks]);

  if (loading) return <Loader full />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-[#2E2118] dark:text-[#F0EAE0]">Feedback</h1>
        <p className="text-sm text-[#A99A82] mt-1">{feedbacks.length} customer reviews</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 shadow-sm border border-[#EDE6DA] dark:border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#A99A82]">Total Reviews</p>
            <p className="text-xl font-semibold text-[#2E2118] dark:text-[#F0EAE0] mt-1">{feedbacks.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#E7F0F6] dark:bg-[#3E6284]/20 flex items-center justify-center">
            <MessageSquare size={18} className="text-[#3E6284]" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 shadow-sm border border-[#EDE6DA] dark:border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#A99A82]">Average Rating</p>
            <p className="text-xl font-semibold text-[#2E2118] dark:text-[#F0EAE0] mt-1">{avgRating} / 5</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FBEEDC] dark:bg-[#C98A3D]/20 flex items-center justify-center">
            <Star size={18} className="text-[#C98A3D]" fill="#C98A3D" />
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 shadow-sm border border-[#EDE6DA] dark:border-white/10 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium text-[#8A7C68] uppercase tracking-wide mb-3">Rating Breakdown</p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingBreakdown[star];
              const percent = feedbacks.length ? Math.round((count / feedbacks.length) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2.5">
                  <span className="text-xs text-[#5C4A3A] dark:text-[#C9BBA4] w-6 flex-shrink-0">{star}★</span>
                  <div className="flex-1 h-1.5 bg-[#F0EAE0] dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#C98A3D]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#A99A82] w-6 text-right flex-shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedbacks.length === 0 ? (
          <p className="text-[#A99A82] px-2">No feedback found.</p>
        ) : (
          feedbacks.map((f) => (
            <div key={f.id} className="bg-white dark:bg-[#2A1F16] rounded-2xl p-5 shadow-sm border border-[#EDE6DA] dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#2E2118] dark:text-[#F0EAE0]">{f.Name}</p>
                  <p className="text-xs text-[#A99A82]">{f.Email}</p>
                </div>
                <div className="flex items-center gap-1 text-[#C98A3D]">
                  <Star size={16} fill="#C98A3D" />
                  <span className="text-sm font-medium">{f.rating || '5'}</span>
                </div>
              </div>
              <p className="text-sm text-[#5C4A3A] dark:text-[#C9BBA4] mt-3">{f.review}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feedback;