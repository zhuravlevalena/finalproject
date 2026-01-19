import './main.css';
import React from 'react';
import { Toaster, ToastProvider } from '@/shared/ui/toaster';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './store/store';
import { queryClient } from '@/shared/lib/queryClient';
import Router from './Router/Router';

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;