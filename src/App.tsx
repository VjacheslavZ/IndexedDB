import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router';

import IndexedDBUsage from './components/IndexedDBUsage';
import FileSystemAPIUsage from './components/FileSystemAPIUsage';
import OriginPrivateFileSystemUsage from './components/OriginPrivateFileSystemUsage';
import FilesThree from './components/FilesThree';

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
      <BrowserRouter>
        <Routes>
          <Route path='/indexed-db' element={<IndexedDBUsage />} />
          <Route
            path='/file-system-api'
            element={
              <div>
                <FileSystemAPIUsage />
                <OriginPrivateFileSystemUsage />
                <FilesThree />
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
