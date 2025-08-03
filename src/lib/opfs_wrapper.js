import opfsErrorsHandler from './opfs_errors_handler';

export default class FileSystemStorage {
  #rootDir = null;

  constructor() {
    this.init();
  }

  async init() {
    this.#rootDir = await navigator.storage.getDirectory();
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
      opfsErrorsHandler(error, 'write');
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

  async deleteFile(fileName) {
    try {
      await this.#rootDir.removeEntry(fileName);
    } catch (error) {
      opfsErrorsHandler(error, 'readwrite', fileName);
    }
  }

  async createDirectory(path) {
    try {
      await this.#rootDir.getDirectoryHandle(path, { create: true });
    } catch (error) {
      opfsErrorsHandler(error, 'readwrite', path);
    }
  }

  async listFiles(path = '') {
    try {
      const files = [];
      for await (const [name, handle] of this.#rootDir.entries()) {
        const fullPath = `${path}${name}`;
        if (handle.kind === 'file') {
          files.push({
            name: fullPath,
            kind: 'file',
          });
        } else if (handle.kind === 'directory') {
          files.push({
            name: fullPath,
            kind: 'directory',
          });
          await this.listFiles(fullPath);
        }
      }

      return files;
    } catch (error) {
      opfsErrorsHandler(error, 'read', path);
    }
  }
}
