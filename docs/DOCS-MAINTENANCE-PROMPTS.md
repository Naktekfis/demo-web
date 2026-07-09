schema_version: 1

# Docs Maintenance Prompts

Source of truth: `docs/prd-itbinsight.md`

Related docs: `docs/IMPLEMENTATION-GUIDE.md`, `docs/MVP-SCOPE.md`, `docs/API-CONTRACTS.md`, `docs/SUPABASE-SCHEMA-PLAN.md`, `docs/DATA-MODEL.md`

Audience: project owner and contributors who want the documentation to stay in sync with implementation changes.

## Purpose

Use this file when you want to ask an AI assistant to audit, rewrite, or synchronize repository docs after code or product decisions change.

The safest pattern is: tell the assistant to inspect the repo first, compare docs against current code, update only stale docs, and verify the result.

## Default Prompt

Use this for general documentation sync:

```text
Audit docs /docs dan sinkronkan dengan kode terbaru + docs/prd-itbinsight.md.

Tugas:
1. Inventory semua docs di /docs.
2. Cek apakah ada docs yang stale, kontradiktif, atau belum mengikuti implementasi terbaru.
3. Cek kode/routes/API/schema terbaru, jangan cuma percaya docs lama.
4. Update docs yang perlu diubah.
5. Kalau ada keputusan yang belum pasti, tandai sebagai Open Decision, jangan nebak.
6. Jangan ubah README kecuali ada mismatch besar.
7. Cross-check istilah/status/endpoint/table antar docs.
8. Run npm run build.
9. Beri ringkasan file yang diubah, keputusan docs, dan hal yang masih perlu dikonfirmasi.
```

## Short Prompt

Use this when you want the same result but shorter:

```text
Audit docs /docs dan sinkronkan dengan kode terbaru + docs/prd-itbinsight.md. Update yang stale, cross-check status/route/API/schema, jangan ubah README kecuali perlu, lalu run npm run build.
```

## Feature Update Prompt

Use this after implementing or changing one feature:

```text
Aku baru update [FITUR]. Tolong update docs terkait agar sinkron.

Yang berubah:
- [jelaskan perubahan singkat]
- [route/API/schema/status baru]
- [flow user/admin yang berubah]

Tolong:
1. Cari docs yang terdampak.
2. Update docs yang perlu.
3. Cross-check semua docs agar tidak kontradiktif.
4. Run npm run build.
5. Ringkas perubahan dan open decisions.
```

## Payment Prompt

Use this after changing mock payment or Midtrans behavior:

```text
Aku baru implement/update payment. Tolong sinkronkan docs payment, API contracts, schema plan, admin dashboard, registration flows, dan implementation guide dengan kode terbaru.

Wajib cek:
- payment_status
- registration_status
- payments dan midtrans_transactions schema
- endpoint payment
- dashboard user payment CTA
- admin payment visibility

Jangan cuma percaya docs lama; cek kode/routes/schema terbaru. Run npm run build setelah edit.
```

## Admin Dashboard Prompt

Use this after changing admin pages or admin APIs:

```text
Aku baru update admin dashboard. Tolong sinkronkan docs/admin, API contracts, implementation guide, dan schema plan dengan kode terbaru.

Wajib cek:
- /admin routes
- admin API routes
- registration search/filter/export
- status update behavior
- QR check-in behavior
- payment visibility jika ada

Update docs yang stale, cross-check kontradiksi, lalu run npm run build.
```

## Supabase Schema Prompt

Use this after changing migrations, tables, RLS, or data access:

```text
Aku baru update Supabase schema/migration. Tolong sinkronkan docs/SUPABASE-SCHEMA-PLAN.md, docs/DATA-MODEL.md, docs/API-CONTRACTS.md, dan docs/IMPLEMENTATION-GUIDE.md dengan schema terbaru.

Wajib cek:
- migrations terbaru
- table names
- fields dan constraints
- RLS assumptions
- API yang membaca/menulis tabel itu
- legacy table references yang harus dibersihkan

Update docs yang stale, cross-check semua table/status/endpoint, lalu run npm run build.
```

## Registration Flow Prompt

Use this after changing individual/team registration behavior:

```text
Aku baru update registration flow. Tolong sinkronkan docs/REGISTRATION-FLOWS.md, docs/API-CONTRACTS.md, docs/DATA-MODEL.md, docs/ADMIN-DASHBOARD.md, dan docs/IMPLEMENTATION-GUIDE.md dengan kode terbaru.

Wajib cek:
- individual registration
- team create/join/leave/remove/submit
- team UID behavior
- registration_status
- dashboard display
- admin review behavior

Update docs yang stale, cross-check kontradiksi, lalu run npm run build.
```

## Public UI And Dashboard UX Prompt

Use this after changing header navigation, public page visibility, or participant dashboard UX:

```text
Aku baru update public UI/dashboard UX. Tolong sinkronkan docs/IMPLEMENTATION-GUIDE.md, docs/MVP-SCOPE.md, docs/REGISTRATION-FLOWS.md, dan docs/IMPLEMENTATION-GAP.md dengan kode terbaru.

Wajib cek:
- header nav desktop dan mobile
- visibility Dashboard untuk guest vs logged-in user
- route protection `/dashboard*`
- status Berita/Galeri apakah hidden, placeholder, redirect, atau published
- dashboard first-screen UX dan next actions

Update docs yang stale, cross-check kontradiksi, lalu run npm run build.
```

## Rules For The Assistant

When using any prompt above, the assistant should follow these rules:

- Treat `docs/prd-itbinsight.md` as product source of truth.
- Treat current code and migrations as implementation truth.
- Do not invent commands, paths, tables, routes, or statuses.
- Mark unclear decisions as `Open Decision`.
- Keep `README.md` unchanged unless it has a major mismatch.
- Prefer small targeted edits over rewriting every doc.
- Run `npm run build` after documentation updates.
- Mention if doc lint was skipped because no doc lint config exists.
