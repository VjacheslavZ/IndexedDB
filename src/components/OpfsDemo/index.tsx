import { FC } from 'react';
import { FileTree } from '../FilesThree';
import FileSystemManager from '../../lib/file_system_manager';

const fsManager = new FileSystemManager();

const OpfsDemo: FC = () => {
  return (
    <div>
      <FileTree title='OpfsDemo' fsManager={fsManager} />
    </div>
  );
};

export default OpfsDemo;
