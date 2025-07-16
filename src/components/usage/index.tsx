import { FC, useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import FolderIcon from '@mui/icons-material/Folder';
import ListItemText from '@mui/material/ListItemText';
import FileIcon from '@mui/icons-material/InsertDriveFile';

import { IndexDB } from '../../lib/indexed_db';
import { Box, Button } from '@mui/material';
import FileSystemStorage from '../../lib/file_system_storage.js';
import { FileSystemWeb } from '../../lib/file_system_web.js';

const fsWeb = new FileSystemWeb();

const customersIdb = new IndexDB({
  name: 'Customers',
  version: 1,
  stores: {
    user: { keyPath: 'id', autoIncrement: true },
    baned_user: { keyPath: 'id', autoIncrement: true },
  },
});

const fs = new FileSystemStorage();

const Usage: FC = () => {
  const [files, setFiles] = useState<{ name: string; kind: string }[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        await customersIdb.init();
        await fs.init();
        const files = await fs.getListFiles();
        setFiles(files);
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

  // File system usage
  const uploadFile = async () => {
    try {
      const file = await fsWeb.openFilePicker();
      await fs.createFile(file);
      console.log('Uploaded');
    } catch (error) {
      console.log('Upload failed', error);
    }
  };

  const saveFile = async () => {
    try {
      const result = await fsWeb.saveFilePicker();
      console.log(result);
      console.log('Saved');
    } catch (error) {
      console.log('Save failed', error);
    }
  };

  const deleteFile = async () => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;
    await fs.deleteFile(fileName);
  };

  const readFile = async () => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;
    const content = await fs.readFile(fileName);
    console.log('content', content);
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

        <Button
          sx={{ mr: 2 }}
          variant='contained'
          color='secondary'
          onClick={banUser}
        >
          Ban User
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Button
          sx={{ mr: 2 }}
          variant='contained'
          color='primary'
          onClick={uploadFile}
        >
          Upload File
        </Button>
        <Button
          sx={{ mr: 2 }}
          variant='contained'
          color='primary'
          onClick={readFile}
        >
          Read file
        </Button>
        <Button
          sx={{ mr: 2 }}
          variant='contained'
          color='primary'
          onClick={saveFile}
        >
          Save File
        </Button>
        <Button
          sx={{ mr: 2 }}
          variant='contained'
          color='secondary'
          onClick={deleteFile}
        >
          Delete File
        </Button>
      </Box>
      <div>
        <List>
          {files.map(({ name, kind }) => (
            <ListItem key={name}>
              <ListItemIcon>
                {kind === 'file' ? <FileIcon /> : <FolderIcon />}
              </ListItemIcon>
              <ListItemText>{name}</ListItemText>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};

export default Usage;
