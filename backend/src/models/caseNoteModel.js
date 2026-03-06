const db = require('../config/db');

const CaseNoteModel = {
    /**
     * Add a note to a case.
     */
    async create(case_id, note_text, created_by) {
        const { rows } = await db.query(
            `INSERT INTO case_notes (id, case_id, note_text, created_by, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())
       RETURNING *`,
            [case_id, note_text, created_by]
        );
        return rows[0];
    },

    /**
     * Get all notes for a case, with author name.
     */
    async findByCaseId(case_id) {
        const { rows } = await db.query(
            `SELECT cn.*, u.name AS author_name
       FROM case_notes cn
       LEFT JOIN users u ON cn.created_by = u.id
       WHERE cn.case_id = $1
       ORDER BY cn.created_at DESC`,
            [case_id]
        );
        return rows;
    },
};

module.exports = CaseNoteModel;
