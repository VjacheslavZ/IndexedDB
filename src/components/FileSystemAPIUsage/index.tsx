import { FC } from 'react';
import { Button, ButtonGroup, Grid } from '@mui/material';

import { FileSystemWeb } from '../../lib/file_system_web';
import FileSystemStorage from '../../lib/file_system_storage';

const fsWeb = new FileSystemWeb();
const fs = new FileSystemStorage();

const FileSystemAPIUsage: FC = () => {
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
        </ButtonGroup>
      </Grid>
    </div>
  );
};

export default FileSystemAPIUsage;
