export class Logger {
  #output = {
    textContent: '',
  };

  constructor(outputId) {
    // this.#output = document.getElementById(outputId);
  }

  log(...args) {
    const lines = args.map(Logger.#serialize);
    this.#output.textContent += lines.join(' ') + '\n';
    // console.log(this.#output.textContent);
    // this.#output.scrollTop = this.#output.scrollHeight;
  }

  get output() {
    return this.#output;
  }

  static #serialize(x) {
    return typeof x === 'object' ? JSON.stringify(x, null, 2) : x;
  }
}

// export const logger = new Logger('output');

export const _db = await new Promise((resolve, reject) => {
  const request = indexedDB.open('Example', 1);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains('user')) {
      db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
// ------------------------------------------------------------

export class IndexDB {
  #db = null;
  #dbName = null;
  #version = null;

  constructor(dbName, version) {
    this.#dbName = dbName;
    this.#version = version;
  }

  async init(storeName) {
    this.#db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.#dbName, this.#version);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, {
            keyPath: 'id',
            autoIncrement: true,
          });
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
      tx.oncomplete = () => resolve(addRequest.result);
      tx.onerror = () => reject(tx.error);
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
        if (!result) return;
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
