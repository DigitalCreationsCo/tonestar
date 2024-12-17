import NextAuth from "next-auth"
import authConfig from "./auth.config";
import { UnstorageAdapter } from "@auth/unstorage-adapter"
import indexedDbDriver from "unstorage/drivers/indexedb";
import { createStorage } from "unstorage";

const storage = createStorage({
  driver: indexedDbDriver({ base: "app:" }),
});
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: UnstorageAdapter(storage),
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})