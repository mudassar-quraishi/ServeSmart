# ServeSmart — Database Schema

MySQL 8.x. This is the source of truth for table structure. The runnable version of this lives at
`backend/src/main/resources/db/migration/V1__init_schema.sql` and is applied automatically by Flyway
(see `CONTRIBUTING.md`, Section 5) — don't hand-edit your local database, edit the migration.

---

## 1. Entity Relationship Overview

```
roles ──< users ──< employees
                 │
                 ├──< orders >── restaurant_tables
                 │       │  │
                 │       │  └──< table_reservations
                 │       │
customers ───────┘       ├──< order_items >── menu_items >── menu_categories
                          │                         │
                          │                         └──< recipes >── ingredients ──1:1── inventory
                          │
                          ├──< bills ──< payments
                          │
                          ├──< feedback
                          │
suppliers ──< purchase_orders ──< purchase_order_items >── ingredients

notifications ── (user_id → users)
audit_log ── (performed_by → users, polymorphic entity_type/entity_id)
analytics ── (precomputed, no FK — reads from the above)
```

Ownership note: table groups map to the module owners in the Team Work Allocation doc — this schema doesn't repeat that, it's the same modules.

---

## 2. Tables

### 2.1 `roles`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| name | VARCHAR(30) UNIQUE NOT NULL | `SUPER_ADMIN`, `MANAGER`, `WAITER`, `CHEF`, `CASHIER` |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

### 2.2 `users`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| username | VARCHAR(50) UNIQUE NOT NULL | |
| email | VARCHAR(120) UNIQUE NOT NULL | |
| password_hash | VARCHAR(100) NOT NULL | BCrypt |
| role_id | BIGINT NOT NULL, FK → roles.id | |
| is_active | BOOLEAN DEFAULT TRUE | soft-delete flag |
| failed_login_attempts | INT DEFAULT 0 | reset on successful login |
| locked_until | TIMESTAMP NULL | brute-force lockout |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

### 2.3 `employees`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT UNIQUE NOT NULL, FK → users.id | 1:1 — every employee has a login |
| full_name | VARCHAR(100) NOT NULL | |
| phone | VARCHAR(20) | |
| hire_date | DATE | |
| specialization | VARCHAR(50) NULL | dish category, e.g. `NORTH_INDIAN`, `CONTINENTAL` — used by Kitchen Dashboard chef assignment (manual for v1) |
| is_active | BOOLEAN DEFAULT TRUE | soft-delete only, never hard-delete |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

### 2.4 `customers`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| full_name | VARCHAR(100) NOT NULL | |
| phone | VARCHAR(20) UNIQUE NOT NULL | duplicate-detection key |
| email | VARCHAR(120) NULL | |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

### 2.5 `restaurant_tables`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| table_number | VARCHAR(10) UNIQUE NOT NULL | |
| capacity | INT NOT NULL | |
| status | ENUM('FREE','OCCUPIED','RESERVED') DEFAULT 'FREE' | |
| merged_with_table_id | BIGINT NULL, FK → restaurant_tables.id | self-reference for merged groups |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

### 2.6 `table_reservations`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| table_id | BIGINT NOT NULL, FK → restaurant_tables.id | |
| customer_id | BIGINT NULL, FK → customers.id | |
| reserved_from | DATETIME NOT NULL | |
| reserved_to | DATETIME NOT NULL | |
| status | ENUM('ACTIVE','CANCELLED','COMPLETED') DEFAULT 'ACTIVE' | |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

Overlap check: reject a new `ACTIVE` reservation for the same `table_id` where `reserved_from < existing.reserved_to AND reserved_to > existing.reserved_from`.

### 2.7 `menu_categories`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| name | VARCHAR(60) NOT NULL | |
| display_order | INT DEFAULT 0 | |

### 2.8 `menu_items`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| category_id | BIGINT NOT NULL, FK → menu_categories.id | |
| name | VARCHAR(100) NOT NULL | |
| description | VARCHAR(500) NULL | |
| price | DECIMAL(10,2) NOT NULL | |
| gst_slab | ENUM('FIVE','TWELVE','EIGHTEEN') NOT NULL | maps to 5% / 12% / 18% |
| image_url | VARCHAR(255) NULL | |
| is_available | BOOLEAN DEFAULT TRUE | |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

### 2.9 `ingredients`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| name | VARCHAR(100) UNIQUE NOT NULL | |
| base_unit | ENUM('GRAM','ML','PIECE') NOT NULL | all quantities for this ingredient are stored in this unit |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

