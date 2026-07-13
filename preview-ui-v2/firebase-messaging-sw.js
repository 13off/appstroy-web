/*
 * Firebase Messaging service worker for AppСтрой PWA.
 * Public Firebase values are injected by GitHub Actions during the web build.
 * No service account, service-role key or APNs secret belongs in this file.
 */

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};
const appPublicUrl = "https://13off.github.io/appstroy-web/preview-ui-v2/";

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const fcmMessage = event.notification.data?.FCM_MSG;
  const target =
    event.notification.data?.link ||
    fcmMessage?.fcmOptions?.link ||
    fcmMessage?.data?.link ||
    appPublicUrl;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ("focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return clients.openWindow ? clients.openWindow(target) : undefined;
    }),
  );
});

const configured = Object.values(firebaseConfig).every(
  (value) => value && !value.startsWith("__FIREBASE_"),
);

if (configured) {
  importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    // Notification payloads are displayed automatically by FCM. This fallback
    // is only for future data-only messages and deliberately avoids duplicates.
    if (payload.notification) return;

    const title = payload.data?.title || "AppСтрой";
    const body = payload.data?.body || "В приложении есть новое уведомление";
    self.registration.showNotification(title, {
      body,
      icon: `${appPublicUrl.replace(/\/$/, "")}/icons/AppStroy-192-v2.png`,
      badge: `${appPublicUrl.replace(/\/$/, "")}/icons/AppStroy-192-v2.png`,
      data: { link: appPublicUrl, FCM_MSG: payload },
    });
  });
}
