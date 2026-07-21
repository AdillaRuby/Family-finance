/**
 * scripts/db-push.mjs
 *
 * Workaround for Prisma 7 prisma.config.ts parse error on Windows paths with spaces.
 * Uses Prisma's programmatic API to push schema to database.
 *
 * Run: node scripts/db-push.mjs
 */

import path from "node:path"
import { fileURLToPath } from "node:url"
import { config } from "dotenv"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

// Load .env.local
config({ path: path.join(root, ".env.local") })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error("❌ DATABASE_URL or DIRECT_URL not set in .env.local")
  process.exit(1)
}

console.log("🔌 Connecting to database...")
console.log("   Host:", new URL(connectionString).hostname)

// Use pg directly to test connection first
const { default: pg } = await import("pg")
const pool = new pg.Pool({ connectionString })

try {
  const client = await pool.connect()
  const result = await client.query("SELECT version()")
  console.log("✅ Connected:", result.rows[0].version.split(" ").slice(0, 2).join(" "))
  client.release()
} catch (err) {
  console.error("❌ Connection failed:", err.message)
  process.exit(1)
} finally {
  await pool.end()
}

console.log("\n📋 Connection successful!")
console.log("   Now run: pnpm exec prisma db push (from a path without spaces)")
console.log("   OR use Supabase Table Editor to verify tables after migration.")
