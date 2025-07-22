// TODO add error aggregation and escalation
export default class FileSystemStorage {
  #rootDir = null;

  constructor() {
    this.init();
  }

  async init() {
    this.#rootDir = await navigator.storage.getDirectory();
  }

  async getListFiles(path = '') {
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
        await this.getListFiles(fullPath);
      }
    }
    return files;
  }

  async createFile(file) {
    try {
      const handle = await this.#rootDir.getFileHandle(file.name, {
        create: true,
      });
      const contents = await file.arrayBuffer();
      const writable = await handle.createWritable();
      await writable.write(new Uint8Array(contents));
      await writable.close();
    } catch (error) {
      console.log('Create file failed ---- ', error);
      if (error.name === 'QuotaExceededError') {
        throw new Error('QuotaExceededError', {
          cause: 'The user has reached their storage quota',
        });
      }
    }
  }

  async readFile(fileName) {
    try {
      const handleFile = await this.#rootDir.getFileHandle(fileName);
      const file = await handleFile.getFile();
      const content = await file.text();
      //   TODO add selection of handle file like .text(), .arrayBuffer(), .stream()
      //   const buffer = await file.arrayBuffer();
      //   const stream = file.stream();
      //   const reader = stream.getReader();
      return content;
    } catch (error) {
      console.log('Read failed', error);
    }
  }

  async deleteFile(fileName) {
    try {
      console.log('deleteFile', fileName);
      await this.#rootDir.removeEntry(fileName);
    } catch (error) {
      console.log('Delete failed', error);
    }
  }
}
