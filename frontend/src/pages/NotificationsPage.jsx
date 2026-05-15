import { useState, useEffect } from 'react';
import api from '../api/client';
import useAuthStore from '../stores/authStore';
import { BellIcon, CheckIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
            <BellIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-500">Your recent alerts and system messages</p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={markAllRead}
            disabled={notifications.every(n => n.is_read)}
            className="btn bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <ArchiveBoxIcon className="w-16 h-16 mb-4 text-slate-200" />
            <p className="text-lg font-medium text-slate-600">You're all caught up!</p>
            <p className="text-sm">No new notifications to display.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-6 flex items-start gap-4 transition-colors ${notification.is_read ? 'bg-white opacity-60' : 'bg-blue-50/50'}`}
            >
              <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${notification.is_read ? 'bg-slate-300' : 'bg-blue-600 animate-pulse'}`}></div>
              
              <div className="flex-1">
                <h3 className={`font-semibold text-base mb-1 ${notification.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                  {notification.title}
                </h3>
                <p className="text-slate-600 text-sm mb-2">{notification.message}</p>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>

              {!notification.is_read && (
                <button 
                  onClick={() => markAsRead(notification.id)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors tooltip"
                  title="Mark as read"
                >
                  <CheckIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
