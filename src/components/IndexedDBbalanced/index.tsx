import { FC, useEffect, useState } from 'react';
import { Button, ButtonGroup, Grid } from '@mui/material';

import userService from '../../lib/w9/Balanced/user';

const IndexedDBBalanced: FC = () => {
  const addUser = async () => {
    const age = parseInt(prompt('Enter user age:') ?? '0', 10);
    const { result } = await userService.insert({
      store: 'user',
      record: { name: 'John', age },
    });

    userService.insert({
      store: 'userLogs',
      record: {
        action: 'add_user',
        user_id: result,
        previous_value: -1,
        new_value: age,
      },
    });
  };

  const selectAllUsers = async () => {
    try {
      const allUsers = await userService.openCursor({
        store: 'user',
        indexName: 'age',
        where: ['≥', 18],
        offset: 0,
        limit: 4,
        direction: 'prev',
      });
      console.log('allUsers', allUsers);
    } catch (error) {
      console.log('error', error);
    }
  };

  const deleteUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;
    await userService.delete({ store: 'user', id });
  };

  const incrementAge = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;
    await userService.incrementAge(id);
  };

  return (
    <div>
      <Grid container>
        <ButtonGroup sx={{ mb: 2 }}>
          <Button variant='contained' color='primary' onClick={addUser}>
            Add User
          </Button>

          <Button variant='contained' color='primary' onClick={deleteUser}>
            Delete User
          </Button>

          <Button variant='contained' color='primary' onClick={selectAllUsers}>
            Select all Users
          </Button>

          <Button variant='contained' color='primary' onClick={incrementAge}>
            Increment Age
          </Button>
        </ButtonGroup>
      </Grid>
    </div>
  );
};

export default IndexedDBBalanced;
