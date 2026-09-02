import { useState } from 'react';
import { X, Star, Mail, Calendar, Send, Clock, Sparkles, AlertTriangle } from 'lucide-react';

const toDate = (ts) => {
  if (!ts) return null;
  if (ts._seconds) return new Date(ts._seconds * 1000);
  return new Date(ts);
};

const formatDate = (ts) => {
  const date = toDate(ts);
  if (!date || isNaN(date)) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const FeedbackDetailDrawer = ({ feedback, onClose, onReplySent, onAnalyze }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  if (!feedback) return null;

  const replies = Array.isArray(feedback.replies) ? feedback.replies : [];
  const isReplied = feedback.status === 'replied' || replies.length > 0;
  const rating = Number(feedback.rating) || 5;
  const sentiment = feedback.sentiment;

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    try {
      await onReplySent(feedback.id, message.trim());
      setMessage('');
    } catch (err) {
      console.error(err);
      setError('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const updated = await onAnalyze(feedback.id);
      if (updated?.suggestedReply) setMessage(updated.suggestedReply);
    } catch (err) {
      console.error(err);
      setError('AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-[#241A12] h-full shadow-xl border-l border-[#EDE6DA] dark:border-white/10 flex flex-col animate-[slideIn_0.2s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE6DA] dark:border-white/10">
          <h3 className="text-sm font-semibold text-[#2E2118] dark:text-[#F0EAE0]">Feedback details</h3>
          <button
            onClick={onClose}
            className="text-[#A99A82] hover:text-[#2E2118] dark:hover:text-white p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Sentiment banner */}
          {sentiment === 'negative' && (
            <div className="flex items-start gap-2.5 bg-[#FBEAEA] dark:bg-[#3A2420] border border-[#F0C5B8] dark:border-[#5A3428] rounded-lg px-3.5 py-3">
              <AlertTriangle size={15} className="text-[#C1503F] dark:text-[#E8A79A] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#C1503F] dark:text-[#E8A79A] leading-relaxed">
                AI flagged this as a <strong>negative</strong> review — needs prompt attention.
              </p>
            </div>
          )}

          {/* Customer */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EDE6DA] dark:bg-white/10 flex items-center justify-center text-sm font-semibold text-[#A8672A] dark:text-[#E8DFD3] flex-shrink-0">
              {(feedback.Name || feedback.Email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#2E2118] dark:text-[#F0EAE0]">{feedback.Name || 'Unknown customer'}</p>
              <p className="text-xs text-[#A99A82] flex items-center gap-1 mt-0.5">
                <Mail size={11} /> {feedback.Email || 'No email on file'}
              </p>
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="border border-[#EDE6DA] dark:border-white/10 rounded-lg px-3 py-2.5">
              <p className="text-[10px] text-[#A99A82] uppercase tracking-wide mb-1">Rating</p>
              <div className="flex items-center gap-1 text-[#C98A3D]">
                <Star size={13} fill="#C98A3D" />
                <span className="font-medium text-[#2E2118] dark:text-[#F0EAE0]">{rating} / 5</span>
              </div>
            </div>
            <div className="border border-[#EDE6DA] dark:border-white/10 rounded-lg px-3 py-2.5">
              <p className="text-[10px] text-[#A99A82] uppercase tracking-wide mb-1">Status</p>
              <span className={`text-xs font-medium ${isReplied ? 'text-[#4E7A4A]' : 'text-[#A8672A]'}`}>
                {isReplied ? 'Replied' : 'Unreplied'}
              </span>
            </div>
          </div>

          {feedback.createdAt && (
            <div className="flex items-center gap-1.5 text-xs text-[#A99A82]">
              <Calendar size={12} />
              Submitted {formatDate(feedback.createdAt)}
            </div>
          )}

          {/* Full message */}
          <div>
            <p className="text-[10px] font-medium text-[#A99A82] uppercase tracking-wide mb-2">Feedback message</p>
            <div className="bg-[#F6F2EC] dark:bg-white/5 rounded-lg px-4 py-3.5 text-sm text-[#4A3B2D] dark:text-[#C9BBA4] leading-relaxed whitespace-pre-wrap">
              {feedback.review || 'No message provided.'}
            </div>
          </div>

          {/* Reply history */}
          {replies.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-[#A99A82] uppercase tracking-wide mb-2">Reply history</p>
              <div className="space-y-2">
                {replies.map((r, idx) => (
                  <div key={idx} className="bg-[#FBEEDC] dark:bg-[#C98A3D]/10 rounded-lg px-4 py-3">
                    <p className="text-sm text-[#4A3B2D] dark:text-[#E8DFD3] whitespace-pre-wrap">{r.message}</p>
                    <p className="flex items-center gap-1 text-[10px] text-[#A8672A] dark:text-[#C9A876] mt-2">
                      <Clock size={10} /> {formatDate(r.sentAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply composer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-medium text-[#A99A82] uppercase tracking-wide">
                {isReplied ? 'Send another reply' : 'Reply via email'}
              </p>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !feedback.review}
                className="flex items-center gap-1.5 text-[11px] font-medium text-[#C98A3D] hover:text-[#A8672A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles size={12} />
                {analyzing ? 'Analyzing...' : 'Suggest reply with AI'}
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={feedback.Email ? 'Write your reply, or generate one with AI...' : 'No email available for this customer.'}
              disabled={!feedback.Email}
              rows={5}
              className="w-full bg-white dark:bg-white/5 border border-[#EDE6DA] dark:border-white/10 rounded-lg px-3.5 py-2.5 text-sm outline-none text-[#2E2118] dark:text-[#E8DFD3] placeholder:text-[#A99A82] resize-none focus:border-[#C98A3D] transition-colors disabled:opacity-50"
            />
            {error && <p className="text-xs text-[#C1503F] mt-2">{error}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#EDE6DA] dark:border-white/10">
          <button
            onClick={onClose}
            className="text-sm font-medium text-[#5C4A3A] dark:text-[#C9BBA4] px-4 py-2 rounded-lg hover:bg-[#F6F2EC] dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim() || !feedback.Email}
            className="flex items-center gap-2 bg-[#C98A3D] hover:bg-[#A8672A] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
            {sending ? 'Sending...' : 'Send reply'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetailDrawer;