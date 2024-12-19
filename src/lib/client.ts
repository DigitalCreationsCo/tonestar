export class DBClient {

  private constructor() {}
  
  // IndexedDB setup
  private initDB = (): Promise<IDBDatabase> => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.INDEXEDDB_NAME, this.CACHE_VERSION);
      
      request.onerror = () => reject(request.error);
      
      request.onupgradeneeded = (event) => {
        const db = (event?.target as any)?.result;
        
        if (!db.objectStoreNames.contains(this.SONGS_STORE)) {
          db.createObjectStore(this.SONGS_STORE, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(this.SAMPLES_STORE)) {
          db.createObjectStore(this.SAMPLES_STORE);
        }
      };
      
      request.onsuccess = () => resolve(request.result);
    })
  };

  async getInstance() {
    if (!DBWrapper.instance) {
      try {
        DBWrapper.instance = await this.initDB()
      } catch (error: any) {
        console.debug(`Error occurred initializing db: ${error.message}`);
        throw new Error(`Error occurred initializing db: ${error.message}`);
      }
    }
    return DBWrapper; // Return the instance whether it's newly created or already exists
  }

}