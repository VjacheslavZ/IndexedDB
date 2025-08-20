import { FC } from 'react';
import { Button, ButtonGroup, Grid } from '@mui/material';

import userService from '../../lib/w9/Balanced/user';

const IndexedDBBalanced: FC = () => {
  const addUser = async () => {
    const name = prompt('Enter user name:');
    const age = parseInt(prompt('Enter user age:') ?? '0', 10);
    await userService.addUser(name, age);
  };

  const selectAllUsers = async () => {
    await userService.selectAllUsers();
  };

  const deleteUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    await userService.deleteUser(id);
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
