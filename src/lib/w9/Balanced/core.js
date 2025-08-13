import SchemaValidate from './schema_validate.js';
import { getRange } from './utils.js';

class Repository {
  constructor(schemas) {
    this.validate = new SchemaValidate(schemas);
  }

  insert({ store, record }) {
    this.validate.validate({ store, record });
    return this.exec(store, objectStore => objectStore.add(record));
  }

  update({ store, record }) {
    this.validate.validate({ store, record });
    return this.exec(store, objectStore => objectStore.put(record));
  }

  delete({ store, id }) {
    return this.exec(store, objectStore => objectStore.delete(id));
  }

  get({ store, id }) {
    const op = objectStore => {
      const req = objectStore.get(id);
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error(`Can't get ${id}`));
      });
    };
    return this.exec(store, op, 'readonly');
  }

  async openCursor({
    store,
    where = [],
    indexName,
    direction = 'next',
    offset = 0,
    limit = 0,
  }) {
    const op = objectStore => {
      let skipped = 0;
      let count = 0;

      const source = indexName ? objectStore.index(indexName) : objectStore;
      const cursorRequest = source.openCursor(getRange(where), direction);

      const results = [];

      return new Promise((resolve, reject) => {
        cursorRequest.onsuccess = e => {
          const cursor = e.target.result;
          if (!cursor) return resolve(results);
          if (skipped < offset) {
            skipped++;
            cursor.continue();
            return;
          }
          if (count < limit) {
            count++;
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        cursorRequest.onerror = () => reject(cursorRequest.error);
      });
    };
    return this.exec(store, op, 'readonly');
  }
}

export default Repository;
