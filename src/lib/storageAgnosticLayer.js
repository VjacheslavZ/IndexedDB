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
  constructor(repository, storeType) {
    this.repository = repository;
    this.storeType = storeType;
  }

  async create({ store, record, options = {} }) {
    if (this.storeType === 'indexedDb') {
      return await this.repository.create({ store, record });
    }
    if (this.storeType === 'opfs') {
      return await this.repository.create(store, record, options);
    }
  }

  async read({ store, indexName = '', where = [], direction } = {}) {
    return this.repository.select({ store, indexName, where, direction });
  }
  async update() {}
  async delete() {}
}

export default StorageAgnosticLayer;

// Usage
const indexedDB = await new Database('balanced', { version: 1, schemas });
const userRepository = new IndexedDBRepository(indexedDB, schemas);
export const indexedDBuserServiceAgnosticLayer = await new StorageAgnosticLayer(
  userRepository,
  'indexedDb'
);
// await indexedDBuserServiceAgnosticLayer.create({
//   store: 'user',
//   record: { name, age },
// });

const fsManager = new FileSystemManager();
export const opfsUserServiceAgnosticLayer = await new StorageAgnosticLayer(
  fsManager,
  'opfs'
);
// const name = prompt('Enter user name:');
// const age = parseInt(prompt('Enter user age:') ?? '0', 10);
// await opfsUserServiceAgnosticLayer.create({
//   store: `user_${name}_${age}.txt`,
//   record: JSON.stringify({ name, age }),
//   options: {
//     create: true,
//   },
// });
