const express = require('express');
const router = express.Router({ mergeParams: true });
const { getPool, sql } = require('../config/db');

// Projedeki senaryolar
router.get('/', async (req, res) => {
  const { priority, type, status } = req.query;
  try {
    const pool = await getPool();
    const request = pool.request().input('project_id', sql.Int, req.params.pid);
    let where = 'WHERE project_id=@project_id';
    if (priority) { request.input('priority', sql.NVarChar, priority); where += ' AND priority=@priority'; }
    if (type) { request.input('type', sql.NVarChar, type); where += ' AND type=@type'; }
    if (status) { request.input('status', sql.NVarChar, status); where += ' AND status=@status'; }
    const result = await request.query(`SELECT * FROM test_cases ${where} ORDER BY created_at DESC`);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Senaryo oluştur
router.post('/', async (req, res) => {
  const { title, description, preconditions, priority, type, status } = req.body;
  if (!title) return res.status(400).json({ error: 'title zorunlu' });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('project_id', sql.Int, req.params.pid)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || null)
      .input('preconditions', sql.NVarChar, preconditions || null)
      .input('priority', sql.NVarChar, priority || 'medium')
      .input('type', sql.NVarChar, type || 'functional')
      .input('status', sql.NVarChar, status || 'active')
      .query(`
        INSERT INTO test_cases (project_id, title, description, preconditions, priority, type, status)
        OUTPUT INSERTED.*
        VALUES (@project_id, @title, @description, @preconditions, @priority, @type, @status)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tek senaryo + adımlar
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const caseResult = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM test_cases WHERE id=@id');
    if (!caseResult.recordset.length) return res.status(404).json({ error: 'Bulunamadı' });

    const stepsResult = await pool.request()
      .input('test_case_id', sql.Int, req.params.id)
      .query('SELECT * FROM test_steps WHERE test_case_id=@test_case_id ORDER BY step_order');

    res.json({ ...caseResult.recordset[0], steps: stepsResult.recordset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Senaryo güncelle
router.put('/:id', async (req, res) => {
  const { title, description, preconditions, priority, type, status } = req.body;
  if (!title) return res.status(400).json({ error: 'title zorunlu' });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || null)
      .input('preconditions', sql.NVarChar, preconditions || null)
      .input('priority', sql.NVarChar, priority || 'medium')
      .input('type', sql.NVarChar, type || 'functional')
      .input('status', sql.NVarChar, status || 'active')
      .query(`
        UPDATE test_cases
        SET title=@title, description=@description, preconditions=@preconditions,
            priority=@priority, type=@type, status=@status, updated_at=GETDATE()
        OUTPUT INSERTED.*
        WHERE id=@id
      `);
    if (!result.recordset.length) return res.status(404).json({ error: 'Bulunamadı' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Senaryo sil
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM test_cases WHERE id=@id');
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adımları toplu kaydet (replace)
router.put('/:id/steps', async (req, res) => {
  const { steps } = req.body;
  if (!Array.isArray(steps)) return res.status(400).json({ error: 'steps dizisi gerekli' });
  try {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      await transaction.request()
        .input('test_case_id', sql.Int, req.params.id)
        .query('DELETE FROM test_steps WHERE test_case_id=@test_case_id');

      for (let i = 0; i < steps.length; i++) {
        const { action, expected_result } = steps[i];
        await transaction.request()
          .input('test_case_id', sql.Int, req.params.id)
          .input('step_order', sql.Int, i + 1)
          .input('action', sql.NVarChar, action || '')
          .input('expected_result', sql.NVarChar, expected_result || null)
          .query(`
            INSERT INTO test_steps (test_case_id, step_order, action, expected_result)
            VALUES (@test_case_id, @step_order, @action, @expected_result)
          `);
      }
      await transaction.commit();
      const result = await pool.request()
        .input('test_case_id', sql.Int, req.params.id)
        .query('SELECT * FROM test_steps WHERE test_case_id=@test_case_id ORDER BY step_order');
      res.json(result.recordset);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
