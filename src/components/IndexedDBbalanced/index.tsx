import { FC } from 'react';
import { Button, ButtonGroup, Grid } from '@mui/material';

import userService from '../../lib/w9/Balanced/user';

import {
  indexedDBuserServiceAgnosticLayer,
  opfsUserServiceAgnosticLayer,
} from '../../lib/storageAgnosticLayer';

const IndexedDBBalanced: FC = () => {
  // indexed DB
  const indexedDBAddUser = async () => {
    const name = prompt('Enter user name:');
    const age = parseInt(prompt('Enter user age:') ?? '0', 10);
    await indexedDBuserServiceAgnosticLayer.create({
      store: 'user',
      record: { name, age },
    });
  };
  const indexedDBUpdateUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;
    const name = prompt('Enter user name:');
    if (!name) return;
    const age = parseInt(prompt('Enter age:') ?? '0', 10);
    if (!Number.isInteger(age)) return;

    await indexedDBuserServiceAgnosticLayer.update({
      store: 'user',
      record: { name, age, id },
    });
  };
  const indexedDBSelectAll = async () => {
    const result = await indexedDBuserServiceAgnosticLayer.read({
      store: 'user',
      indexName: 'age',
      where: ['≥', 0],
      direction: 'prev',
    });
    console.log(result);
  };
  const indexedDBDeleteUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    await userService.deleteUser(id);
  };

  // OPFS
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
  const opfsDBUpdateUser = async () => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    const name = prompt('Enter user name:');
    if (!name) return;

    const age = parseInt(prompt('Enter age:') ?? '0', 10);
    if (!Number.isInteger(age)) return;

    await opfsUserServiceAgnosticLayer.update({
      store: fileName,
      record: JSON.stringify({ name, age }),
      options: {
        create: true,
      },
    });
  };
  const opfsDBDeleteUser = async () => {
    const fileName = prompt('Enter user id:');
    await opfsUserServiceAgnosticLayer.delete(fileName);
  };
  const opfsDBSelectAll = async () => {
    const result = await opfsUserServiceAgnosticLayer.read();
    console.log(result);
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
            onClick={indexedDBUpdateUser}
          >
            Update User
          </Button>

          <Button
            variant='contained'
            color='primary'
            onClick={indexedDBSelectAll}
          >
            Select all Users
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
            onClick={opfsDBDeleteUser}
          >
            Delete User
          </Button>

          <Button
            variant='contained'
            color='primary'
            onClick={opfsDBUpdateUser}
          >
            Update User
          </Button>

          <Button variant='contained' color='primary' onClick={opfsDBSelectAll}>
            Select all Users
          </Button>
        </ButtonGroup>
      </Grid>
    </div>
  );
};

export default IndexedDBBalanced;
