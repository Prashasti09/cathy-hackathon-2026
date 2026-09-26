# StockSense

Inventory Management System — Hyderabad Hackathon 2026.
React (frontend) + Node/Express (backend) + PostgreSQL (database).

## Team and ownership

| Person | GitHub | Part | Owns |
|---|---|---|---|
| Prashasti (leader) | Prashasti09 | P | `frontend/` pages, components, styles, app setup; README |
| Devesh | kurozadev05 | D | `backend/` database, server, routes, controllers, auth |
| Anmol | code-by-anmol | A | `backend/src/services/` (stock logic), `frontend/src/api`, `context`, `utils` |

Every code file starts with a comment naming its owner. Edit only your own
files; tell the owner before changing theirs.

## Run it

    # database (once)
    psql -U postgres -c "CREATE DATABASE stocksense;"

    # backend  (terminal 1)
    cd backend
    cp .env.example .env        # put your Postgres password in .env
    npm install
    psql -U postgres -d stocksense -f db/schema.sql
    psql -U postgres -d stocksense -f db/seed.sql
    npm run dev                 # http://localhost:4000

    # frontend (terminal 2)
    cd frontend
    cp .env.example .env
    npm install
    npm run dev                 # http://localhost:5173

Demo login: `admin` / `admin123`. Password-reset OTPs print in the backend terminal.

## How the pieces connect

A click in the frontend (P) calls a function in `frontend/src/api` (A), which
sends a request to a backend route and controller (D). When stock must change,
the controller calls `backend/src/services` (A), which updates the database (D).
The `operations` table holds receipts (WH/IN/…), deliveries (WH/OUT/…),
transfers (WH/INT/…) and adjustments (WH/ADJ/…); `operation_lines` holds their
products. Move History is the lines of those operations.

## Pushing (everyone on `main`)

    git pull --rebase origin main
    git add .
    git commit -m "what you changed"
    git pull --rebase origin main
    git push origin main

Never use `git push --force`.
