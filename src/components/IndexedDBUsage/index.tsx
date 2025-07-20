import { FC } from 'react';
import { Button, ButtonGroup, Grid } from '@mui/material';

import { IndexedDB } from '../../lib/indexedDB';

const customersIdb = new IndexedDB({
  name: 'Customers',
  version: 1,
  stores: {
    user: { keyPath: 'id', autoIncrement: true },
    baned_user: { keyPath: 'id', autoIncrement: true },
  },
});

const IndexedDBUsage: FC = () => {
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
      <Grid container>
        <ButtonGroup sx={{ mb: 2 }}>
          <Button
            variant='contained'
            color='primary'
            id='add'
            onClick={addUser}
          >
            Add User
          </Button>
          <Button
            variant='contained'
            color='primary'
            id='get'
            onClick={getOneUser}
          >
            Get one
          </Button>
          <Button
            variant='contained'
            color='primary'
            id='get'
            onClick={getUsers}
          >
            Get All Users
          </Button>
          <Button
            variant='contained'
            color='primary'
            id='update'
            onClick={updateUser}
          >
            Update User
          </Button>
          <Button
            variant='contained'
            color='primary'
            id='delete'
            onClick={deleteUser}
          >
            Delete User
          </Button>
          <Button
            variant='contained'
            color='primary'
            id='adults'
            onClick={findAdults}
          >
            Find Adults
          </Button>
          <Button variant='contained' color='secondary' onClick={banUser}>
            Ban User
          </Button>
        </ButtonGroup>
      </Grid>
    </div>
  );
};

export default IndexedDBUsage;
