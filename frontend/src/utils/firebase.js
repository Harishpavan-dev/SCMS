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
      
      const token = await getToken(msg, { 
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
