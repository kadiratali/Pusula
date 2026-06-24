const { getPool, sql } = require('./db');
require('dotenv').config();

async function initDb() {
  const pool = await getPool();

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='projects' AND xtype='U')
    CREATE TABLE projects (
      id INT IDENTITY PRIMARY KEY,
      name NVARCHAR(255) NOT NULL,
      description NVARCHAR(MAX),
      created_at DATETIME DEFAULT GETDATE()
    )
  `);

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='test_cases' AND xtype='U')
    CREATE TABLE test_cases (
      id INT IDENTITY PRIMARY KEY,
      project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title NVARCHAR(500) NOT NULL,
      description NVARCHAR(MAX),
      preconditions NVARCHAR(MAX),
      priority NVARCHAR(20) DEFAULT 'medium',
      type NVARCHAR(50) DEFAULT 'functional',
      status NVARCHAR(20) DEFAULT 'active',
      created_at DATETIME DEFAULT GETDATE(),
      updated_at DATETIME DEFAULT GETDATE()
    )
  `);

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='test_steps' AND xtype='U')
    CREATE TABLE test_steps (
      id INT IDENTITY PRIMARY KEY,
      test_case_id INT NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
      step_order INT NOT NULL,
      action NVARCHAR(MAX) NOT NULL,
      expected_result NVARCHAR(MAX),
      created_at DATETIME DEFAULT GETDATE()
    )
  `);

  console.log('Tablolar basariyla olusturuldu.');
  process.exit(0);
}

initDb().catch((err) => {
  console.error('DB init hatasi:', err);
  process.exit(1);
});
