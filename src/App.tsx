import React, { useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Button,
} from '@mui/material';
import { Logger, _db, IndexDB } from './db';

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
  const logger = new Logger('output');
  const idb = new IndexDB('Example', 1);

  const addUser = async () => {
    const name = prompt('Enter user name:');
    if (!name) return;
    const age = parseInt(prompt('Enter age:') ?? '0', 10);
    if (!Number.isInteger(age)) return;
    await idb.init('user');
    await idb.add('user', { name, age });
  };

  const getUsers = async () => {
    try {
      console.log('Getting users');
      await idb.init('user');
      const users = await idb.getAll('user');
      console.log('Users :', users);
    } catch (error) {
      console.log('Get failed', error);
    }
  };

  const updateUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;
    const name = prompt('Enter user name:');
    if (!name) return;
    const age = parseInt(prompt('Enter age:') ?? '0', 10);
    if (!Number.isInteger(age)) return;

    await idb.init('user');
    const result = await idb.put('user', id, { name, age });
    console.log('result', result);
  };

  const deleteUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;
    await idb.init('user');
    const result = await idb.delete('user', id);
    console.log('result', result);
  };

  const findAdults = async () => {
    await idb.init('user');
    const result = await idb.openCursor('user', (user: any) => {
      if (user.age >= 18) return user;
    });

    console.log('result', result);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <Button
          sx={{ mr: 2 }}
          variant='contained'
          color='primary'
          id='add'
          onClick={addUser}
        >
          Add User
        </Button>
        <Button
          sx={{ mr: 2 }}
          variant='contained'
          color='primary'
          id='get'
          onClick={getUsers}
        >
          Get All Users
        </Button>
        <Button
          sx={{ mr: 2 }}
          variant='contained'
          color='primary'
          id='update'
          onClick={updateUser}
        >
          Update User
        </Button>
        <Button
          sx={{ mr: 2 }}
          variant='contained'
          color='primary'
          id='delete'
          onClick={deleteUser}
        >
          Delete User
        </Button>
        <Button
          sx={{ mr: 2 }}
          variant='contained'
          color='primary'
          id='adults'
          onClick={findAdults}
        >
          Find Adults
        </Button>
      </Box>
    </ThemeProvider>
  );
};

export default App;
