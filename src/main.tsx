import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { registerSW } from 'virtual:pwa-register';

// Automatically check and activate updates immediately across all mobile devices
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('JapanTrip PWA: New version detected, updating immediately...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('JapanTrip PWA: App ready to work offline');
  },
});

// Force reload on controllerchange so mobile clients instantly receive the latest bundle
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  // Re-check for new versions when user re-enters the app
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.update();
      });
    }
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

