// TODO add error aggregation and escalation
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
      if (error.name === 'QuotaExceededError') {
        throw new Error('QuotaExceededError', {
          cause: 'The user has reached their storage quota',
        });
      }

      throw new Error('Error in FileSystemStorage.writeFile', {
        cause: error.cause,
      });
    }
  }

  async readFile(fileName) {
    try {
      const handleFile = await this.#rootDir.getFileHandle(fileName);
      const file = await handleFile.getFile();
      const content = await file.text();
      return content;
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw new Error('NotFoundError', {
          cause: `File '${fileName}' not found`,
        });
      }
      throw new Error('Error in FileSystemStorage.readFile', {
        cause: error.cause,
      });
    }
  }

  async deleteFile(fileName) {
    try {
      await this.#rootDir.removeEntry(fileName);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw new Error('NotFoundError', {
          cause: `File '${fileName}' not found`,
        });
      }
      throw new Error('Error in FileSystemStorage.deleteFile', {
        cause: error.cause,
      });
    }
  }

  async listFiles(path = '') {
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
  }
}
