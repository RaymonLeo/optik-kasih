// appV1.0 Rev 1 - Entry Inertia dengan splash screen global Optik Kasih.

import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import AppSplashScreen from '@/Components/AppSplashScreen';

createInertiaApp({
  progress: { color: '#ea580c' }, // oranye
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.jsx`,
      import.meta.glob('./Pages/**/*.jsx')
    ),
  setup({ el, App, props }) {
    createRoot(el).render(
      <AppSplashScreen>
        <App {...props} />
      </AppSplashScreen>
    );
  },
});
