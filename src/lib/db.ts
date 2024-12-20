const INDEXEDDB_NAME = 'TonestarDB';
const CACHE_VERSION = 1;

export class IndexedDB {
  protected db: IDBDatabase | null = null;
  private storeNames: Record<string, string>
  
  protected constructor(storeNames: Record<string, string>) {
    this.storeNames = storeNames
  }

  protected static async initDb (storeNames: Record<string, string>): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(INDEXEDDB_NAME, CACHE_VERSION);
      
      request.onerror = () => reject(request.error);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        Object.values(storeNames).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = () => resolve(request.result);
    })
  };

  protected async ensureDbConnection(): Promise<void> {
    if (!this.db) {
      this.db = await IndexedDB.initDb(this.storeNames);
    }
  }

  async getInstance(storeNames: Record<string, string>): Promise<IndexedDB> {
    if (!this.db) {
      this.db = await IndexedDB.initDb(storeNames)
    }
    try {
      // await new IndexedDB(storeNames).initDb(storeNames)
      return this
    } catch (error: any) {
      console.debug(`Error occurred initializing IndexedDB: ${error.message}`);
      throw new Error(`Error occurred initializing IndexedDB: ${error.message}`);
    }
  }
  
  async write<T>(storeName: string, data: { id: string }& T): Promise<string> {
    await this.ensureDbConnection();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(this.storeNames[storeName], 'readwrite');
        const store = transaction.objectStore(this.storeNames[storeName]);
        
        const id = data.id || Date.now().toString()
        const dataToStore = {
          ...data,
          id,
        }
        const request = store.put(dataToStore);

        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(request.error);
      } catch (error: any) {
        console.error('Error saving to IndexedDB:', error);
        reject(error)
      }
   });
  }

  async readById<T>(storeName: string, field: Record<"id", string>): Promise<T | null> {
    await this.ensureDbConnection();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(this.storeNames[storeName], 'readonly');
        const store = transaction.objectStore(this.storeNames[storeName]);
        const cached = store.get(field.id)
        console.debug(`read cache `, cached)

        cached.onsuccess = () => resolve(cached.result);
        cached.onerror = () => reject(cached.error);
      } catch (error: any) {
        console.error('Error reading from IndexedDB:', error);
        reject(error)
      }
    });
  }
}

