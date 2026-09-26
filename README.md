# StockSense

Inventory Management System — Hyderabad Hackathon 2026.
Stack: React (frontend) + Node/Express (backend) + PostgreSQL (database).

## Team and ownership

| Person | GitHub | Owns |
|---|---|---|
| Prashiti (leader) | prashasti09 | `frontend/` pages, components, styles |
| Devesh | kurozadev05 | `backend/db`, `routes`, `controllers`, `config`, `middleware` |
| Anmol | code-by-anmol | `backend/src/services`, `frontend/src/api`, `context`, `utils` |

Every file starts with a comment saying who owns it. Edit only your own
files; if you need to change someone else's file, tell them first.

## How to push (everyone works on `main`)

    git pull --rebase origin main
    # make your changes and test them
    git add .
    git commit -m "short message about what you did"
    git pull --rebase origin main
    git push origin main

Never use `git push --force`.
