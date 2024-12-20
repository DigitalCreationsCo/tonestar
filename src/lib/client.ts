import { IndexedDB } from "./db";

const storeNames = Object.freeze({
  'SAMPLES_STORE': 'samples',
  'SONGS_STORE': 'songs'
});

export class DBClient extends IndexedDB{
  private static instance: DBClient | null = null;
  private initialized: Promise<void>;

  private constructor() {
    super(storeNames);
    this.initialized = this.ensureDbConnection()
  }

  static async getInstance(): Promise<DBClient> {
    if (!DBClient.instance) {
      DBClient.instance = new DBClient();
      await DBClient.instance.initialized;
    }
    return DBClient.instance;
  }

  async write<T>(store: keyof typeof storeNames , data: {id: string} & T): Promise<string> {
    return await super.write<T>(store, data)
  }

  async readById<T>(store: keyof typeof storeNames, field:Record<"id", string>): Promise<T | null> {
    return await super.readById<T>(store, field)
  }
}