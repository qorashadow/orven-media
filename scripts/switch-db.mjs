import fs from 'fs'
import path from 'path'

const target = (process.argv[2] || '').toLowerCase()
const rootDir = process.cwd()

if (target !== 'sqlite' && target !== 'postgres') {
  console.log('Usage: node scripts/switch-db.mjs [sqlite|postgres]')
  process.exit(1)
}

const sourceFile = target === 'sqlite'
  ? path.join(rootDir, 'prisma', 'schema.sqlite.prisma')
  : path.join(rootDir, 'prisma', 'schema.postgresql.prisma')

const destFile = path.join(rootDir, 'prisma', 'schema.prisma')

if (!fs.existsSync(sourceFile)) {
  console.error(`Error: Source schema file not found: ${sourceFile}`)
  process.exit(1)
}

fs.copyFileSync(sourceFile, destFile)
console.log(`\n[PRISMA CONFIG] Successfully switched active schema to: ${target.toUpperCase()}`)
console.log(`Destination: ${destFile}`)

if (target === 'postgres') {
  console.log('\nNext steps for PostgreSQL / Neon:')
  console.log('1. Make sure DATABASE_URL in .env points to your Neon PostgreSQL database.')
  console.log('2. Run: npx prisma generate')
  console.log('3. Run: npx prisma db push')
  console.log('4. Run: npm run prisma:import-to-postgres (to import existing SQLite data)\n')
} else {
  console.log('\nNext steps for SQLite:')
  console.log('1. Make sure DATABASE_URL in .env is "file:./dev.db"')
  console.log('2. Run: npx prisma generate\n')
}
