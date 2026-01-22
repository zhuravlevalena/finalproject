import React from 'react';

type TooltipProviderProps = {
  children: React.ReactNode;
};

export function TooltipProvider({ children }: TooltipProviderProps): React.JSX.Element {
  return <>{children}</>;
}

