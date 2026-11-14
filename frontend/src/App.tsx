/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TopScrollProgress } from './views/components/TopScrollProgress';
import { AppRoutes, ScrollToTop } from './routes/AppRoutes';

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
