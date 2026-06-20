import React from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { AppContent } from './AppContent';

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;