import TransactionQueue, { TTransactionMode } from './queue';

type TStore = Record<string, { keyPath: string; autoIncrement: boolean }>;

export class IndexedDB {
  #db!: IDBDatabase;
  #dbName: string;
  #version: number;
  #stores: TStore;

  #isUseTransactionQueue = false;
  #transactionQueue: TransactionQueue | null = null;

  constructor(options: {
    name: string;
    version: number;
    stores: TStore;
    isUseTransactionQueue: boolean;
  }) {
    this.#dbName = options.name;
    this.#version = options.version;
    this.#stores = options.stores;
    this.#isUseTransactionQueue = Boolean(options.isUseTransactionQueue);

    this.init().then(() => {
      if (this.#isUseTransactionQueue) {
        this.#transactionQueue = new TransactionQueue(this.#db);
      }
    });
  }

  async init() {
    this.#db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.#dbName, this.#version);
      request.onupgradeneeded = () => {
        const db = request.result;
        const stores = Object.entries(this.#stores);
        for (const [storeName, { keyPath, autoIncrement }] of stores) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath, autoIncrement });
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async createTransaction(
    storesNames: string[],
    mode: TTransactionMode
  ): Promise<IDBTransaction> {
    if (this.#isUseTransactionQueue && this.#transactionQueue) {
      return new Promise((resolve, reject) => {
        this.#transactionQueue!.queue.push({
          storesNames,
          mode,
          resolve,
          reject,
        });
        this.#transactionQueue!.handleQueue();
      });
    }

    return new Promise(resolve => {
      const tx = this.#db.transaction(storesNames, mode);
      resolve(tx);
    });
  }

  async add(storeName: string, data: unknown) {
    return new Promise(async (resolve, reject) => {
      const tx = await this.createTransaction([storeName], 'readwrite');
      const addRequest = tx.objectStore(storeName).add(data);
      addRequest.onsuccess = () => resolve(addRequest.result);
      addRequest.onerror = () => reject(tx.error);
    });
  }

  async get(storeName: string, key: IDBValidKey) {
    return new Promise(async (resolve, reject) => {
      const tx = await this.createTransaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const getRequest = store.get(key);
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getAll(storeName: string) {
    return new Promise(async (resolve, reject) => {
      const tx = await this.createTransaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    });
  }

  async put(storeName: string, key: IDBValidKey, data: unknown) {
    return new Promise(async (resolve, reject) => {
      const tx = await this.createTransaction([storeName], 'readwrite');
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

  async delete(storeName: string, key: IDBValidKey) {
    return new Promise(async (resolve, reject) => {
      const tx = await this.createTransaction([storeName], 'readwrite');
      const deleteRequest = tx.objectStore(storeName).delete(key);
      deleteRequest.onsuccess = () => resolve(true);
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }

  async openCursor(storeName: string, callback: (value: unknown) => unknown) {
    return new Promise(async (resolve, reject) => {
      const tx = await this.createTransaction([storeName], 'readonly');
      const cursorRequest = tx.objectStore(storeName).openCursor();

      const results: unknown[] = [];
      cursorRequest.onsuccess = (event: Event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) return resolve(results);
        const result = callback(cursor.value);
        if (result) results.push(result);
        cursor.continue();
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
    });
  }
}
