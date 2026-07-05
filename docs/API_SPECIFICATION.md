# ServeSmart — API Specification

Base URL (local): `http://localhost:8080/api/v1`
Full interactive spec is auto-generated from code at `http://localhost:8080/swagger-ui.html` once the backend is running — this document is the agreed contract to build against *before* that exists, and the reference for cross-module calls.

## Conventions

**Auth header** (all endpoints except `/auth/login` and `/auth/refresh`):
```
Authorization: Bearer <access_token>
```

**Standard error response:**
```json
{
  "timestamp": "2026-07-05T10:15:30Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "quantity must be greater than 0",
  "path": "/api/v1/orders/42/items"
}
```

**Pagination** (list endpoints): query params `?page=0&size=20`, response wrapper:
```json
{ "content": [ /* items */ ], "totalElements": 57, "totalPages": 3, "page": 0 }
```

**Roles:** `SUPER_ADMIN`, `MANAGER`, `WAITER`, `CHEF`, `CASHIER`. Endpoints below list which role(s) may call them; `SUPER_ADMIN` can call everything and isn't repeated on every row.

---

## 1. Authentication — *Owner: Mudassar*

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | none | Username + password → access + refresh token |
| POST | `/auth/refresh` | none (refresh token) | Exchange refresh token for new access token |
| POST | `/auth/logout` | any authenticated | Revoke refresh token |
| GET | `/auth/me` | any authenticated | Current user's profile + role |

**POST `/auth/login`**
```json
// Request
{ "username": "waiter1", "password": "••••••••" }

// Response 200
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "8f14e45f...",
  "expiresInSeconds": 900,
  "role": "WAITER"
}
```
Response `423 LOCKED` if the account has 5+ failed attempts within the last 10 minutes.

**POST `/auth/refresh`**
```json
// Request
{ "refreshToken": "8f14e45f..." }
// Response 200 — same shape as login
```

---

## 2. Employee Management — *Owner: Prashant*

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/employees` | MANAGER | List employees (paginated) |
| GET | `/employees/{id}` | MANAGER | Get one employee |
| POST | `/employees` | MANAGER | Create employee (creates linked `users` row too) |
| PUT | `/employees/{id}` | MANAGER | Update employee details |
| DELETE | `/employees/{id}` | MANAGER | Soft-delete (`is_active = false`) — never a hard delete |
| PUT | `/employees/{id}/role` | MANAGER | Change role assignment |

```json
// POST /employees — request
{
  "fullName": "Ravi Kumar",
  "phone": "9876543210",
  "email": "ravi@servesmart.local",
  "username": "ravi.k",
  "password": "temporary-password",
  "roleName": "CHEF",
  "specialization": "NORTH_INDIAN",
  "hireDate": "2026-07-01"
}
```

---

## 3. Customer Management — *Owner: Bhargwi*

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/customers?phone=` | WAITER, MANAGER | Search customer by phone |
| POST | `/customers` | WAITER, MANAGER | Register customer — `409 CONFLICT` if phone already exists |
| GET | `/customers/{id}/orders` | WAITER, MANAGER | Order history for a customer |

---

## 4. Menu Management — *Owner: Bhargwi*

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/menu/categories` | any authenticated | List categories |
| POST | `/menu/categories` | MANAGER | Create category |
| GET | `/menu/items?categoryId=&available=` | any authenticated | List/filter menu items |
| POST | `/menu/items` | MANAGER | Create menu item |
| PUT | `/menu/items/{id}` | MANAGER | Update item (price, availability, etc.) |
| POST | `/menu/items/{id}/image` | MANAGER | Upload image — multipart, JPEG/PNG, max 2 MB |
| PUT | `/menu/items/{id}/recipe` | MANAGER | Set ingredient list (bill of materials) for this item |

```json
// POST /menu/items — request
{
  "categoryId": 3,
  "name": "Paneer Butter Masala",
  "description": "Cottage cheese in tomato-butter gravy",
  "price": 249.00,
  "gstSlab": "FIVE",
  "isAvailable": true
}
```

---

## 5. Table Management — *Owner: Prashant*

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/tables` | WAITER, MANAGER | List tables with current status |
| POST | `/tables` | MANAGER | Add table |
| POST | `/tables/{id}/reserve` | WAITER, MANAGER | Reserve — `409 CONFLICT` if overlapping reservation exists |
| POST | `/tables/{id}/free` | WAITER, MANAGER | Mark free |
| POST | `/tables/merge` | WAITER, MANAGER | Merge multiple tables into one order group |

