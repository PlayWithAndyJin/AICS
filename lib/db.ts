import { Pool } from 'pg'

// 数据库连接配置
const dbConfig = {
  host: 'dbconn.sealosbja.site',
  port: 37437,
  user: 'postgres',
  password: 'tf78qpfs',
  database: 'postgres',
  ssl: false,
  directConnection: true
}

// 创建连接池
const pool = new Pool(dbConfig)

// 测试连接
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export default pool 