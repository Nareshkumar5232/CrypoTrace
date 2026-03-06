const db = require('../config/db');

const CaseModel = {
    /**
     * Create a new investigation case.
     */
    async create({ case_number, title, description, status, priority, created_by, assigned_officer }) {
        const { rows } = await db.query(
            `INSERT INTO cases (id, case_number, title, description, status, priority, created_by, assigned_officer, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
            [case_number, title, description, status, priority, created_by, assigned_officer]
        );
        return rows[0];
    },

    /**
     * Find all cases, with optional filters (status, assigned_officer).
     */
    async findAll(filters = {}) {
        let query = `
      SELECT c.*, u.name AS officer_name
      FROM cases c
      LEFT JOIN users u ON c.assigned_officer = u.id
    `;
        const conditions = [];
        const values = [];
        let idx = 1;

        if (filters.status) {
            conditions.push(`c.status = $${idx++}`);
            values.push(filters.status);
        }
        if (filters.assigned_officer) {
            conditions.push(`c.assigned_officer = $${idx++}`);
            values.push(filters.assigned_officer);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY c.created_at DESC';

        const { rows } = await db.query(query, values);
        return rows;
    },

    /**
     * Find a case by id.
     */
    async findById(id) {
        const { rows } = await db.query(
            `SELECT c.*, u.name AS officer_name
       FROM cases c
       LEFT JOIN users u ON c.assigned_officer = u.id
       WHERE c.id = $1`,
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Update case fields dynamically.
     */
    async update(id, fields) {
        const setClauses = [];
        const values = [];
        let idx = 1;

        for (const [key, value] of Object.entries(fields)) {
            setClauses.push(`${key} = $${idx++}`);
            values.push(value);
        }

        setClauses.push('updated_at = NOW()');
        values.push(id);

        const { rows } = await db.query(
            `UPDATE cases SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
            values
        );
        return rows[0] || null;
    },

    /**
     * Delete a case by id.
     */
    async deleteById(id) {
        const { rowCount } = await db.query('DELETE FROM cases WHERE id = $1', [id]);
        return rowCount > 0;
    },

    /**
     * Get the next case number for the current year.
     */
    async getNextCaseNumber() {
        const year = new Date().getFullYear();
        const prefix = `FIU-${year}-`;
        const { rows } = await db.query(
            `SELECT case_number FROM cases
       WHERE case_number LIKE $1
       ORDER BY case_number DESC LIMIT 1`,
            [`${prefix}%`]
        );

        if (rows.length === 0) {
            return `${prefix}0001`;
        }

        const lastNum = parseInt(rows[0].case_number.split('-')[2], 10);
        return `${prefix}${String(lastNum + 1).padStart(4, '0')}`;
    },
};

module.exports = CaseModel;
