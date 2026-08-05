-- =============================================
-- V5: Remaining tables + comprehensive seed data
-- =============================================

-- 1. Employees table
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    hire_date DATE,
    specialization VARCHAR(50) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 2. Table reservations
CREATE TABLE IF NOT EXISTS table_reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_id BIGINT NOT NULL,
    customer_id BIGINT NULL,
    reserved_from DATETIME NOT NULL,
    reserved_to DATETIME NOT NULL,
    status ENUM('ACTIVE','CANCELLED','COMPLETED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 3. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM('ORDER_STATUS','LOW_STOCK','EXPIRY','ORDER_REJECTED','ORDER_CANCELLED') NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(30) NULL,
    related_entity_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. Feedback
CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNIQUE NOT NULL,
    customer_id BIGINT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 5. Analytics (precomputed reports)
CREATE TABLE IF NOT EXISTS analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(40) NOT NULL,
    report_date DATE NOT NULL,
    data_json JSON NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (report_type, report_date)
);

-- 6. Audit log
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(30) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(30) NOT NULL,
    performed_by BIGINT NOT NULL,
    old_value_json JSON NULL,
    new_value_json JSON NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- 7. Add missing columns to order_items (if they don't exist)
-- unit_price, is_sub_ticket, assigned_chef_id
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_sub_ticket BOOLEAN DEFAULT FALSE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS assigned_chef_id BIGINT NULL;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_chef FOREIGN KEY (assigned_chef_id) REFERENCES employees(id);

-- =============================================
-- Seed data for testing
-- =============================================

-- CHEF user (role_id = 4)
-- Username: chef  |  Password: chef123
INSERT INTO users (username, email, password_hash, role_id, is_active)
VALUES ('chef', 'chef@servesmart.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 4, true);

-- CASHIER user (role_id = 5)
-- Username: cashier  |  Password: cashier123
INSERT INTO users (username, email, password_hash, role_id, is_active)
VALUES ('cashier', 'cashier@servesmart.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 5, true);

-- Employee records for existing users
INSERT INTO employees (user_id, full_name, phone, hire_date, specialization, is_active) VALUES
((SELECT id FROM users WHERE username = 'manager'), 'Manager User', '9000000001', '2026-01-01', NULL, true),
((SELECT id FROM users WHERE username = 'waiter'), 'Waiter User', '9000000002', '2026-01-15', NULL, true),
((SELECT id FROM users WHERE username = 'chef'), 'Chef User', '9000000003', '2026-02-01', 'NORTH_INDIAN', true),
((SELECT id FROM users WHERE username = 'cashier'), 'Cashier User', '9000000004', '2026-02-15', NULL, true);

-- Menu categories
INSERT INTO menu_categories (name, display_order) VALUES
('Starters', 1),
('Mains', 2),
('Breads', 3),
('Desserts', 4),
('Beverages', 5);

-- Menu items
INSERT INTO menu_items (category_id, name, description, price, gst_slab, is_available) VALUES
(1, 'Paneer Tikka', 'Marinated cottage cheese cubes roasted in tandoor with bell peppers', 280.00, 'FIVE', true),
(1, 'Chicken Seekh Kebab', 'Minced chicken skewers with aromatic spices', 320.00, 'FIVE', true),
(1, 'Veg Spring Rolls', 'Crispy rolls stuffed with mixed vegetables', 180.00, 'FIVE', true),
(2, 'Butter Chicken', 'Tender chicken in rich creamy tomato curry', 350.00, 'FIVE', true),
(2, 'Paneer Butter Masala', 'Cottage cheese in tomato-butter gravy', 280.00, 'FIVE', true),
(2, 'Dal Makhani', 'Slow-cooked black lentils in creamy gravy', 220.00, 'FIVE', true),
(2, 'Masala Dosa', 'Crispy rice crepe with spiced potato filling', 140.00, 'FIVE', true),
(2, 'Biryani', 'Fragrant basmati rice with spices and raita', 300.00, 'FIVE', true),
(3, 'Garlic Naan', 'Fluffy tandoor-baked flatbread with garlic', 60.00, 'FIVE', true),
(3, 'Butter Roti', 'Whole wheat flatbread with butter', 40.00, 'FIVE', true),
(3, 'Laccha Paratha', 'Layered flaky flatbread', 50.00, 'FIVE', true),
(4, 'Gulab Jamun', 'Deep-fried milk dumplings in sugar syrup', 90.00, 'FIVE', true),
(4, 'Rasmalai', 'Soft paneer dumplings in saffron milk', 120.00, 'FIVE', true),
(5, 'Mango Lassi', 'Sweet yogurt drink blended with mango', 120.00, 'FIVE', true),
(5, 'Masala Chai', 'Spiced Indian tea with milk', 50.00, 'FIVE', true),
(5, 'Fresh Lime Soda', 'Refreshing lime drink — sweet or salted', 60.00, 'FIVE', true);

-- Ingredients
INSERT INTO ingredients (name, base_unit) VALUES
('Paneer', 'GRAM'),
('Chicken', 'GRAM'),
('Onion', 'GRAM'),
('Tomato', 'GRAM'),
('Cream', 'ML'),
('Butter', 'GRAM'),
('Basmati Rice', 'GRAM'),
('Wheat Flour', 'GRAM'),
('Milk', 'ML'),
('Sugar', 'GRAM'),
('Mango Pulp', 'ML'),
('Tea Leaves', 'GRAM'),
('Lemon', 'PIECE'),
('Oil', 'ML'),
('Spice Mix', 'GRAM');

-- Inventory (stock for each ingredient)
INSERT INTO inventory (ingredient_id, current_stock, reorder_threshold, expiry_date) VALUES
(1, 5000, 1000, '2026-08-15'),
(2, 8000, 2000, '2026-08-10'),
(3, 10000, 2000, NULL),
(4, 8000, 2000, '2026-08-12'),
(5, 5000, 1000, '2026-08-08'),
(6, 3000, 500, '2026-08-20'),
(7, 15000, 3000, NULL),
(8, 10000, 2000, NULL),
(9, 10000, 2000, '2026-08-10'),
(10, 5000, 1000, NULL),
(11, 3000, 500, '2026-08-07'),
(12, 1000, 200, NULL),
(13, 50, 10, '2026-08-15'),
(14, 8000, 2000, NULL),
(15, 2000, 500, NULL);

-- Recipes (bill of materials for menu items)
INSERT INTO recipes (menu_item_id, ingredient_id, quantity_required) VALUES
-- Paneer Tikka: paneer 200g, onion 50g, spice mix 10g, oil 30ml
(1, 1, 200), (1, 3, 50), (1, 15, 10), (1, 14, 30),
-- Butter Chicken: chicken 250g, tomato 100g, cream 50ml, butter 30g, spice mix 15g
(4, 2, 250), (4, 4, 100), (4, 5, 50), (4, 6, 30), (4, 15, 15),
-- Paneer Butter Masala: paneer 200g, tomato 100g, cream 50ml, butter 30g, spice mix 10g
(5, 1, 200), (5, 4, 100), (5, 5, 50), (5, 6, 30), (5, 15, 10),
-- Dal Makhani: cream 30ml, butter 20g, spice mix 10g
(6, 5, 30), (6, 6, 20), (6, 15, 10),
-- Masala Dosa: oil 20ml, onion 50g, spice mix 5g
(7, 14, 20), (7, 3, 50), (7, 15, 5),
-- Biryani: basmati rice 200g, onion 80g, spice mix 15g, oil 30ml
(8, 7, 200), (8, 3, 80), (8, 15, 15), (8, 14, 30),
-- Garlic Naan: wheat flour 100g, butter 15g
(9, 8, 100), (9, 6, 15),
-- Gulab Jamun: milk 50ml, sugar 40g, oil 30ml
(12, 9, 50), (12, 10, 40), (12, 14, 30),
-- Mango Lassi: mango pulp 100ml, milk 100ml, sugar 20g
(14, 11, 100), (14, 9, 100), (14, 10, 20),
-- Masala Chai: tea leaves 5g, milk 150ml, sugar 15g, spice mix 2g
(15, 12, 5), (15, 9, 150), (15, 10, 15), (15, 15, 2);

-- Restaurant tables
INSERT INTO restaurant_tables (table_number, capacity, status) VALUES
('T1', 2, 'FREE'),
('T2', 2, 'FREE'),
('T3', 4, 'FREE'),
('T4', 4, 'FREE'),
('T5', 4, 'FREE'),
('T6', 6, 'FREE'),
('T7', 6, 'FREE'),
('T8', 8, 'FREE'),
('T9', 8, 'FREE'),
('T10', 10, 'FREE');

-- Sample customers
INSERT INTO customers (full_name, phone, email) VALUES
('Rahul Sharma', '9876543210', 'rahul@example.com'),
('Priya Patel', '9876543211', 'priya@example.com'),
('Amit Singh', '9876543212', 'amit@example.com');
