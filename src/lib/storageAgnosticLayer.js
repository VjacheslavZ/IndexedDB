import { Database } from './w9/Balanced/storage';
import IndexedDBRepository from './w9/Balanced/core';
import FileSystemManager from './file_system_manager';

const schemas = {
  user: {
    id: { type: 'int', primary: true },
    name: { type: 'str' },
    age: { type: 'int', index: true },
  },
};

class StorageAgnosticLayer {
  constructor(repository) {
    this.repository = repository;
  }

  async create({ store, record, options = {} }) {
    return await this.repository.create({ store, record, options });
  }

  async read(where = {}) {
    return this.repository.select(where);
  }
  async update({ store, record, options = {} }) {
    this.repository.update({ store, record, options });
  }
  async delete(store) {
    this.repository.delete(store);
  }
}

export default StorageAgnosticLayer;

// Usage indexedDB
const indexedDB = await new Database('balanced', { version: 1, schemas });
const userRepository = new IndexedDBRepository(indexedDB, schemas);
export const indexedDBuserServiceAgnosticLayer = await new StorageAgnosticLayer(
  userRepository
);
// Usage OPFS
const fsManager = new FileSystemManager();
export const opfsUserServiceAgnosticLayer = await new StorageAgnosticLayer(
  fsManager
);
