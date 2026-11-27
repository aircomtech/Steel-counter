# Contour Steel CMS & Deployment Guide

## 1. Environment Variables

Configure these environment variables locally (`.env.local`) and in your Vercel Project Settings:

| Variable | Required | Scope | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public | Supabase project anon key |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes | Public | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Yes | Public | Cloudinary unsigned upload preset (or fallback) |
| `SUPABASE_URL` | Optional | Server | Server-side override for Supabase URL |
| `SUPABASE_ANON_KEY` | Optional | Server | Server-side override for Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server only | Never expose to browser |
| `CLOUDINARY_CLOUD_NAME` | Optional | Server | Server-side override for cloud name |
| `CLOUDINARY_UPLOAD_PRESET` | Optional | Server | Server-side override for upload preset |
| `CLOUDINARY_API_KEY` | Optional | Server | Enables signed uploads when paired with secret |
| `CLOUDINARY_API_SECRET` | Optional | Server only | Enables signed uploads; never expose to browser |

## 2. Database Setup (Supabase SQL Editor)

1. Open your Supabase project -> **SQL Editor** -> **New Query**.
2. Run the contents of `supabase/migrations/001_initial_schema.sql` to create all 19 CMS tables, indexes, `updated_at` triggers, and Row Level Security (RLS) policies.
3. Run the contents of `supabase/seed.sql` to populate all existing Contour Steel website content (idempotently — safe to re-run without creating duplicates).

## 3. Create Admin Account

1. Open Supabase Dashboard -> **Authentication** -> **Users** -> **Add user** -> **Create new user**.
2. Enter your admin email and a strong password (and mark email as confirmed).
3. Visit `/admin/login` on your deployed site (or `http://localhost:3000/admin/login` locally) and sign in.

## 4. Vercel Deployment

1. Add the environment variables from Section 1 in Vercel -> **Project Settings** -> **Environment Variables**.
2. Push your code to GitHub (`main` branch). Vercel will automatically run `npm run build` (`next build`).
3. Every change saved in `/admin` writes directly to the database and triggers `/api/revalidate` so the live website updates immediately.
