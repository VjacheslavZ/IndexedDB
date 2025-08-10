import opfsErrorsHandler from './opfs_errors_handler';

export default class FileSystemStorage {
  #rootDir = navigator.storage.getDirectory();
  #isUseNativeDir = null;

  constructor(isUseNativeDir = false) {
    this.#isUseNativeDir = isUseNativeDir;
    this.init(isUseNativeDir);
  }

  async init(isUseNativeDir) {
    // this.#rootDir = isUseNativeDir
    //   ? null
    //   : await navigator.storage.getDirectory();
    this.#rootDir = await navigator.storage.getDirectory();
  }

  async initNativeRoot() {
    if (this.#isUseNativeDir) {
      this.#rootDir = await window.showDirectoryPicker();
    }
  }

  async writeFile(path, file, options = { create: false }) {
    try {
      await this.initNativeRoot();

      const handle = await this.#rootDir.getFileHandle(path, {
        create: options.create,
      });
      const writable = await handle.createWritable();
      await writable.write(file);
      await writable.close();
    } catch (error) {
      opfsErrorsHandler(error, 'write');
    }
  }

  async readFile(fileName) {
    try {
      if (this.#isUseNativeDir) {
        const [fileHandle] = await window.showOpenFilePicker();
        const file = await fileHandle.getFile();
        const content = await file.text();
        return content;
      }

      const handleFile = await this.#rootDir.getFileHandle(fileName);
      const file = await handleFile.getFile();
      const content = await file.text();
      return content;
    } catch (error) {
      opfsErrorsHandler(error, 'read', fileName);
    }
  }

  async getDirHandleFromPath(rootHandle, fullPath) {
    // Remove leading/trailing slashes, then split
    const parts = fullPath.replace(/^\/+|\/+$/g, '').split('/');
    const fileName = parts.pop(); // Last part is the file
    let currentHandle = rootHandle;

    // Navigate to the target directory
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
        console.log('name', name);
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
            children: await this.listFiles(handle, fullPath), // Pass the subdirectory handle
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
