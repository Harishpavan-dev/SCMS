import { useEffect } from 'react';
import useAuthStore from '../stores/authStore';
import { requestPermission, getFirebaseMessaging } from '../utils/firebase';
import { onMessage } from 'firebase/messaging';
import api from '../api/client';
import toast from 'react-hot-toast';

const useNotifications = () => {
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        let unsubscribe = () => {};

        if (isAuthenticated && user) {
            const setupNotifications = async () => {
                try {
                    const token = await requestPermission();
                    if (token) {
                        await api.post('/fcm/token', { 
                            token: token,
                            device_type: 'web'
                        });
                        console.log('FCM Token registered with backend');
                    }

                    const messaging = await getFirebaseMessaging();
                    if (messaging) {
                        unsubscribe = onMessage(messaging, (payload) => {
                            console.log('Foreground Message received:', payload);
                            toast.success(
                                <div className="flex flex-col gap-1">
                                    <b className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1 mb-1">
                                        {payload.notification?.title || 'System Alert'}
                                    </b>
                                    <span className="text-xs text-slate-500 font-medium">
                                        {payload.notification?.body}
                                    </span>
                                </div>,
                                {
                                    duration: 8000,
                                    position: 'top-right',
                                    icon: '🔔',
                                    style: {
                                        borderRadius: '20px',
                                        background: '#fff',
                                        color: '#1e293b',
                                        padding: '16px',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                                    },
                                }
                            );
                        });
                    }
                } catch (error) {
                    console.error('Notification setup failed:', error);
                }
            };

            setupNotifications();
        }

        return () => unsubscribe();
    }, [isAuthenticated, user]);
};

export default useNotifications;
