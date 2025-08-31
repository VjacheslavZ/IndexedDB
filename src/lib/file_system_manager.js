import FileSystemStorage from './opfs_wrapper';

class FileSystemManager {
  #rootDir;

  constructor(isUseNativeDir) {
    this.#rootDir = new FileSystemStorage(isUseNativeDir);
  }

  async showDirectoryPicker() {
    try {
      await this.#rootDir.initNativeRoot(true);
    } catch (error) {
      console.log('showDirectoryPicker error', error);
    }
  }

  async create({ store, record, options }) {
    return this.#rootDir.writeFile(store, record, options);
  }

  async update(params) {
    return this.create(params);
  }

  async createDirectory(path) {
    return this.#rootDir.createDirectory(path);
  }

  async select(where = {}) {
    try {
      return await this.#rootDir.listFiles();
    } catch (error) {
      console.log('getListFiles error', error);
    }
  }

  async readFile(path) {
    try {
      return await this.#rootDir.readFile(path);
    } catch (error) {
      console.log('Error in error readFile', error);
    }
  }

  async delete(path) {
    return this.#rootDir.deleteFile(path);
  }

  async renameFile(oldPath, newPath) {
    return this.#rootDir.renameFile(oldPath, newPath);
  }
}

export default FileSystemManager;
