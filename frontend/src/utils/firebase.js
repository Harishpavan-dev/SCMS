import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let messaging;

try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  console.error("Firebase App initialization failed", e);
}

export const getFirebaseMessaging = async () => {
    if (messaging) return messaging;
    try {
        const supported = await isSupported();
        if (supported) {
            messaging = getMessaging(app);
            return messaging;
        }
    } catch (e) {
        console.error("Firebase Messaging support check failed", e);
    }
    return null;
};

export const requestPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('Notifications not supported in this browser.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const msg = await getFirebaseMessaging();
      if (!msg) return null;
      
      // Construct SW URL with config params to avoid hardcoding in public folder
      const swUrl = `/firebase-messaging-sw.js?` + 
        `apiKey=${encodeURIComponent(import.meta.env.VITE_FIREBASE_API_KEY)}&` +
        `authDomain=${encodeURIComponent(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)}&` +
        `projectId=${encodeURIComponent(import.meta.env.VITE_FIREBASE_PROJECT_ID)}&` +
        `storageBucket=${encodeURIComponent(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET)}&` +
        `messagingSenderId=${encodeURIComponent(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID)}&` +
        `appId=${encodeURIComponent(import.meta.env.VITE_FIREBASE_APP_ID)}`;

      const registration = await navigator.serviceWorker.register(swUrl);
      
      const token = await getToken(msg, { 
        serviceWorkerRegistration: registration,
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return null;
  }
};

export const onMessageListener = async () => {
    const msg = await getFirebaseMessaging();
    if (!msg) return null;

    return new Promise((resolve) => {
        onMessage(msg, (payload) => {
            resolve(payload);
        });
    });
};

export default app;
