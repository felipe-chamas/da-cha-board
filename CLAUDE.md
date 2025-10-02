# CLAUDE CONTEXT: Da-Cha-Board

CRITICAL: "taimeline" & "derlivery" names intentional, never change.

TYPE: Repo generator platform (NOT SaaS). Creates custom dashboard repos per business.
STACK: Next.js 15 + TS + Tailwind + shadcn + Supabase + simple-git + Gitea
ARCH: Each business gets own generated repo. Admin-only platform. Supabase tracks metadata only.

FILES: page.tsx (UI), ProjectGenerator.tsx (form), ProjectList.tsx (list), dashboard-generator.ts (logic), business.ts (types), schema.sql
FLOW: Form → create repo → push Gitea → track Supabase
SERVICES: "taimeline" & "derlivery" selectable
TABLES: generated_projects, project_templates, generation_config

TAIMELINE SERVICE (Complete):
✅ Full appointment scheduling: Calendar views, WhatsApp+Google integration, employee/procedure mgmt, drag-drop, 15min slots, conflict detection, Brazilian phone format
TODO Deploy: Run supabase/schema.sql + setup .env.local + configure webhook + install radix deps
TODO Test: Employee/procedure CRUD, booking flow, WhatsApp bot, calendar navigation

STATUS: ✅ UI/types/schema/generator/Taimeline ⏳ Templates/Gitea/Supabase/Derlivery
SCALE: 5→∞ businesses, each gets full Next.js dashboard repo
META: Token-optimized. ALWAYS update this file on ANY changes to maintain context accuracy.
