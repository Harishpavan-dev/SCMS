importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDy7WY_wt0sedcuMB3pB5Myoq7RmY6cP2s",
  authDomain: "newsflash-9l4nq.firebaseapp.com",
  projectId: "newsflash-9l4nq",
  storageBucket: "newsflash-9l4nq.firebasestorage.app",
  messagingSenderId: "988999064120",
  appId: "1:988999064120:web:a855f78d697340ffb0a4cd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
