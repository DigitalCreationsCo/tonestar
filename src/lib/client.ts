import { IndexedDB } from "./db";

export class DBClient extends IndexedDB{
  private constructor() {
    super();
  }

  static getInstance(): Promise<DBClient> {
    return super.getInstance()
  }

  async write (data: {id: string} & Record<string, string>): Promise<string> {
    return await super.write(data)
  }
}