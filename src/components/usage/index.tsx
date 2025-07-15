import { FC, useEffect } from 'react';

import { IndexDB } from '../../db';
import { Box, Button } from '@mui/material';

const customersIdb = new IndexDB({
  name: 'Customers',
  version: 1,
  stores: {
    user: { keyPath: 'id', autoIncrement: true },
    baned_user: { keyPath: 'id', autoIncrement: true },
  },
});

const Usage: FC = () => {
  useEffect(() => {
    const init = async () => {
      try {
        await customersIdb.init();
      } catch (error) {
        console.log('Init failed', error);
      }
    };
    init();
  }, []);

  const addUser = async () => {
    const name = prompt('Enter user name:');
    if (!name) return;
    const age = parseInt(prompt('Enter age:') ?? '0', 10);
    if (!Number.isInteger(age)) return;
    await customersIdb.add('user', { name, age });
  };

  const banUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;
    const result = await customersIdb.add('baned_user', { id });
    console.log('result', result);
  };

  const getUsers = async () => {
    try {
      const users = await customersIdb.getAll('user');
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

    const result = await customersIdb.put('user', id, { name, age });
    console.log('result', result);
  };

  const deleteUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;

    const result = await customersIdb.delete('user', id);
    console.log('result', result);
  };

  const findAdults = async () => {
    const result = await customersIdb.openCursor('user', (user: any) => {
      if (user.age >= 18) return user;
    });
    console.log('result', result);
  };

  const getOneUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;
    const result = await customersIdb.get('user', id);
    console.log('result', result);
  };

  return (
    <div>
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
          onClick={getOneUser}
        >
          Get one
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
      <Box sx={{ flexGrow: 1 }}>
        <Button
          sx={{ mr: 2 }}
          variant='contained'
          color='secondary'
          onClick={banUser}
        >
          Ban User
        </Button>
      </Box>
    </div>
  );
};

export default Usage;
