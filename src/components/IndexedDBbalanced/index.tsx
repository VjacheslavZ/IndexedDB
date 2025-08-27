import { FC } from 'react';
import { Button, ButtonGroup, Grid } from '@mui/material';

import userService from '../../lib/w9/Balanced/user';

import {
  indexedDBuserServiceAgnosticLayer,
  opfsUserServiceAgnosticLayer,
} from '../../lib/storageAgnosticLayer';

const IndexedDBBalanced: FC = () => {
  const indexedDBAddUser = async () => {
    const name = prompt('Enter user name:');
    const age = parseInt(prompt('Enter user age:') ?? '0', 10);
    await indexedDBuserServiceAgnosticLayer.create({
      store: 'user',
      record: { name, age },
    });
  };

  const opfsAddUser = async () => {
    const name = prompt('Enter user name:');
    const age = parseInt(prompt('Enter user age:') ?? '0', 10);
    await opfsUserServiceAgnosticLayer.create({
      store: `user_${name}_${age}.txt`,
      record: JSON.stringify({ name, age }),
      options: {
        create: true,
      },
    });
  };

  const indexedDBSelectAllUsers = async () => {
    await userService.selectAllUsers();
  };

  const indexedDBDeleteUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    await userService.deleteUser(id);
  };

  const indexedDBIncrementAge = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;
    await userService.incrementAge(id);
  };

  return (
    <div>
      <h3>IndexedDB</h3>
      <Grid container>
        <ButtonGroup sx={{ mb: 2 }}>
          <Button
            variant='contained'
            color='primary'
            onClick={indexedDBAddUser}
          >
            Add User
          </Button>

          <Button
            variant='contained'
            color='primary'
            onClick={indexedDBDeleteUser}
          >
            Delete User
          </Button>

          <Button
            variant='contained'
            color='primary'
            onClick={async () => {
              const result = await indexedDBuserServiceAgnosticLayer.read({
                store: 'user',
                indexName: 'age',
                where: ['≥', 0],
                direction: 'prev',
              });
              console.log(result);
            }}
          >
            Select all Users
          </Button>

          <Button
            variant='contained'
            color='primary'
            onClick={indexedDBIncrementAge}
          >
            Increment Age
          </Button>
        </ButtonGroup>
      </Grid>

      <h3>OPFS</h3>
      <Grid container>
        <ButtonGroup sx={{ mb: 2 }}>
          <Button variant='contained' color='primary' onClick={opfsAddUser}>
            Add User
          </Button>

          <Button
            variant='contained'
            color='primary'
            //onClick={deleteUser}
          >
            Delete User
          </Button>

          <Button
            variant='contained'
            color='primary'
            onClick={async () => {
              const result = await opfsUserServiceAgnosticLayer.read();
              console.log({ result });
            }}
          >
            Select all Users
          </Button>

          <Button
            variant='contained'
            color='primary'
            //onClick={incrementAge}
          >
            Increment Age
          </Button>
        </ButtonGroup>
      </Grid>
    </div>
  );
};

export default IndexedDBBalanced;
