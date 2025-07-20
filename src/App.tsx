import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import IndexedDBUsage from './components/IndexedDBUsage';
import FileSystemAPIUsage from './components/FileSystemAPIUsage';
import OriginPrivateFileSystemUsage from './components/OriginPrivateFileSystemUsage';

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

      <IndexedDBUsage />
      <FileSystemAPIUsage />
      <OriginPrivateFileSystemUsage />
    </ThemeProvider>
  );
};

export default App;
