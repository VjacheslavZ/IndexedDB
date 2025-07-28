import { FC } from 'react';
import { Button, ButtonGroup, Grid } from '@mui/material';

import { IndexedDB } from '../../lib/indexedDB';

const users_db = new IndexedDB({
  name: 'users',
  version: 1,
  stores: {
    user: { keyPath: 'id', autoIncrement: true },
    userLogs: { keyPath: 'id', autoIncrement: true },
    baned_user: { keyPath: 'id', autoIncrement: true },
  },
});

const IndexedDBUsage: FC = () => {
  const addUser = async () => {
    const name = prompt('Enter user name:');
    if (!name) return;
    const age = parseInt(prompt('Enter age:') ?? '0', 10);
    if (!Number.isInteger(age)) return;

    await users_db.add('user', {
      name,
      age,
      is_active: true,
    });

    // OR
    // await users_db.useTransaction(
    //   ['user', 'userLogs'],
    //   'readwrite',
    //   async (tx, stores) => {
    //     const userStore = stores['user'];
    //     const userLogsStore = stores['userLogs'];
    //     const user_id = await userStore.add({
    //       name,
    //       age,
    //       is_active: true,
    //     });
    //     await userLogsStore.add({
    //       action: 'add_user',
    //       user_id,
    //       timestamp: new Date().getTime(),
    //     });
    //   }
    // );
  };

  const banUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;

    await users_db.useTransaction(
      ['user', 'userLogs', 'baned_user'],
      'readwrite',
      async (tx, stores) => {
        const userStore = stores['user'];
        const bannedUserStore = stores['baned_user'];
        const userLogsStore = stores['userLogs'];

        const user = await userStore.get(id);

        if (!user.is_active) {
          return;
        }

        await userStore.put({ ...user, is_active: false });
        await bannedUserStore.add({ user_id: user.id });
        await userLogsStore.add({
          action: 'ban_user',
          user_id: user.id,
          previous_value: null,
          new_value: null,
          timestamp: new Date().getTime(),
        });
        //tx.abort();
      }
    );
  };

  const getUsers = async () => {
    try {
      const users = await users_db.getAll('user');
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

    await users_db.update('user', { name, age, id });
  };

  const deleteUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;

    const result = await users_db.delete('user', id);
    console.log('result', result);
  };

  const findAdults = async () => {
    const result = await users_db.openCursor(
      'user',
      null,
      'next',
      (user: any) => {
        if (user.age >= 18) return user;
      }
    );
    console.log('result', result);
  };

  const getOneUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;
    const result = await users_db.get('user', id);
    console.log('result', result);
  };

  const incrementAge = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;

    await users_db.useTransaction(
      ['user', 'userLogs'],
      'readwrite',
      async (tx, stores) => {
        const userStore = stores['user'];
        const userLogsStore = stores['userLogs'];
        const user = await userStore.get(id);

        await userLogsStore.add({
          action: 'increment_user_age',
          user_id: id,
          previous_value: user.age,
          new_value: user.age + 1,
          timestamp: new Date().getTime(),
        });
        // throw new Error('Some error happened');
        user.age += 1;
        await userStore.put(user);
        // tx.abort();
        tx.commit();
      }
    );
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
            id='update'
            onClick={incrementAge}
          >
            Increment age
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
