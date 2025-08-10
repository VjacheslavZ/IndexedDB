import opfsErrorsHandler from './opfs_errors_handler';

export default class FileSystemStorage {
  #isUseNativeDir = null;
  #rootDir = navigator.storage.getDirectory();

  constructor(isUseNativeDir = false) {
    this.#isUseNativeDir = isUseNativeDir;
    this.init(isUseNativeDir);
  }

  async init(isUseNativeDir) {
    this.#rootDir = await navigator.storage.getDirectory();
  }

  async initNativeRoot() {
    if (this.#isUseNativeDir) {
      this.#rootDir = await window.showDirectoryPicker();
    }
  }

  async writeFile(path, file, options = { create: false }) {
    try {
      const handle = await this.#rootDir.getFileHandle(path, {
        create: options.create,
      });
      const writable = await handle.createWritable();
      await writable.write(file);
      await writable.close();
    } catch (error) {
      opfsErrorsHandler(error, 'write', path);
    }
  }

  async readFile(fileName) {
    try {
      const handleFile = await this.#rootDir.getFileHandle(fileName);
      const file = await handleFile.getFile();
      const content = await file.text();
      return content;
    } catch (error) {
      opfsErrorsHandler(error, 'read', fileName);
    }
  }

  async renameFile(filePath, newFileName) {
    try {
      const { dirHandle, fileName: oldFileName } =
        await this.getDirHandleFromPath(this.#rootDir, filePath);

      const fileHandle = await dirHandle.getFileHandle(oldFileName);
      await fileHandle.move(newFileName);
    } catch (error) {
      opfsErrorsHandler(error, 'rename', filePath.replace('/', ''));
    }
  }

  // async renameFolder(oldFolderName, newFolderName) {
  //   try {
  //     const oldFolderHandle = await this.#rootDir.getDirectoryHandle(
  //       oldFolderName
  //     );

  //     // Rename the folder
  //     await oldFolderHandle.move(newFolderName);

  //     console.log(`Folder "${oldFolderName}" renamed to "${newFolderName}".`);
  //   } catch (error) {
  //     console.error('Error renaming folder:', error);
  //   }
  // }

  async getDirHandleFromPath(rootHandle, fullPath) {
    const parts = fullPath.replace(/^\/+|\/+$/g, '').split('/');
    const fileName = parts.pop();
    let currentHandle = rootHandle;

    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part);
    }

    return { dirHandle: currentHandle, fileName };
  }

  async deleteFile(file) {
    try {
      const { dirHandle, fileName } = await this.getDirHandleFromPath(
        this.#rootDir,
        file
      );
      await dirHandle.removeEntry(fileName);
    } catch (error) {
      opfsErrorsHandler(error, 'readwrite', file);
    }
  }

  async createDirectory(path) {
    try {
      await this.#rootDir.getDirectoryHandle(path, { create: true });
    } catch (error) {
      opfsErrorsHandler(error, 'readwrite', path);
    }
  }

  async listFiles(dirHandle = this.#rootDir, path = '') {
    try {
      const files = [];

      for await (const [name, handle] of dirHandle.entries()) {
        const fullPath = `${path}/${name}`;

        if (handle.kind === 'file') {
          files.push({
            id: fullPath,
            name: name,
            path: fullPath,
            type: 'file',
          });
        } else if (handle.kind === 'directory') {
          files.push({
            id: fullPath,
            name: name,
            path: fullPath,
            type: 'folder',
            children: await this.listFiles(handle, fullPath),
          });
        }
      }

      return files;
    } catch (error) {
      console.log('listFiles error', error);
      opfsErrorsHandler(error, 'read');
    }
  }
}