### 2.10 `recipes`
Bill-of-materials: which ingredients (and how much) a menu item consumes.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| menu_item_id | BIGINT NOT NULL, FK → menu_items.id | |
| ingredient_id | BIGINT NOT NULL, FK → ingredients.id | |
| quantity_required | DECIMAL(10,3) NOT NULL | in the ingredient's base_unit |
| UNIQUE (menu_item_id, ingredient_id) | | |

### 2.11 `inventory`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| ingredient_id | BIGINT UNIQUE NOT NULL, FK → ingredients.id | 1:1 |
| current_stock | DECIMAL(10,3) NOT NULL DEFAULT 0 | in base_unit |
| reorder_threshold | DECIMAL(10,3) NOT NULL DEFAULT 0 | triggers low-stock alert |
| expiry_date | DATE NULL | |
| version | INT NOT NULL DEFAULT 0 | optimistic locking (`@Version`) |
| updated_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

### 2.12 `suppliers`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| name | VARCHAR(100) NOT NULL | |
| contact_phone | VARCHAR(20) | |
| email | VARCHAR(120) NULL | |
| address | VARCHAR(255) NULL | |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

### 2.13 `purchase_orders`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| supplier_id | BIGINT NOT NULL, FK → suppliers.id | |
| status | ENUM('PENDING','RECEIVED','CANCELLED') DEFAULT 'PENDING' | |
| order_date | DATE NOT NULL | |
| expected_delivery_date | DATE NULL | |
| created_by | BIGINT NOT NULL, FK → users.id | |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

### 2.14 `purchase_order_items`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| purchase_order_id | BIGINT NOT NULL, FK → purchase_orders.id | |
| ingredient_id | BIGINT NOT NULL, FK → ingredients.id | |
| quantity | DECIMAL(10,3) NOT NULL | in base_unit |
| unit_price | DECIMAL(10,2) NOT NULL | |

### 2.15 `orders`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| table_id | BIGINT NULL, FK → restaurant_tables.id | null = takeaway |
| customer_id | BIGINT NULL, FK → customers.id | |
| waiter_id | BIGINT NOT NULL, FK → users.id | |
| status | ENUM('NEW','ACCEPTED','PREPARING','READY','SERVED','COMPLETED','REJECTED','CANCELLED') DEFAULT 'NEW' | |
| cancellation_reason | VARCHAR(255) NULL | required if status = CANCELLED or REJECTED |
| cancelled_by | BIGINT NULL, FK → users.id | must have MANAGER role for CANCELLED |
| version | INT NOT NULL DEFAULT 0 | optimistic locking |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

### 2.16 `order_items`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| order_id | BIGINT NOT NULL, FK → orders.id | |
| menu_item_id | BIGINT NOT NULL, FK → menu_items.id | |
| quantity | INT NOT NULL | |
| unit_price | DECIMAL(10,2) NOT NULL | snapshot of price at order time |
| status | ENUM('PENDING','PREPARING','READY','SERVED') DEFAULT 'PENDING' | |
| is_sub_ticket | BOOLEAN DEFAULT FALSE | true if added after the order entered PREPARING |
| assigned_chef_id | BIGINT NULL, FK → employees.id | |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

### 2.17 `bills`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| order_id | BIGINT NOT NULL, FK → orders.id | |
| invoice_number | VARCHAR(30) UNIQUE NOT NULL | |
| subtotal | DECIMAL(10,2) NOT NULL | |
| gst_amount | DECIMAL(10,2) NOT NULL | |
| discount_amount | DECIMAL(10,2) DEFAULT 0 | |
| total_amount | DECIMAL(10,2) NOT NULL | |
| split_group_id | VARCHAR(36) NULL | shared UUID across bills split from the same order |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

### 2.18 `payments`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| bill_id | BIGINT NOT NULL, FK → bills.id | |
| payment_mode | ENUM('CASH','CARD','UPI') NOT NULL | recorded only, no gateway settlement |
| amount | DECIMAL(10,2) NOT NULL | |
| paid_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

A bill can have more than one payment row (mixed payment — e.g., part cash, part UPI); `SUM(payments.amount) = bills.total_amount` when fully settled.

### 2.19 `notifications`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT NOT NULL, FK → users.id | recipient |
| type | ENUM('ORDER_STATUS','LOW_STOCK','EXPIRY','ORDER_REJECTED','ORDER_CANCELLED') NOT NULL | |
| message | VARCHAR(255) NOT NULL | |
| is_read | BOOLEAN DEFAULT FALSE | |
| related_entity_type | VARCHAR(30) NULL | e.g. `ORDER`, `INGREDIENT` |
| related_entity_id | BIGINT NULL | |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

