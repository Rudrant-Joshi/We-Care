/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/auth.context';
import { TopScrollProgress } from './views/components/top-scroll-progress.component';
import { AppRoutes, ScrollToTop } from './routes/app.routes';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <TopScrollProgress />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
