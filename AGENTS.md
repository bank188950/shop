# Shop workspace instructions

## Scope and source of truth

- This workspace contains `frontend/`, `backend/`, and `database/`.
- Read this file first, then read the closest applicable instruction file before changing code.
- UI work must follow `design-user.md` for customer routes and `design-admin.md` for admin routes. If an implementation conflicts with a design document, update the design document in the same change or ask for direction.
- `docs/` is the source for approved visual references and brand assets. Do not treat screenshots as reusable UI images; recreate their layout with semantic HTML/CSS and use real, purpose-made assets.

## Frontend

- Keep the React + Vite + TypeScript architecture in `frontend/`; do not introduce a framework migration for feature work.
- Reuse `lucide-react` for interface icons. Do not add unlabelled icon-only controls except where an accessible label is present.
- Make customer pages responsive from 320px wide upward. Preserve keyboard focus states, minimum 44px touch targets where practical, and readable Thai copy.
- Keep UI state functional. Buttons that add products must update the cart; delivery and category controls must expose their selected state.
- Place customer features in `frontend/src/features/customer/`, admin features in `frontend/src/features/admin/`, reusable layout in `frontend/src/layouts/`, and global visual tokens in `frontend/src/styles/index.css`.
- Before handing off frontend changes, run `npm run build` from `frontend/` and fix real compilation failures.

## Backend and database

- Keep secrets in `backend/.env`; never commit it or expose credentials in client code.
- Treat database changes as migrations/schema changes in `database/`, and keep API contracts explicit in backend code.
- Do not change production data, payment behavior, or authentication requirements without explicit approval.

## Quality bar

- Prefer small, coherent patches over unrelated cleanup.
- Preserve user changes in a dirty worktree.
- Validate only the surfaces affected by the change and report any unverified behavior clearly.