```json
// POST /tables/{id}/reserve — request
{ "customerId": 12, "reservedFrom": "2026-07-05T19:00:00", "reservedTo": "2026-07-05T21:00:00" }
```
```json
// POST /tables/merge — request
{ "tableIds": [4, 5], "primaryTableId": 4 }
```

---

## 6. Order Management — *Owner: Mudassar*

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/orders` | WAITER | Create order |
| GET | `/orders/{id}` | WAITER, MANAGER, CHEF, CASHIER | Get order with items |
| POST | `/orders/{id}/items` | WAITER | Add item(s) — becomes a sub-ticket if order is already `PREPARING` |
| PATCH | `/orders/{id}/status` | WAITER, CHEF, MANAGER | Transition order status |
| POST | `/orders/{id}/cancel` | MANAGER | Cancel with reason code (requires `Idempotency-Key` header) |
| GET | `/orders?status=&tableId=` | WAITER, MANAGER | List/filter active orders |

```json
// POST /orders — request
{
  "tableId": 4,
  "customerId": 12,
  "items": [
    { "menuItemId": 7, "quantity": 2 },
    { "menuItemId": 11, "quantity": 1 }
  ]
}
// Response 201
{ "orderId": 88, "status": "NEW", "total": 587.00 }
```

```json
// PATCH /orders/{id}/status — request
{ "newStatus": "ACCEPTED" }
```
Valid transitions enforced server-side: `NEW→ACCEPTED|REJECTED`, `ACCEPTED→PREPARING|CANCELLED`, `PREPARING→READY|CANCELLED`, `READY→SERVED`, `SERVED→COMPLETED`. Any other transition returns `409 CONFLICT`. Concurrent updates to the same order return `409 CONFLICT` with `error: "STALE_VERSION"` (optimistic locking).

```json
// POST /orders/{id}/cancel — request
{ "reasonCode": "CUSTOMER_LEFT", "notes": "Customer left before food arrived" }
```

---

## 7. Kitchen Dashboard — *Owner: Prashant*

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/kitchen/queue` | CHEF | Orders/items assigned to the calling chef, or unassigned + matching specialization |
| POST | `/kitchen/items/{orderItemId}/accept` | CHEF | Accept an item |
| POST | `/kitchen/items/{orderItemId}/start` | CHEF | Mark preparing |
| POST | `/kitchen/items/{orderItemId}/ready` | CHEF | Mark ready |
| POST | `/kitchen/items/{orderItemId}/ingredient-unavailable` | CHEF | Flag shortage — calls Inventory internally, notifies waiter |

