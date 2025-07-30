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
        throw new Error('The user has reached their storage quota', {
          cause: error,
        });
      }

      if (error.name === 'NotAllowedError') {
        throw new Error(
          'The permission for the handle is not granted in readwrite mode.',
          {
            cause: error,
          }
        );
      }

      if (error.name === 'NotFoundError') {
        throw new Error(
          'Current entry is not found or the file is not found.',
          {
            cause: error,
          }
        );
      }

      if (error.name === 'NoModificationAllowedError') {
        throw new Error(
          'The browser is not able to acquire a lock on the file associated with the file handle.',
          {
            cause: error,
          }
        );
      }

      if (error.name === 'AbortError') {
        throw new Error(
          'Implementation of defined malware scans and safe-browsing checks fails.',
          {
            cause: error,
          }
        );
      }

      throw new Error(
        'Unexpected error in file system storage method: writeFile',
        {
          cause: error,
        }
      );
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
        throw new Error(`The current entry: '${fileName}' is not found.`, {
          cause: error,
        });
      }

      if (error.name === 'NotAllowedError') {
        throw new Error('The permission is not granted in read mode.', {
          cause: error,
        });
      }

      throw new Error(
        'Unexpected error in file system storage method: readFile',
        {
          cause: error,
        }
      );
    }
  }

  async deleteFile(fileName) {
    try {
      await this.#rootDir.removeEntry(fileName);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw new Error(
          `The current entry is not found or the file: '${fileName}' is not found or matched.`,
          {
            cause: error,
          }
        );
      }

      if (error.name === 'TypeError') {
        throw new Error(
          'The name is not a valid or contains characters not allowed on the file system.',
          {
            cause: error,
          }
        );
      }

      if (error.name === 'NotAllowedError') {
        throw new Error(
          'The permission for the handle is not granted in readwrite mode.',
          {
            cause: error,
          }
        );
      }

      if (error.name === 'InvalidModificationError') {
        throw new Error(
          'Recursive is set to false and the entry to be removed has children.',
          {
            cause: error,
          }
        );
      }

      throw new Error(
        'Unexpected error in file system storage method: deleteFile',
        {
          cause: error,
        }
      );
    }
  }

  async createDirectory(path) {
    try {
      await this.#rootDir.getDirectoryHandle(path, { create: true });
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        throw new Error(
          'The permission for the handle is not granted in readwrite mode.',
          {
            cause: error,
          }
        );
      }

      if (error.name === 'TypeError') {
        throw new Error(
          'The name specified is not a valid string or contains characters that would interfere with the native file system.',
          {
            cause: error,
          }
        );
      }

      if (error.name === 'TypeMismatchError') {
        throw new Error('The returned entry is a file and not a directory.', {
          cause: error,
        });
      }

      if (error.name === 'NotFoundError') {
        throw new Error('The current entry is not found.', {
          cause: error,
        });
      }
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
      if (error.name === 'NotAllowedError') {
        throw new Error(
          'The permission for the handle is not granted in read mode.',
          {
            cause: error,
          }
        );
      }

      if (error.name === 'NotFoundError') {
        throw new Error('The current entry is not found.', {
          cause: error,
        });
      }

      throw new Error(
        'Unexpected error in file system storage method: listFiles',
        {
          cause: error,
        }
      );
    }
  }
}
