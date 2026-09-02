import { useEffect, useState, useMemo } from 'react';
import { Search, Star, MessageSquare, Mail, ChevronDown } from 'lucide-react';
import { fetchFeedbacks, replyToFeedback, analyzeFeedback } from '../api/feedbackService';
import Loader from '../components/Loader';
import FeedbackDetailDrawer from '../components/FeedbackDetailDrawer';

const toDate = (ts) => {
  if (!ts) return null;
  if (ts._seconds) return new Date(ts._seconds * 1000);
  const d = new Date(ts);
  return isNaN(d) ? null : d;
};

const formatShortDate = (ts) => {
  const date = toDate(ts);
  if (!date) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setError(null);
      const data = await fetchFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
      setError('Could not load feedback. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySent = async (id, message) => {
    const res = await replyToFeedback(id, message);
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? res.data : f)));
    setSelected(res.data);
  };

  const handleAnalyze = async (id) => {
    const res = await analyzeFeedback(id);
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? res.data : f)));
    setSelected(res.data);
    return res.data;
  };

  const isReplied = (f) => f.status === 'replied' || (Array.isArray(f.replies) && f.replies.length > 0);

  const avgRating = useMemo(() => {
    if (feedbacks.length === 0) return '0.0';
    const sum = feedbacks.reduce((acc, f) => acc + (Number(f.rating) || 5), 0);
    return (sum / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const repliedCount = useMemo(() => feedbacks.filter(isReplied).length, [feedbacks]);
  const unrepliedCount = feedbacks.length - repliedCount;

  const filtered = useMemo(() => {
    let list = [...feedbacks];

    if (statusFilter === 'replied') list = list.filter(isReplied);
    if (statusFilter === 'unreplied') list = list.filter((f) => !isReplied(f));

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.Name?.toLowerCase().includes(term) ||
          f.Email?.toLowerCase().includes(term) ||
          f.review?.toLowerCase().includes(term)
      );
    }

    list.sort((a, b) => {
      const dateA = toDate(a.createdAt)?.getTime() || 0;
      const dateB = toDate(b.createdAt)?.getTime() || 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [feedbacks, search, statusFilter, sortOrder]);

  if (loading) return <Loader full />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-[#2E2118] dark:text-[#F0EAE0]">Customer feedback</h1>
        <p className="text-sm text-[#A99A82] mt-1">Review, respond to, and track customer feedback.</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#EDE6DA] dark:border-white/10 rounded-lg px-4 py-3.5 bg-white dark:bg-[#2A1F16]">
          <p className="text-[11px] text-[#A99A82] uppercase tracking-wide">Total</p>
          <p className="text-xl font-semibold text-[#2E2118] dark:text-[#F0EAE0] mt-1">{feedbacks.length}</p>
        </div>
        <div className="border border-[#EDE6DA] dark:border-white/10 rounded-lg px-4 py-3.5 bg-white dark:bg-[#2A1F16]">
          <p className="text-[11px] text-[#A8672A] uppercase tracking-wide">Unreplied</p>
          <p className="text-xl font-semibold text-[#2E2118] dark:text-[#F0EAE0] mt-1">{unrepliedCount}</p>
        </div>
        <div className="border border-[#EDE6DA] dark:border-white/10 rounded-lg px-4 py-3.5 bg-white dark:bg-[#2A1F16]">
          <p className="text-[11px] text-[#4E7A4A] uppercase tracking-wide">Replied</p>
          <p className="text-xl font-semibold text-[#2E2118] dark:text-[#F0EAE0] mt-1">{repliedCount}</p>
        </div>
        <div className="border border-[#EDE6DA] dark:border-white/10 rounded-lg px-4 py-3.5 bg-white dark:bg-[#2A1F16]">
          <p className="text-[11px] text-[#A99A82] uppercase tracking-wide">Avg. rating</p>
          <p className="text-xl font-semibold text-[#2E2118] dark:text-[#F0EAE0] mt-1 flex items-center gap-1">
            {avgRating} <Star size={14} className="text-[#C98A3D]" fill="#C98A3D" />
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-[#2A1F16] border border-[#EDE6DA] dark:border-white/10 rounded-lg px-3 py-2 flex-1">
          <Search size={15} className="text-[#A99A82] flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or message..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-[#A99A82] text-[#2E2118] dark:text-[#E8DFD3]"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'unreplied', 'replied'].map((val) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`text-xs font-medium px-3 py-2 rounded-lg border transition-colors capitalize ${
                statusFilter === val
                  ? 'bg-[#2E2118] dark:bg-[#C98A3D] text-white border-[#2E2118] dark:border-[#C98A3D]'
                  : 'bg-white dark:bg-[#2A1F16] text-[#5C4A3A] dark:text-[#C9BBA4] border-[#EDE6DA] dark:border-white/10 hover:border-[#C98A3D]/40'
              }`}
            >
              {val}
            </button>
          ))}

          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none text-xs font-medium bg-white dark:bg-[#2A1F16] border border-[#EDE6DA] dark:border-white/10 text-[#5C4A3A] dark:text-[#C9BBA4] rounded-lg pl-3 pr-7 py-2 outline-none cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A99A82] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="border border-[#F0C5B8] bg-[#FBEAEA] dark:bg-[#3A2420] dark:border-[#5A3428] text-[#C1503F] dark:text-[#E8A79A] text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* List */}
      <div className="border border-[#EDE6DA] dark:border-white/10 rounded-lg bg-white dark:bg-[#2A1F16] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <MessageSquare size={24} className="text-[#D9CDBB] mb-3" />
            <p className="text-sm font-medium text-[#2E2118] dark:text-[#F0EAE0]">
              {feedbacks.length === 0 ? 'No feedback yet' : 'No feedback matches your filters'}
            </p>
            <p className="text-xs text-[#A99A82] mt-1">
              {feedbacks.length === 0
                ? 'Customer feedback will appear here once submitted.'
                : 'Try a different search term or filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EDE6DA] dark:divide-white/10">
            {filtered.map((f) => {
              const replied = isReplied(f);
              const rating = Number(f.rating) || 5;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelected(f)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#F9F6F1] dark:hover:bg-white/5 transition-colors"
                >
                  <div className="relative w-9 h-9 rounded-full bg-[#EDE6DA] dark:bg-white/10 flex items-center justify-center text-xs font-semibold text-[#A8672A] dark:text-[#E8DFD3] flex-shrink-0">
                    {(f.Name || f.Email || '?').charAt(0).toUpperCase()}
                    {f.sentiment === 'negative' && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#C1503F] rounded-full ring-2 ring-white dark:ring-[#2A1F16]" />
                    )}
                  </div>

                  <div className="min-w-0 w-48 flex-shrink-0 hidden sm:block">
                    <p className="text-sm font-medium text-[#2E2118] dark:text-[#F0EAE0] truncate">{f.Name || 'Unknown'}</p>
                    <p className="text-xs text-[#A99A82] truncate flex items-center gap-1">
                      <Mail size={10} /> {f.Email || '—'}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#4A3B2D] dark:text-[#C9BBA4] truncate sm:hidden font-medium">{f.Name || 'Unknown'}</p>
                    <p className="text-sm text-[#5C4A3A] dark:text-[#C9BBA4] truncate">{f.review || 'No message'}</p>
                  </div>

                  <div className="hidden md:flex items-center gap-1 text-[#C98A3D] flex-shrink-0 w-12">
                    <Star size={13} fill="#C98A3D" />
                    <span className="text-sm text-[#2E2118] dark:text-[#F0EAE0]">{rating}</span>
                  </div>

                  <span className="hidden lg:block text-xs text-[#A99A82] w-14 flex-shrink-0">
                    {formatShortDate(f.createdAt)}
                  </span>

                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-md flex-shrink-0 ${
                      replied
                        ? 'bg-[#EAF2E9] text-[#4E7A4A] dark:bg-[#4E7A4A]/15'
                        : 'bg-[#FBEEDC] text-[#A8672A] dark:bg-[#C98A3D]/15'
                    }`}
                  >
                    {replied ? 'Replied' : 'Unreplied'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <FeedbackDetailDrawer
          feedback={selected}
          onClose={() => setSelected(null)}
          onReplySent={handleReplySent}
          onAnalyze={handleAnalyze}
        />
      )}
    </div>
  );
};

export default Feedback;