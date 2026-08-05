-- =============================================
-- V4: Seed data — admin and test users
-- =============================================

-- Roles are already inserted in V1__init_schema.sql

-- Insert default SUPER_ADMIN user
-- Username: admin  |  Password: admin123
INSERT INTO users (username, email, password_hash, role_id, is_active)
VALUES ('admin', 'admin@servesmart.com', '$2b$12$XC6sW.SpDBF1XBc2DUuRduazvfZfI.u8eCp7NWfayIjKWVvNEvMUC', 1, true);

-- Insert a MANAGER user for testing
-- Username: manager  |  Password: manager123
INSERT INTO users (username, email, password_hash, role_id, is_active)
VALUES ('manager', 'manager@servesmart.com', '$2b$12$SFTJgbmXRhZa6z0pbd5HEuZRHdWnzAkfy.DFSi1aOXzXkcbJFPxZu', 2, true);

-- Insert a WAITER user for testing
-- Username: waiter  |  Password: waiter123
INSERT INTO users (username, email, password_hash, role_id, is_active)
VALUES ('waiter', 'waiter@servesmart.com', '$2b$12$ZwaS4uPCOUqEKt2r.2/kjOD06Qxr9dRnH8reqJDmQwJmS8p5htILq', 3, true);
