import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import AuthProvider from './context/AuthContext.tsx';
import './index.css';
import { GlobalModalProvider } from './context/GlobalModalContext.tsx';
import 'react-tooltip/dist/react-tooltip.css';
import NotificationProvider from './context/NotificationContext.tsx';
import { Button, Panel, Tooltip, TextInput } from './components/ui';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/select';
import RecordTable from './components/Records/RecordTable';
import LoadingSpinnerSmall from './components/ui/Loading/LoadingSpinnerSmall';

const queryClient = new QueryClient();

window.React = React;
window.ReactDOM = ReactDOM;
window.__miscCloudHostUI__ = {
  Button,
  Panel,
  RecordTable,
  Tooltip,
  TextInput,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  LoadingSpinnerSmall
};

async function enableMocking() {
  if (process.env.NODE_ENV === 'mock') {
    const { server } = await import('@/mocks/api/handlers.ts');
    return server.start();
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('entry')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <GlobalModalProvider>
                <App />
              </GlobalModalProvider>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
});
