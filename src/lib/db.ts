const INDEXEDDB_NAME = 'TonestarDB';
const CACHE_VERSION = 1;
const SAMPLES_STORE = 'samples'; 
const SONGS_STORE = 'songs';

export class IndexedDB {
  protected static db: IDBDatabase | null = null;
  
  constructor() {}

  static async getInstance(): Promise<IndexedDB> {
    if (!IndexedDB.db) {
      try {
        IndexedDB.db = await initDB()
      } catch (error: any) {
        console.debug(`Error occurred initializing IndexedDB: ${error.message}`);
        throw new Error(`Error occurred initializing IndexedDB: ${error.message}`);
      }
    }
    return new IndexedDB();
  }
  
  async write(data: { id: string }& Record<string,string>): Promise<string> {
    try {
      const transaction = IndexedDB.db!.transaction([SONGS_STORE], 'readwrite');
      const store = transaction.objectStore(SONGS_STORE);
      
      const id = data.id || Date.now().toString()
      data = {
        ...data,
        id,
      }
      store.put(data);
      return id
    } catch (error: any) {
      console.error('Error saving to IndexedDB:', error);
      throw new Error(error.message)
    }
  }
}


const initDB = (): Promise<IDBDatabase> => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(INDEXEDDB_NAME, CACHE_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event) => {
      const db = (event?.target as any)?.result;
      
      if (!db.objectStoreNames.contains(SONGS_STORE)) {
        db.createObjectStore(SONGS_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(SAMPLES_STORE)) {
        db.createObjectStore(SAMPLES_STORE);
      }
    };
    
    request.onsuccess = () => resolve(request.result);
  })
};