import { FC, useEffect, useState } from 'react';
import { Button, ButtonGroup, Grid } from '@mui/material';

import { Database } from '../../lib/w9/Balanced/storage';

const schemas = {
  user: {
    id: { type: 'int', primary: true },
    name: { type: 'str', index: true },
    age: { type: 'int' },
  },
};

const IndexedDBBalanced: FC = () => {
  const [db, setDb] = useState<Database>(
    new Database('test', { version: 1, schemas })
  );

  useEffect(() => {
    (async () => {
      const db = await new Database('test', { version: 1, schemas });
      setDb(db);
    })();
  }, []);

  const addUser = async () => {
    await db.insert({ store: 'user', record: { name: 'John', age: 20 } });
  };

  const selectAllUsers = async () => {
    // @ts-ignore
    const allUsers = await db.select({ store: 'user' });
    console.log('users', allUsers);
  };

  const deleteUser = async () => {
    const id = parseInt(prompt('Enter user id:') ?? '0', 10);
    if (!id) return;
    await db?.delete({ store: 'user', id });
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
        </ButtonGroup>
      </Grid>
    </div>
  );
};

export default IndexedDBBalanced;
