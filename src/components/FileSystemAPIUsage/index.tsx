import { FC } from 'react';
import { Button, Grid } from '@mui/material';

import FileSystemManager from '../../lib/file_system_manager';

const fsManager = new FileSystemManager();

const FileSystemAPIUsage: FC = () => {
  const createAndDownloadFromOPFS = async () => {
    try {
      await fsManager.selectDirectoryPicker();
      await fsManager.writeFile('native', 'new_note.txt', 'file content');
    } catch (error) {
      console.log('downloadFileFromOPFS error', error);
    }
  };

  const createFileInOPFS = async () => {
    try {
      const now = new Date().toISOString();
      await fsManager.writeFile('opfs', `${now}.txt`, 'document content', {
        create: true,
      });
    } catch (error) {
      console.log('createFile error', error);
    }
  };

  const uploadFileToOPFS = async () => {
    try {
      const file = await fsManager.selectFilePicker();
      await fsManager.writeFile('opfs', file.name, file, { create: true });
    } catch (error) {
      console.log('uploadFile handle error', error);
    }
  };

  const deleteFile = async () => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;
    await fsManager.deleteFile(fileName);
  };

  const readFile = async () => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;
    const content = await fsManager.readFile(fileName);
    console.log('content', content);
  };

  const getListFiles = async () => {
    try {
      await fsManager.selectDirectoryPicker();
      const files = await fsManager.getListFiles('native');
      console.log('files', files);
    } catch (error) {
      console.log('getListFiles error', error);
    }
  };

  return (
    <div>
      <Grid container>
        {/* <ButtonGroup> */}
        <Button variant='contained' color='primary' onClick={createFileInOPFS}>
          Create File in OPFS
        </Button>
        <Button variant='contained' color='primary' onClick={uploadFileToOPFS}>
          Upload File to OPFS
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={createAndDownloadFromOPFS}
        >
          Create and download from OPFS
        </Button>
        <Button variant='contained' color='primary' onClick={readFile}>
          Read file
        </Button>
        <Button variant='contained' color='secondary' onClick={deleteFile}>
          Delete File
        </Button>

        <Button variant='contained' color='primary' onClick={getListFiles}>
          getListFiles
        </Button>

        {/* </ButtonGroup> */}
      </Grid>
    </div>
  );
};

export default FileSystemAPIUsage;
