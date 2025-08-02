import FileSystemStorage from './file_system_storage';

class FileSystemManager {
  #opfs;
  #nativeRoot;

  constructor() {
    this.#opfs = new FileSystemStorage();
  }

  async writeFile(source, path, data, options) {
    try {
      if (source === 'opfs') {
        return this.#opfs.writeFile(path, data, options);
      }
      if (source === 'native') {
        if (!this.#nativeRoot) {
          throw new Error('Native root not found', {
            cause: 'Native root not found',
          });
        }
        const handle = await this.#nativeRoot.getFileHandle(path, {
          create: true,
        });
        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();
        return;
      }

      throw new Error('SourceTarget', {
        cause: 'Source target not provided',
      });
    } catch (error) {
      console.log('writeFile error', error);
    }
  }

  async readFile(path) {
    try {
      return await this.#opfs.readFile(path);
    } catch (error) {
      console.log('Error in error readFile', error);
    }
  }

  async deleteFile(path) {
    return await this.#opfs.deleteFile(path);
  }

  async selectDirectoryPicker() {
    try {
      this.#nativeRoot = await window.showDirectoryPicker();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('AbortError', {
          cause: 'User cancelled the operation',
        });
      }
    }
  }

  async selectFilePicker() {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      const file = await fileHandle.getFile();
      return file;
    } catch (error) {
      console.log('selectFilePicker error', error);
    }
  }

  async getListFiles(source) {
    if (source === 'opfs') {
      return this.#opfs.listFiles();
    }
    if (source === 'native') {
      if (!this.#nativeRoot) throw new Error('Native FS not initialized');
      const result = [];
      for await (const [name, handle] of this.#nativeRoot.entries()) {
        const fullPath = name;
        if (handle.kind === 'file') {
          result.push({
            name: fullPath,
            kind: 'file',
          });
        } else if (handle.kind === 'directory') {
          result.push({
            name: fullPath,
            kind: 'directory',
          });
        }
      }
      return result;
    }
    throw new Error('SourceTarget', {
      cause: 'Source target not provided',
    });
  }
}

export default FileSystemManager;
