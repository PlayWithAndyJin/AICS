import pool from './db'

// 数据库初始化脚本
export async function initDatabase() {
  try {
    // 启用 pgcrypto 扩展
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto')
    
    // 删除旧表（如果存在）
    await pool.query('DROP TABLE IF EXISTS user_keys CASCADE')
    
    // 创建用户密钥表
    await pool.query(`
      CREATE TABLE user_keys (
        id SERIAL PRIMARY KEY,
        unique_key VARCHAR(32) UNIQUE NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        aliyun_api_key TEXT,
        deepseek_api_key TEXT,
        volcano_api_key TEXT,
        usage_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP,
        CONSTRAINT fk_user_keys_user_id 
          FOREIGN KEY (user_id) 
          REFERENCES users(user_id) 
          ON DELETE CASCADE
      )
    `)
    
    // 创建索引
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_keys_user_id ON user_keys(user_id)')
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_keys_unique_key ON user_keys(unique_key)')
    
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database setup completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Database setup failed:', error)
      process.exit(1)
    })
} 