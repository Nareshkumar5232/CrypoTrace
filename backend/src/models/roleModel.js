const db = require('../config/db');

const RoleModel = {
    /**
     * Return all roles.
     */
    async findAll() {
        const { rows } = await db.query('SELECT id, name FROM roles ORDER BY id');
        return rows;
    },

    /**
     * Find a role by id.
     */
    async findById(id) {
        const { rows } = await db.query('SELECT id, name FROM roles WHERE id = $1', [id]);
        return rows[0] || null;
    },
};

module.exports = RoleModel;
