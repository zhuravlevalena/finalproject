import './main.css';
import React from 'react';
import { Toaster } from '@/shared/ui/toaster';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Router from './Router/Router';

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </Provider>
  );
}

export default App;
