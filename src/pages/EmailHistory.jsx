import { useEffect, useState } from 'react';
import { Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchEmailLogs } from '../api/emailService';
import Loader from '../components/Loader';

const formatDate = (sentAt) => {
  if (!sentAt) return '—';
  const date = sentAt._seconds ? new Date(sentAt._seconds * 1000) : new Date(sentAt);
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const EmailHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchEmailLogs();
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader full />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-[#2E2118] dark:text-[#F0EAE0]">Email History</h1>
        <p className="text-sm text-[#A99A82] mt-1">{logs.length} emails sent</p>
      </div>

      <div className="bg-white dark:bg-[#2A1F16] rounded-2xl border border-[#EDE6DA] dark:border-white/10 divide-y divide-[#F0EAE0] dark:divide-white/10">
        {logs.length === 0 ? (
          <p className="px-5 py-8 text-center text-[#A99A82]">No emails sent yet.</p>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div key={log.id} className="px-5 py-4">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full flex items-start gap-4 text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-[#FBEEDC] dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-[#C98A3D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2E2118] dark:text-[#F0EAE0]">{log.subject}</p>
                    <p className="text-xs text-[#A99A82] mt-0.5">
                      {log.recipients?.length || 0} recipient(s) · {log.successCount} sent
                      {log.failCount > 0 && `, ${log.failCount} failed`}
                    </p>
                  </div>
                  <span className="text-xs text-[#A99A82] whitespace-nowrap flex-shrink-0">{formatDate(log.sentAt)}</span>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-[#A99A82] flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-[#A99A82] flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-3 ml-13 pl-13 text-sm text-[#5C4A3A] dark:text-[#C9BBA4] space-y-2">
                    <div>
                      <p className="text-xs text-[#A99A82] mb-1">Recipients:</p>
                      <p className="text-xs">{log.recipients?.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#A99A82] mb-1">Message:</p>
                      <p className="whitespace-pre-wrap">{log.message}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EmailHistory;