# Vehicle Incidents Management Application

A full-stack system for tracking, reporting, and managing vehicle incidents inside a fleet management platform.

---

## Features
- **Create & edit incident reports**
- **Status/severity/type workflows**
- **Comments & activity updates**
- **Image & document uploads (Cloudinary)**
- **Filtering, search & pagination**
- **Analytics dashboard (status, severity, trends)**
- **React Query caching & optimistic UX**
- **Responsive Design**: Optimized for various devices with a responsive user interface.
## Tech Stack
**Framework**: Next.js 15 (App Router, TypeScript, Turbopack)
**API**: Next.js Route Handlers (REST-style)
**DB / ORM**: PostgreSQL (Neon) + Prisma
**State / Data**: TanStack Query (React Query)
**UI**: Tailwind CSS + shadcn/ui + lucide-react
**Uploads**: Cloudinary (unsigned preset)
**Deployment**: Vercel

---

## Project Structure

- `app/`
  - `api/incidents/` – REST-like routes (list, detail, updates)
  - `fleetmanager/incidents/` – UI pages: list, create, edit, detail, stats
- `components/`
  - `ui/` – Reusable UI primitives
  - `incidents-table.tsx`, `IncidentForm.tsx`, `IncidentDetail.tsx`, `IncidentStats.tsx`, `providers.tsx`
- `lib/` – `utils.ts`, `api-client.ts`, `query-keys.ts`, `validations/incidents.ts`, `queries/incidents.ts`
- `prisma/schema.prisma`
- `public/`
- `next.config.ts`


## Live Demo
The application is deployed and accessible at:
**[Deployed URL](https://vehicle-incidents-management-system-nine.vercel.app/fleetmanager/incidents)**

---

## AI-Assisted Development:
AI tools, including ChatGPT, Claude.AI, and V0 by Vercel, played a crucial role in this project

---
## Prerequisites
Node.js installed on your local machine.
Git installed for version control.
A PostgreSQL database (e.g., Neon free tier)
---

## Installation
Clone the Repository
Clone the repository and navigate into it:

git clone https://github.com/CalypsoJeff/Vehicle-Incidents-Management-System.git
cd .\fleet-incidents\


Create a .env file and add the necessary environment variables. 
Example:
# --- Database (Neon) ---

DATABASE_URL="postgresql://USER:PASSWORD@HOST/db?sslmode=require"

# --- Cloudinary (client-side unsigned uploads) ---

NEXT_PUBLIC_CLOUDINARY_CLOUD="your-cloud-name"         # e.g. dq7s9rmea
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="unsigned_preset" # unsigned preset name

# ---Prisma client & database ---

npx prisma generate         # build Prisma Client
npx prisma db push          # create tables in your DB
# npx prisma studio        # (optional) open Prisma Studio

# --- Run the dev server ---

npm run dev


# ---API Endpoints ---

**GET /api/incidents** — list incidents (supports filters & pagination)

**POST /api/incidents** — create incident

**GET /api/incidents/[id]** — get incident details

**PUT /api/incidents/[id]** — update incident

**POST /api/incidents/[id]/updates** — add a comment/update

# ---Frontend Routes ----

**/fleetmanager/incidents** — table list + filters

**/fleetmanager/incidents/new** — create form (multi-step)

**/fleetmanager/incidents/[id]** — detail page (attachments, comments, preview)

**/fleetmanager/incidents/stats** — analytics dashboard


Contributing
Contributions are welcome! 
Feel free to fork the repository and submit a pull request.
