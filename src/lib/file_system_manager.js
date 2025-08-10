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

  async writeFile(path, data, options) {
    return this.#rootDir.writeFile(path, data, options);
  }

  async createDirectory(path) {
    return this.#rootDir.createDirectory(path);
  }

  async getListFiles() {
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

  async deleteFile(path) {
    return this.#rootDir.deleteFile(path);
  }
}

export default FileSystemManager;
