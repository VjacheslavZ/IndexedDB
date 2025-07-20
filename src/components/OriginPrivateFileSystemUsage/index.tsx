import { FC, useEffect, useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FileIcon from '@mui/icons-material/InsertDriveFile';

import FileSystemStorage from '../../lib/file_system_storage';

const fs = new FileSystemStorage();
const OriginPrivateFileSystemUsage: FC = () => {
  const [files, setFiles] = useState<{ name: string; kind: string }[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        await fs.init();
        const files = await fs.getListFiles();
        setFiles(files);
      } catch (error) {
        console.log('Init failed', error);
      }
    };
    init();
  }, []);

  return (
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
  );
};

export default OriginPrivateFileSystemUsage;
