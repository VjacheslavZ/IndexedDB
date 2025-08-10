import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router';

import IndexedDBUsage from './components/IndexedDBUsage';
import FileSystemAPIUsage from './components/FileSystemAPIUsage';
import OriginPrivateFileSystemUsage from './components/OriginPrivateFileSystemUsage';
// import FilesThree from './components/FilesThree';
import FileSystemDemo from './components/FileSystemDemo';
import OpfsDemo from './components/OpfsDemo';

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
                <OpfsDemo />
                <FileSystemDemo />
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
