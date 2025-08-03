import opfsErrorsHandler from './opfs_errors_handler';

export default class FileSystemStorage {
  #rootDir = null;
  #isUseNativeDir = null;

  constructor(isUseNativeDir = false) {
    this.#isUseNativeDir = isUseNativeDir;
    this.init(isUseNativeDir);
  }

  async init(isUseNativeDir) {
    this.#rootDir = isUseNativeDir
      ? null
      : await navigator.storage.getDirectory();
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

  async listFiles() {
    try {
      await this.initNativeRoot();

      const files = [];
      for await (const [name, handle] of this.#rootDir.entries()) {
        const fullPath = `${name}`;

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
        }
      }

      return files;
    } catch (error) {
      opfsErrorsHandler(error, 'read');
    }
  }
}
