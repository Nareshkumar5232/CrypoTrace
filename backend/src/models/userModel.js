const db = require('../config/db');

const UserModel = {
    /**
     * Find a user by email address.
     */
    async findByEmail(email) {
        const { rows } = await db.query(
            `SELECT u.id, u.name, u.email, u.password_hash, u.role_id, r.name AS role,
              u.created_at, u.updated_at
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
            [email]
        );
        return rows[0] || null;
    },

    /**
     * Find a user by id.
     */
    async findById(id) {
        const { rows } = await db.query(
            `SELECT u.id, u.name, u.email, u.role_id, r.name AS role,
              u.created_at, u.updated_at
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Return all users (password hash excluded).
     */
    async findAll() {
        const { rows } = await db.query(
            `SELECT u.id, u.name, u.email, u.role_id, r.name AS role,
              u.created_at, u.updated_at
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
        );
        return rows;
    },

    /**
     * Create a new user and return the created record.
     */
    async create({ name, email, password_hash, role_id }) {
        const { rows } = await db.query(
            `INSERT INTO users (id, name, email, password_hash, role_id, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
       RETURNING id, name, email, role_id, created_at, updated_at`,
            [name, email, password_hash, role_id]
        );
        return rows[0];
    },

    /**
     * Update user fields (name, email, role_id).
     * Only supplied fields are updated.
     */
    async update(id, fields) {
        const setClauses = [];
        const values = [];
        let idx = 1;

        for (const [key, value] of Object.entries(fields)) {
            setClauses.push(`${key} = $${idx}`);
            values.push(value);
            idx++;
        }

        setClauses.push(`updated_at = NOW()`);
        values.push(id);

        const { rows } = await db.query(
            `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx}
       RETURNING id, name, email, role_id, created_at, updated_at`,
            values
        );
        return rows[0] || null;
    },
};

module.exports = UserModel;
