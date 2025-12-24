import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { AppProvider } from './context/AppContext';
import { App } from './components/App/App';
import { wordsData } from '@ai-workshop/shared-data';
import './index.css';

// Convert the new data structure into a single array of words.
const words = Object.values(wordsData).flat();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <AppProvider words={words}>
        <App />
      </AppProvider>
    </ConfigProvider>
  </StrictMode>
);
