export type TTransactionMode = 'readonly' | 'readwrite';
export interface IQueTransaction {
  mode: TTransactionMode;
  storesNames: string[];
  resolve: (tx: IDBTransaction) => void;
  reject: (error: unknown) => void;
}
// TODO
// handle queue for different stores based on transaction mode
class TransactionQueue {
  #db: IDBDatabase;

  queue: IQueTransaction[] = [];
  #isActiveReadWriteMode = false;
  #isPending = false;

  constructor(db: IDBDatabase) {
    this.#db = db;
  }

  async handleQueue() {
    console.log('handleQueue', {
      isPending: this.#isPending,
      queueLength: this.queue.length,
      isActiveReadWriteMode: this.#isActiveReadWriteMode,
    });
    if (this.#isPending || this.queue.length === 0) return;

    const next = this.queue[0];

    if (this.#isActiveReadWriteMode && next?.mode === 'readonly') {
      return;
    }

    this.queue.shift();
    this.#isPending = true;

    try {
      await new Promise(res => {
        let lockMs = 0;
        if (next.mode === 'readwrite') lockMs = 1000 * 10;

        setTimeout(() => res(true), lockMs);
      });

      const tx = this.#db.transaction(next.storesNames, next.mode);
      tx.addEventListener('complete', (e: Event) => {
        const { target, timeStamp } = e;
        console.log('timeStamp', timeStamp);
        console.log('target', (target as IDBTransaction)?.mode);
      });

      if (next.mode === 'readwrite') this.#isActiveReadWriteMode = true;

      const oncomplete = () => {
        if (next.mode === 'readwrite') this.#isActiveReadWriteMode = false;
        this.#isPending = false;
        this.handleQueue();
      };

      tx.oncomplete = oncomplete;
      // tx.onabort = oncomplete;
      tx.onerror = () => {
        next.reject(tx.error);
        this.#isPending = false;
        this.handleQueue();
      };

      next.resolve(tx);
    } catch (error) {
      next.reject(error);
      this.#isPending = false;
      this.handleQueue();
    }
  }
}

export default TransactionQueue;
