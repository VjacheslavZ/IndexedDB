import { FC } from 'react';
import { FileTree } from '../FilesThree';

import FileSystemManager from '../../lib/file_system_manager';

const fsManager = new FileSystemManager(true);

const FileSystemDemo: FC = () => {
  return (
    <div>
      <FileTree title='FileSystemDemo' fsManager={fsManager} useNativeSystem />
    </div>
  );
};

export default FileSystemDemo;
