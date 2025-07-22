import { FC } from 'react';
import { Button, ButtonGroup, Grid } from '@mui/material';

import FileSystemManager from '../../lib/FileSystemManager';
import FileSystemStorage from '../../lib/file_system_storage';

const fsManager = new FileSystemManager();
const fs = new FileSystemStorage();

const FileSystemAPIUsage: FC = () => {
  const uploadFile = async () => {
    try {
      const file = await fsManager.openFilePicker();
      await fs.createFile(file);
      console.log('Uploaded');
    } catch (error) {
      console.log('uploadFile handle error', error);
    }
  };

  const saveFile = async () => {
    try {
      const result = await fsManager.saveFilePicker();
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

  const observeFile = async () => {
    try {
      await fsManager.observeFile();
    } catch (error) {
      console.log('Observe file failed ---- ', error);
    }
  };

  return (
    <div>
      <Grid container>
        <ButtonGroup>
          <Button variant='contained' color='primary' onClick={uploadFile}>
            Upload File
          </Button>
          <Button variant='contained' color='primary' onClick={readFile}>
            Read file
          </Button>
          <Button variant='contained' color='primary' onClick={saveFile}>
            Save File
          </Button>
          <Button variant='contained' color='secondary' onClick={deleteFile}>
            Delete File
          </Button>
          <Button variant='contained' color='primary' onClick={observeFile}>
            Observe File
          </Button>
        </ButtonGroup>
      </Grid>
    </div>
  );
};

export default FileSystemAPIUsage;
