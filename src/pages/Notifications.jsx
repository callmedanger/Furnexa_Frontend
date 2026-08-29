import { useEffect, useState } from 'react';
import { fetchNotifications } from '../api/notificationService';
import Loader from '../components/Loader';
import { Bell } from 'lucide-react';

const formatDate = (createdAt) => {
  if (!createdAt) return '—';
  const date = createdAt._seconds ? new Date(createdAt._seconds * 1000) : new Date(createdAt);
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
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
        <h1 className="text-2xl font-serif text-[#2E2118] dark:text-[#F0EAE0]">Notifications</h1>
        <p className="text-sm text-[#A99A82] mt-1">{notifications.length} notifications</p>
      </div>

      <div className="bg-white dark:bg-[#2A1F16] rounded-2xl shadow-sm border border-[#EDE6DA] dark:border-white/10 divide-y divide-[#F0EAE0] dark:divide-white/10">
        {notifications.length === 0 ? (
          <p className="px-5 py-8 text-center text-[#A99A82]">No notifications found.</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#F9F6F1] dark:hover:bg-white/5 transition-colors">
              <div className="w-9 h-9 rounded-full bg-[#FBEEDC] dark:bg-[#C98A3D]/20 flex items-center justify-center flex-shrink-0">
                <Bell size={16} className="text-[#C98A3D]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#2E2118] dark:text-[#F0EAE0]">{n.title || n.type}</p>
                <p className="text-sm text-[#5C4A3A] dark:text-[#C9BBA4] mt-0.5">{n.message}</p>
                {n.bookTitle && (
                  <p className="text-xs text-[#A99A82] mt-1">Book: {n.bookTitle}</p>
                )}
                {n.sellerName && (
                  <p className="text-xs text-[#A99A82]">Seller: {n.sellerName}</p>
                )}
              </div>
              <span className="text-xs text-[#A99A82] whitespace-nowrap">{formatDate(n.createdAt)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;