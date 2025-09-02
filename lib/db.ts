import { Pool } from 'pg'

const {
  DATABASE_URL,
  PGHOST,
  PGPORT,
  PGUSER,
  PGPASSWORD,
  PGDATABASE,
  PGSSL
} = process.env

let pool: Pool

if (DATABASE_URL) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: PGSSL === 'true' ? { rejectUnauthorized: false } : undefined
  })
} else {
  pool = new Pool({
    host: PGHOST,
    port: PGPORT ? parseInt(PGPORT, 10) : undefined,
    user: PGUSER,
    password: PGPASSWORD,
    database: PGDATABASE,
    ssl: PGSSL === 'true' ? { rejectUnauthorized: false } : undefined
  } as any)
}

// 测试连接
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export default pool 