### 2.20 `feedback`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| order_id | BIGINT UNIQUE NOT NULL, FK → orders.id | one feedback per completed order |
| customer_id | BIGINT NULL, FK → customers.id | |
| rating | TINYINT NOT NULL | 1–5, enforced with a CHECK constraint |
| comment | VARCHAR(500) NULL | |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

### 2.21 `analytics`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| report_type | VARCHAR(40) NOT NULL | `DAILY_SALES`, `MONTHLY_SALES`, `TOP_ITEMS`, `CHEF_PERFORMANCE` |
| report_date | DATE NOT NULL | |
| data_json | JSON NOT NULL | precomputed aggregate payload |
| generated_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |
| UNIQUE (report_type, report_date) | | |

### 2.22 `audit_log`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| entity_type | VARCHAR(30) NOT NULL | e.g. `ORDER`, `INVENTORY`, `BILL` |
| entity_id | BIGINT NOT NULL | |
| action | VARCHAR(30) NOT NULL | e.g. `CANCELLED`, `STOCK_ADJUSTED` |
| performed_by | BIGINT NOT NULL, FK → users.id | |
| old_value_json | JSON NULL | |
| new_value_json | JSON NULL | |
| performed_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

---

## 3. Runnable DDL

Save as `backend/src/main/resources/db/migration/V1__init_schema.sql`:

```sql
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE employees (
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

CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(120) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restaurant_tables (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_number VARCHAR(10) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    status ENUM('FREE','OCCUPIED','RESERVED') DEFAULT 'FREE',
    merged_with_table_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merged_with_table_id) REFERENCES restaurant_tables(id)
);

CREATE TABLE table_reservations (
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

CREATE TABLE menu_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    display_order INT DEFAULT 0
);

CREATE TABLE menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NULL,
    price DECIMAL(10,2) NOT NULL,
    gst_slab ENUM('FIVE','TWELVE','EIGHTEEN') NOT NULL,
    image_url VARCHAR(255) NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);

CREATE TABLE ingredients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    base_unit ENUM('GRAM','ML','PIECE') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    quantity_required DECIMAL(10,3) NOT NULL,
    UNIQUE (menu_item_id, ingredient_id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ingredient_id BIGINT UNIQUE NOT NULL,
    current_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    reorder_threshold DECIMAL(10,3) NOT NULL DEFAULT 0,
    expiry_date DATE NULL,
    version INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20),
    email VARCHAR(120) NULL,
    address VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    status ENUM('PENDING','RECEIVED','CANCELLED') DEFAULT 'PENDING',
    order_date DATE NOT NULL,
    expected_delivery_date DATE NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE purchase_order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_id BIGINT NULL,
    customer_id BIGINT NULL,
    waiter_id BIGINT NOT NULL,
    status ENUM('NEW','ACCEPTED','PREPARING','READY','SERVED','COMPLETED','REJECTED','CANCELLED') DEFAULT 'NEW',
    cancellation_reason VARCHAR(255) NULL,
    cancelled_by BIGINT NULL,
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (waiter_id) REFERENCES users(id),
    FOREIGN KEY (cancelled_by) REFERENCES users(id)
);

CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING','PREPARING','READY','SERVED') DEFAULT 'PENDING',
    is_sub_ticket BOOLEAN DEFAULT FALSE,
    assigned_chef_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
    FOREIGN KEY (assigned_chef_id) REFERENCES employees(id)
);

CREATE TABLE bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    gst_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    split_group_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_id BIGINT NOT NULL,
    payment_mode ENUM('CASH','CARD','UPI') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id)
);

CREATE TABLE notifications (
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

CREATE TABLE feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNIQUE NOT NULL,
    customer_id BIGINT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(40) NOT NULL,
    report_date DATE NOT NULL,
    data_json JSON NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (report_type, report_date)
);

CREATE TABLE audit_log (
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

-- Seed roles (required before any user can be created)
INSERT INTO roles (name) VALUES ('SUPER_ADMIN'), ('MANAGER'), ('WAITER'), ('CHEF'), ('CASHIER');
```

**Whoever adds a table for their module later adds a new migration file** (`V2__...sql`, `V3__...sql`) rather than editing this one — see `CONTRIBUTING.md` Section 5.
