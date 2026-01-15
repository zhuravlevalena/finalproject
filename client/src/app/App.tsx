import './main.css';
import React from 'react';
import { queryClient } from '@/shared/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/shared/ui/toaster';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Router from './Router/Router';

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
