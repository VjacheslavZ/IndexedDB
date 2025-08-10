import FileSystemStorage from './opfs_wrapper';

const sourceNotProvidedError = () => {
  throw new Error(
    'Argument "source"  is not provided pass "opfs" or "native" as a first argument',
    {
      cause: 'Source target not provided',
    }
  );
};

class FileSystemManager {
  #rootDir;

  constructor(isUseNativeDir) {
    this.#rootDir = new FileSystemStorage(isUseNativeDir);
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

  async showDirectoryPicker() {
    try {
      await this.#rootDir.initNativeRoot(true);
    } catch (error) {
      console.log('showDirectoryPicker error', error);
    }
  }

  async writeFile(source, path, data, options) {
    if (source === 'opfs') {
      return this.#rootDir.writeFile(path, data, options);
    }
    if (source === 'native') {
      return this.#rootDir.writeFile(path, data, options);
    }

    sourceNotProvidedError();
  }

  async getListFiles() {
    return this.#rootDir.listFiles();
  }

  async readFile(source, path) {
    try {
      if (source === 'opfs') {
        return await this.#rootDir.readFile(path);
      }
      if (source === 'native') {
        return await this.#rootDir.readFile(path);
      }

      sourceNotProvidedError();
    } catch (error) {
      console.log('Error in error readFile', error);
    }
  }

  async deleteFile(path) {
    // return await this.#opfs.deleteFile(path);
    // return await this.#nativeRoot.removeEntry(path);
    return this.#rootDir.deleteFile(path);
  }
}

export default FileSystemManager;
