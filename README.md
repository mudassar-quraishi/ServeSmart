# ServeSmart — Team Package Index

Everything needed to start the project, in one place. This file explains what each document is, who it's for, and exactly where it goes.

---

## Read in this order

| # | File | What It Is | Who Reads It |
|---|---|---|---|
| 1 | `Docs/ServeSmart_SRS.docx` | The full requirements spec — every module, every business rule, non-functional requirements, testing/deployment plan | Everyone, before touching code |
| 2 | `Docs/ServeSmart_Team_Allocation.docx` | Who owns which module, week-by-week plan, dependencies between people | Everyone, right after the SRS |
| 3 | `CONTRIBUTING.md` | How we actually work day-to-day: git branching, local setup, how modules talk to each other, testing before push | Everyone, before your first commit |
| 4 | `Docs/DATABASE_SCHEMA.md` | Every table, every column, the runnable SQL to create them all | Whoever's writing entities/repositories for their module |
| 5 | `Docs/API_SPECIFICATION.md` | Every endpoint, request/response shape, which role can call what | Whoever's writing controllers, or calling someone else's module |

---

## Where each file goes

Two of these files are project documents (read them, don't commit them to the code repo). The rest go directly into the GitHub repo, in the folder structure shown below.

```
ServeSmart/                                  ← your GitHub repo root
├── CONTRIBUTING.md                          ← from Repo-Files/CONTRIBUTING.md
├── docs/
│   ├── API_SPECIFICATION.md                 ← from Repo-Files/docs/
│   └── DATABASE_SCHEMA.md                   ← from Repo-Files/docs/
└── backend/
    └── src/main/resources/
        ├── application.properties           ← from Repo-Files/backend/.../resources/
        └── application-local.properties.example
```

**One setup step for whoever pushes first:** rename `application-local.properties.example` to `application-local.properties`, fill in your own local DB password and a throwaway JWT secret, and confirm `application-local.properties` is listed in `.gitignore` — it should never be committed.

---

## Quick reference — who owns what

| Person | Modules |
|---|---|
| **Mudassar** | Authentication, Order Management, Billing, Inventory |
| **Prashant** | Employee Management, Table Management, Kitchen Dashboard |
| **Bhargwi** | Customer Management, Menu Management, Customer Feedback |
| **Nikhil** | Supplier, Reports & Analytics, Notifications |

Full detail — backend/frontend task breakdown per module, weekly schedule, cross-person dependencies — is in `ServeSmart_Team_Allocation.docx`.

---

## If something's unclear

- **"What does this endpoint expect?"** → `docs/API_SPECIFICATION.md`
- **"What columns does this table have?"** → `docs/DATABASE_SCHEMA.md`
- **"How do I call another module's code?"** → `CONTRIBUTING.md`, Section 6
- **"Who do I ask if I'm blocked?"** → `CONTRIBUTING.md`, Section 7 (Dependencies to Watch), or the Team Allocation doc
- **"What's actually in scope for this build?"** → `ServeSmart_SRS.docx`, Section 1.2
