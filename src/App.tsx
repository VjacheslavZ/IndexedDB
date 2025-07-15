import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import Usage from './components/usage';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Usage />
    </ThemeProvider>
  );
};

export default App;
