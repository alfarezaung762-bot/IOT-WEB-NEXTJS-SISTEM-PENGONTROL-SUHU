import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

// Kita buat validasi super ketat. Kalau URL-nya kosong (""),
// paksa gunakan format URL dummy (libsql://...) agar build Vercel lolos.
const dbUrl = process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.trim() !== ""
  ? process.env.TURSO_DATABASE_URL
  : "libsql://dummy-database.turso.io";

const dbToken = process.env.TURSO_AUTH_TOKEN && process.env.TURSO_AUTH_TOKEN.trim() !== ""
  ? process.env.TURSO_AUTH_TOKEN
  : "dummy-token";

const client = createClient({
  url: dbUrl,
  authToken: dbToken,
});

export const db = drizzle(client);