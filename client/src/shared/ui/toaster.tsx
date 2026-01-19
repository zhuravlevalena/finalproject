import React from 'react';
import { ToastProvider } from './toast';

export function Toaster() {
  return null; // ToastProvider handles rendering
}

export { ToastProvider, useToast } from './toast';