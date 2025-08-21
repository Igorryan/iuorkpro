import 'react-native-get-random-values';
import { ThemeProvider } from 'styled-components';
import theme from '@theme/index';
import AppProvider from '@hooks/index';
import { Routes } from '@routes/index';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppProvider>
        <Routes />
      </AppProvider>
    </ThemeProvider>
  );
}


