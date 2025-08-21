import React from 'react';
import { AuthProvider } from './auth';

type Props = { children: React.ReactNode };

const AppProvider: React.FC<Props> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default AppProvider;


