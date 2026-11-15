import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/home/HomePage';
import { MineriaPage } from './pages/mineria/MineriaPage';
import { FinanzasPage } from './pages/finanzas/FinanzasPage';
import { LogisticaPage } from './pages/logistica/LogisticaPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mineria/*" element={<MineriaPage />} />
        <Route path="/finanzas/*" element={<FinanzasPage />} />
        <Route path="/logistica/*" element={<LogisticaPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
