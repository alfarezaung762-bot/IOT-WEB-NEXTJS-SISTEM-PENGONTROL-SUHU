import type { Config } from "drizzle-kit";

export default {
  // Path tempat file migrasi akan disimpan
  out: "./drizzle",
  
  // Path ke file schema kamu (tambahkan .ts jika merujuk ke file spesifik)
  schema: "./db/schema.ts", 
  
  // Dialek database yang digunakan
  dialect: "turso",
  
  dbCredentials: {
    // Kita hapus tanda '!' dan berikan fallback URL dummy 
    // agar proses build Next.js/Vercel tidak crash.
    url: process.env.TURSO_DATABASE_URL || "libsql://build-dummy.turso.io",
    authToken: process.env.TURSO_AUTH_TOKEN || "dummy-token",
  },
} satisfies Config;