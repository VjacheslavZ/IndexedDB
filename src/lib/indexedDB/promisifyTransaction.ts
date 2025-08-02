class PromisifyTransaction {
  #store: IDBObjectStore;

  constructor(store: IDBObjectStore) {
    this.#store = store;
  }

  promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  get<T = any>(key: IDBValidKey): Promise<T> {
    return this.promisifyRequest(this.#store.get(key));
  }

  getAll<T = any>(query?: IDBKeyRange | null): Promise<T[]> {
    return this.promisifyRequest(this.#store.getAll(query));
  }

  put<T = any>(value: T, key?: IDBValidKey): Promise<IDBValidKey | undefined> {
    return this.promisifyRequest(this.#store.put(value, key));
  }

  add<T = any>(value: T, key?: IDBValidKey): Promise<IDBValidKey | undefined> {
    return this.promisifyRequest(this.#store.add(value, key));
  }

  delete(key: IDBValidKey): Promise<void> {
    return this.promisifyRequest(this.#store.delete(key));
  }
}

export default PromisifyTransaction;