Internally, `ingredient-unavailable` calls `InventoryService.checkAvailability(menuItemId)` (Mudassar's module) — see `CONTRIBUTING.md` Section 6 for the shared interface.

---

## 8. Inventory — *Owner: Mudassar*

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/inventory` | MANAGER, CHEF | List ingredients with current stock |
| GET | `/inventory/low-stock` | MANAGER | Ingredients at/below `reorder_threshold` |
| GET | `/inventory/expiring?withinDays=2` | MANAGER | Ingredients nearing expiry |
| POST | `/inventory/{ingredientId}/stock-in` | MANAGER | Add stock — accepts any unit, converts to base unit |
| POST | `/inventory/{ingredientId}/stock-out` | MANAGER, CHEF | Deduct stock (manual adjustment or wastage) |
| GET | `/inventory/{ingredientId}/history` | MANAGER | Stock movement history |
| GET | `/inventory/check-availability?menuItemId=` | internal (CHEF via Kitchen module) | Can this menu item currently be made, per its recipe? |

```json
// POST /inventory/{id}/stock-in — request
{ "quantity": 5, "unit": "KG", "note": "Weekly delivery" }
// Server converts 5 KG → 5000 (base_unit = GRAM) before persisting
```

```json
// GET /inventory/check-availability?menuItemId=7 — response
{ "menuItemId": 7, "available": false, "missingIngredients": ["Paneer"] }
```

---

## 9. Supplier — *Owner: Nikhil*

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/suppliers` | MANAGER | List suppliers |
| POST | `/suppliers` | MANAGER | Add supplier |
| POST | `/purchase-orders` | MANAGER | Create purchase order |
| GET | `/purchase-orders?supplierId=&status=` | MANAGER | List/filter purchase orders |
| POST | `/purchase-orders/{id}/receive` | MANAGER | Mark received — increments Inventory stock for each line item |

```json
// POST /purchase-orders — request
{
  "supplierId": 3,
  "expectedDeliveryDate": "2026-07-10",
  "items": [ { "ingredientId": 5, "quantity": 20, "unit": "KG", "unitPrice": 180.00 } ]
}
```

---

## 10. Billing — *Owner: Mudassar*

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/bills` | CASHIER | Generate bill(s) from a completed order — supports split |
| GET | `/bills/{id}` | CASHIER, MANAGER | Get bill detail |
| POST | `/bills/{id}/payments` | CASHIER | Record a payment (one of possibly several, for mixed payment) |
| GET | `/bills/{id}/receipt` | CASHIER | Printable receipt |

```json
// POST /bills — request (single bill)
{ "orderId": 88, "discountAmount": 0 }
// Response 201
{ "billId": 210, "invoiceNumber": "INV-2026-000210", "subtotal": 587.00, "gstAmount": 46.15, "totalAmount": 633.15 }
```

```json
// POST /bills — request (split by amount, 2 ways)
{
  "orderId": 88,
  "split": [ { "amount": 316.58 }, { "amount": 316.57 } ]
}
// Response 201 — array of bills sharing one splitGroupId
```

```json
// POST /bills/{id}/payments — request (mixed payment, called twice against the same bill)
{ "paymentMode": "CASH", "amount": 400.00 }
{ "paymentMode": "UPI", "amount": 233.15 }
```
`400 BAD_REQUEST` if the sum of payments would exceed `total_amount`.

---

## 11. Notifications — *Owner: Nikhil*

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | any authenticated | Current user's notifications (role-scoped at creation time) |
| POST | `/notifications/{id}/read` | any authenticated | Mark as read |

Created internally by other modules (Order, Inventory) — not created directly via a public POST endpoint.

---

## 12. Reports & Analytics — *Owner: Nikhil*

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/reports/daily-sales?date=` | MANAGER | Daily sales figures |
| GET | `/reports/monthly-sales?month=` | MANAGER | Monthly sales figures |
| GET | `/reports/inventory` | MANAGER | Current inventory report |
| GET | `/reports/top-items?limit=10&from=&to=` | MANAGER | Top-selling menu items in a date range |
| GET | `/reports/chef-performance?from=&to=` | MANAGER | Items completed / avg. prep time per chef |

All read from the precomputed `analytics` table where available; fall back to a live query if that date's aggregate hasn't been generated yet.

---

## 13. Customer Feedback — *Owner: Bhargwi*

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/feedback` | none (customer-facing, post-order link) | Submit rating + comment for a completed order |
| GET | `/feedback?menuItemId=&from=&to=` | MANAGER | Aggregated feedback view |

```json
// POST /feedback — request
{ "orderId": 88, "rating": 5, "comment": "Great food, quick service" }
```

---

## 14. Cross-Module Call Reference

Matches `CONTRIBUTING.md` Section 6 — these are Java method calls, not HTTP requests, listed here so the request/response shapes are agreed on before either side is built.

| Caller | Interface Method | Returns |
|---|---|---|
| `KitchenService` (Prashant) | `InventoryService.checkAvailability(menuItemId)` | `AvailabilityResult { available, missingIngredients[] }` |
| `OrderService` (Mudassar) | `MenuService.getItemPriceAndAvailability(menuItemId)` | `MenuItemSnapshot { price, gstSlab, isAvailable }` |
| `OrderService` (Mudassar) | `TableService.validateTableStatus(tableId)` | `boolean` (throws if table is not FREE/RESERVED-for-this-booking) |
| `NotificationService` (Nikhil) | listens to `OrderStatusChangedEvent`, `LowStockEvent` | fires notification rows |
| `ReportService` (Nikhil) | reads `orders`, `bills`, `inventory` directly (read-only queries, not service calls) | — |
