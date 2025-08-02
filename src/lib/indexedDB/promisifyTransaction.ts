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

  openCursor<T = any>(
    query: IDBKeyRange | null = null,
    direction: IDBCursorDirection = 'next',
    indexName?: string
  ): Promise<T[]> {
    const source = indexName ? this.#store.index(indexName) : this.#store;
    const cursorRequest = source.openCursor(query, direction);
    const results: T[] = [];
    return new Promise((resolve, reject) => {
      cursorRequest.onsuccess = (e: Event) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;

        if (!cursor) return resolve(results);
        results.push(cursor.value);
        cursor.continue();
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
    });
  }
}

export default PromisifyTransaction;
