export class IndexDB {
  #db = null;
  #dbName = null;
  #version = null;
  #stores = null;

  constructor(options) {
    this.#dbName = options.name;
    this.#version = options.version;
    this.#stores = options.stores;
  }

  async init() {
    this.#db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.#dbName, this.#version);
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const [storeName, { keyPath, autoIncrement }] of Object.entries(
          this.#stores
        )) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, {
              keyPath,
              autoIncrement,
            });
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(storeName, 'readwrite');
      const addRequest = tx.objectStore(storeName).add(data);
      addRequest.oncomplete = () => resolve(addRequest.result);
      addRequest.onerror = () => reject(tx.error);
    });
  }

  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(storeName, 'readonly');
      const getRequest = tx.objectStore(storeName).get(key);
      tx.oncomplete = () => resolve(getRequest.result);
      tx.onerror = () => reject(getRequest.error);
    });
  }

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(storeName, 'readonly');
      const getAllRequest = tx.objectStore(storeName).getAll();
      tx.oncomplete = () => resolve(getAllRequest.result);
      tx.onerror = () => reject(getAllRequest.error);
    });
  }

  async put(storeName, key, data) {
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const getRequest = store.get(key);
      getRequest.onsuccess = () => {
        const { result } = getRequest;
        if (!result) {
          reject(new Error(`Key "${key}" not found in "${storeName}"`));
          return;
        }
        const updated = Object.assign(result, data);
        store.put(updated);
        tx.oncomplete = () => resolve(result);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const deleteRequest = this.#db
        .transaction(storeName, 'readwrite')
        .objectStore(storeName)
        .delete(key);

      deleteRequest.onsuccess = () => resolve(true);
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }

  async openCursor(storeName, callback) {
    return new Promise((resolve, reject) => {
      const cursorRequest = this.#db
        .transaction(storeName, 'readonly')
        .objectStore(storeName)
        .openCursor();

      const results = [];
      cursorRequest.onsuccess = event => {
        const cursor = event.target.result;
        if (!cursor) return resolve(results);
        const result = callback(cursor.value);
        if (result) results.push(result);
        cursor.continue();
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
    });
  }
}
