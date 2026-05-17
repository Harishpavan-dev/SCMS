import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDy7WY_wt0sedcuMB3pB5Myoq7RmY6cP2s",
  authDomain: "newsflash-9l4nq.firebaseapp.com",
  projectId: "newsflash-9l4nq",
  storageBucket: "newsflash-9l4nq.firebasestorage.app",
  messagingSenderId: "988999064120",
  appId: "1:988999064120:web:a855f78d697340ffb0a4cd"
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
        vapidKey: 'BPmbtoxOiT5OcaJNnRvro8WILisNxBnzmdnX_MaVOlw7KOj7XV7pIdoeCT4D45cLX36x8zn1t-2rPn6vXTepkp4'
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
