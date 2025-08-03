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
  #opfs;
  #nativeRoot;

  constructor() {
    this.#opfs = new FileSystemStorage();
    this.#nativeRoot = new FileSystemStorage(true);
  }

  async writeFile(source, path, data, options) {
    if (source === 'opfs') {
      return this.#opfs.writeFile(path, data, options);
    }
    if (source === 'native') {
      return this.#nativeRoot.writeFile(path, data, options);
    }

    sourceNotProvidedError();
  }

  async getListFiles(source) {
    if (source === 'opfs') {
      return this.#opfs.listFiles();
    }
    if (source === 'native') {
      return this.#nativeRoot.listFiles();
    }

    sourceNotProvidedError();
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
        throw new Error('User cancelled the operation', { cause: error });
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
}

export default FileSystemManager;
