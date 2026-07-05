# ServeSmart — Developer Setup & Collaboration Guide

This is the single source of truth for how the four of us work on this codebase without stepping on each other. Read it once before you write your first line of code.

**Companion docs (in `docs/`):**
- [`API_SPECIFICATION.md`](docs/API_SPECIFICATION.md) — every endpoint, request/response shapes, and the cross-module call contracts referenced in Section 6 below
- [`DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) — full table definitions and the runnable Flyway migration referenced in Section 5 below

---

## 1. Tech Stack & Prerequisites

Install these before you start:

| Tool | Version | Used For |
|---|---|---|
| Java (JDK) | 21 | Backend |
| Maven | 3.9+ | Backend build |
| Node.js | 20 LTS | Frontend |
| MySQL | 8.x | Database |
| Git | any recent | Version control |
| Postman | any recent | API testing |
| IDE | IntelliJ IDEA (backend) + VS Code (frontend) recommended | — |

Verify your setup:
```bash
java -version      # should show 21.x
mvn -version
node -version       # should show 20.x
mysql --version
```

---

## 2. Repository Structure

One repo, two top-level folders. This is a **modular monolith** — one Spring Boot app, one React app — not separate microservices.

```
ServeSmart/
├── backend/
│   ├── src/main/java/com/servesmart/
│   │   ├── auth/          → Mudassar
│   │   ├── order/         → Mudassar
│   │   ├── billing/       → Mudassar
│   │   ├── inventory/     → Mudassar
│   │   ├── employee/      → Prashant
│   │   ├── table/         → Prashant
│   │   ├── kitchen/       → Prashant
│   │   ├── customer/      → Bhargwi
│   │   ├── menu/          → Bhargwi
│   │   ├── feedback/      → Bhargwi
│   │   ├── supplier/      → Nikhil
│   │   ├── notification/  → Nikhil
│   │   ├── report/        → Nikhil
│   │   ├── common/        → shared code (see Section 6)
│   │   └── config/        → shared config (see Section 6)
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/  → Flyway SQL scripts (see Section 5)
├── frontend/
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── order/
│       │   ├── billing/
│       │   ├── inventory/
│       │   ├── employee/
│       │   ├── table/
│       │   ├── kitchen/
│       │   ├── customer/
│       │   ├── menu/
│       │   ├── feedback/
│       │   ├── supplier/
│       │   ├── notification/
│       │   └── report/
│       ├── common/        → shared components, API client
│       └── router/        → route registry (see Section 6)
├── postman/
│   └── ServeSmart.postman_collection.json
├── docs/
│   ├── API_SPECIFICATION.md
│   └── DATABASE_SCHEMA.md
└── CONTRIBUTING.md
```

**Rule:** each package under `auth/`, `order/`, `employee/`, etc. contains its own `controller/`, `service/`, `repository/`, `dto/`, and `entity/` subfolders. Everything for your module lives inside your own folder. Don't reach into someone else's package to edit their files — if you need something from their module, see Section 6.

---

## 3. First-Time Setup

### 3.1 Clone and branch

The repo is currently empty — whoever sets it up first pushes the initial folder structure (Section 2), the `.gitignore`, this file, and the `docs/` folder, straight to `main`, then creates `develop` from it. After that, everyone works off `develop` as normal.

```bash
git clone https://github.com/mudassar-quraishi/ServeSmart.git
cd ServeSmart
git checkout -b develop   # first time only, once main has the initial structure
git push -u origin develop
```
On every subsequent day:
```bash
git checkout develop
git pull
```

### 3.2 Database
Create a local database and apply migrations:
```sql
CREATE DATABASE servesmart_dev;
```
Migrations run automatically on backend startup (see Section 5) — you never run schema SQL by hand.

### 3.3 Backend config
There are two config files:
- `application.properties` — committed, shared defaults, no secrets. Already in the repo.
- `application-local.properties` — your own values, git-ignored. Copy it from the example:
```bash
cp backend/src/main/resources/application-local.properties.example backend/src/main/resources/application-local.properties
```
```properties
# application-local.properties — NEVER commit this file
spring.datasource.url=jdbc:mysql://localhost:3306/servesmart_dev
spring.datasource.username=root
spring.datasource.password=your-local-mysql-password

jwt.secret=replace-with-a-long-random-string-for-local-dev-only

server.port=8080
cors.allowed-origin=http://localhost:5173
```
**Note on `spring.jpa.hibernate.ddl-auto`:** this is set to `validate` in `application.properties` and should stay that way. Flyway owns schema changes (Section 5) — Hibernate only checks your entities match what Flyway created, and fails startup loudly if they don't. Don't switch this to `update`; see the note in Section 5 for why.

Run it:
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```
Confirm it's up: open `http://localhost:8080/swagger-ui.html`.

### 3.4 Frontend config
```bash
cd frontend
cp .env.example .env.local
```
```
VITE_API_BASE_URL=http://localhost:8080
```
```bash
npm install
npm run dev
```
Confirm it's up: open `http://localhost:5173`.

You should now have both running locally, talking to each other, against your own local database.

---

## 4. Git Workflow

### 4.1 Branches
- `main` — always deployable, protected, no direct pushes
- `develop` — integration branch, everyone merges here first
- `feature/<module>-<short-description>` — your working branch, e.g. `feature/order-cancellation`, `feature/inventory-uom-conversion`

### 4.2 Daily loop
```bash
git checkout develop
git pull
git checkout -b feature/your-branch-name
# ...do your work, commit as you go...
git push -u origin feature/your-branch-name
```
Before opening a PR, bring your branch up to date so conflicts surface on your machine, not in review:
```bash
git checkout develop
git pull
git checkout feature/your-branch-name
git merge develop
```

### 4.3 Commit messages
```
<type>(<module>): <short description>

feat(order): add cancellation with reason code
fix(billing): correct GST rounding on split bills
test(inventory): add unit conversion test cases
```
Types: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`.

### 4.4 Pull requests
- Target `develop`, not `main`.
- At least **one teammate approval** before merging — pick whoever is most likely to be affected by your change (check Section 7 for dependencies).
- PR description covers: what changed, how you tested it, and a screenshot for any UI change.
- `main` is updated from `develop` at each weekly checkpoint (Section 8), not continuously.

---

## 5. Database Migrations (Flyway)

We use Flyway so everyone's local schema updates automatically when they pull new code — nobody runs manual SQL, and nobody's local DB drifts from anyone else's. Full table definitions are in [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md); the initial migration file (`V1__init_schema.sql`) is ready to drop straight into `backend/src/main/resources/db/migration/`.

Rules:
- Migration files live in `backend/src/main/resources/db/migration/`
- Naming: `V<number>__<description>.sql`, e.g. `V1__init_schema.sql`, `V7__add_feedback_table.sql`
- **Never edit a migration file that's already been merged to `develop`.** If you need to change a table that's already there, write a new migration (`ALTER TABLE ...`), don't rewrite history.
- Whoever adds a table for their module adds the migration for it. Flyway applies pending migrations automatically the next time anyone runs the backend.
- If you pull new code and the backend fails to start with a Flyway error, you likely need to pull the latest migration files — check `git status` before debugging further.
- **Do not set `spring.jpa.hibernate.ddl-auto` to `update`.** It's `validate` in `application.properties` on purpose: Hibernate compares your `@Entity` classes against what Flyway already created and fails startup with a clear error if they don't match, instead of silently auto-altering tables (which can rename-as-drop and lose data, and makes schema changes invisible to the rest of the team since they're not in a migration file anyone else can see).

---

## 6. How Modules Talk to Each Other

This is a monolith, so cross-module calls are **plain Java method calls**, not HTTP requests.

### 6.1 Backend
If your module needs something from someone else's module (e.g., Kitchen Dashboard needs to check Inventory), you inject their service interface:
```java
@Service
public class KitchenService {
    private final InventoryService inventoryService; // from com.servesmart.inventory

    public KitchenService(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }
}
```
**Agree on the method signature with the module owner before you build against it.** If you need a method that doesn't exist yet, ask — don't build your own duplicate logic in your package.

Known cross-module calls in this project (full request/response shapes in [`docs/API_SPECIFICATION.md`](docs/API_SPECIFICATION.md), Section 14):
| Caller | Calls Into | Method Needed |
|---|---|---|
| Kitchen (Prashant) | Inventory (Mudassar) | check ingredient availability |
| Order (Mudassar) | Menu (Bhargwi) | fetch item price/availability |
| Order (Mudassar) | Table (Prashant) | validate table status |
| Order (Mudassar) | Customer (Bhargwi) | attach customer to order |
| Billing (Mudassar) | Order (Mudassar) | fetch completed order — same owner |
| Notification (Nikhil) | Order, Inventory (Mudassar) | listen for status/stock events |
| Reports (Nikhil) | Order, Billing, Inventory (Mudassar) | read aggregated data |

### 6.2 Shared code goes in `common/`
If two or more modules need the same thing (e.g., a standard API error response format, a pagination wrapper, a shared enum), it goes in `backend/.../common/` or `frontend/.../common/` — never copy-pasted into each module separately. Whoever needs it first adds it; message the team so others reuse it instead of duplicating it.

### 6.3 Avoiding merge conflicts on shared files
A few files get touched by everyone — treat these carefully:

- **`SecurityConfig.java`** (owned by Mudassar): you don't edit this directly to protect your endpoints. Use `@PreAuthorize("hasRole('MANAGER')")` annotations on your own controller methods instead — that's config-free and won't conflict with anyone else's changes.
- **Frontend route registry (`router/`)**: each module exports its own route list; the central router just imports and spreads them. Add your routes inside your own module's route file, not by hand-editing a shared master list.
- **`application.properties`**: only add keys under your own module's namespace if you need new config; ping the team before changing anything global (CORS, JWT settings, datasource, `ddl-auto`).

---

## 7. Dependencies to Watch

| Depends On | Needed By | Notes |
|---|---|---|
| Authentication (Mudassar) | Everyone | Get core login/JWT working in the first 2–3 days of Week 1 — everyone else is blocked without it |
| Menu Management (Bhargwi) | Order Management (Mudassar) | Needed before order creation can reference menu items |
| Table Management (Prashant) | Order Management (Mudassar) | Needed before an order can be tied to a table |
| Customer Management (Bhargwi) | Order Management (Mudassar) | Needed before an order can attach a customer |
| Order Management (Mudassar) | Kitchen Dashboard (Prashant) | Prashant can build against a stub/mock until this lands in Week 2 |
| Inventory (Mudassar) | Kitchen Dashboard (Prashant) | Stub the "ingredient unavailable" check in Week 2; wire in the real endpoint once Inventory ships in Week 3 |
| Order, Billing, Inventory | Reports (Nikhil) | Build reports last, in Week 4, once real data exists to report on |

---

## 8. Weekly Rhythm

- **Daily (10–15 min):** quick sync — what you're doing, any blockers, anything from Section 7 that's about to block someone else.
- **End of each week:** merge everyone's finished feature branches into `develop`, run the full app together (backend + frontend + both databases), fix any integration breakage immediately rather than letting it carry into the next week.
- **`develop` → `main`:** promoted at each weekly checkpoint once the app runs cleanly end-to-end.

This lines up with the 4-week plan in the SRS: Week 1 Foundation, Week 2 Core Operations, Week 3 Business Layer, Week 4 Reports/Testing/Ship.

---

## 9. Testing Before You Push

```bash
# Backend
cd backend
mvn test

# Frontend
cd frontend
npm run lint
npm run build
```
CI runs both automatically on every PR — a red build blocks merging.

---

## 10. API Docs & Postman

- Swagger is auto-generated from your controller annotations — visible at `http://localhost:8080/swagger-ui.html` the moment you add an endpoint. No manual doc-writing needed.
- [`docs/API_SPECIFICATION.md`](docs/API_SPECIFICATION.md) is the agreed contract to build against — update it in the same PR if your implementation ends up differing from what's written there, so it stays trustworthy for whoever calls your endpoints next.
- The shared Postman collection lives at `postman/ServeSmart.postman_collection.json`. When you add or change an endpoint, export your updated requests into this file and commit it in the same PR — don't let it fall behind.
- Prashant consolidates and cleans up the shared collection weekly (see Team Work Allocation doc).

---

## 11. Quick Command Reference

```bash
# Start backend (local profile)
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=local

# Start frontend
cd frontend && npm run dev

# Run backend tests
cd backend && mvn test

# Run frontend lint + build
cd frontend && npm run lint && npm run build

# Create a new feature branch
git checkout develop && git pull && git checkout -b feature/your-branch-name

# Update your branch with the latest develop
git checkout develop && git pull && git checkout feature/your-branch-name && git merge develop
```
