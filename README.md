# Ekemini's Birthday Website

A personal birthday website for Ekemini, built as a warm, interactive space for celebrating her birthday and collecting messages from friends and family.
## What it includes

- A responsive birthday landing page with a hero image and animated typewriter introduction.
- An about section describing Ekemini's focus on growth, hard work, gratitude, and trying new things.
- A birthday wish form for visitors to submit their name and message.
- A private admin dashboard for viewing and deleting submitted wishes.
- Supabase email/password authentication and database storage.
- Reduced-motion support for the celebratory confetti animation.

## Tech stack
- React 19
- Vite
- React Router with hash-based routing
- Tailwind CSS 4
- Supabase
- Oxlint

## Getting started
### Requirements

- Node.js 18 or newer
- A Supabase project, if you want to enable wishes and the admin dashboard
### Install and run

```bash
npm install
npm run dev
```

Vite will print the local development URL in the terminal.

### Environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
```

Restart the development server after changing environment variables. The site still loads without Supabase, but wish submissions and the admin area will remain unavailable.

## Supabase setup

Create a `wishes` table with these columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `name` | `text` | Visitor's name |
| `message` | `text` | Birthday wish |
| `created_at` | `timestamptz` | Default `now()` |

Enable Row Level Security and add policies that allow visitors to submit wishes while keeping wishes private. Authenticated users need read and delete access for the dashboard.

Example policies:

```sql
alter table public.wishes enable row level security;

create policy "Anyone can submit a wish"
on public.wishes for insert
to anon, authenticated
with check (true);

create policy "Authenticated users can read wishes"
on public.wishes for select
to authenticated
using (true);

create policy "Authenticated users can delete wishes"
on public.wishes for delete
to authenticated
using (true);
```

Create an account in Supabase Authentication for the birthday admin. The private dashboard is available at `/#/admin`.

## Available scripts

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run preview   # Preview the production build locally
npm run lint      # Run Oxlint
```

## Project structure

```text
src/
	App.jsx          Application routes
	main.jsx         React entry point and providers
	index.css        Global styles and Tailwind entry point
	pages/
		Home.jsx       Public birthday site and wish form
		Admin.jsx      Protected wishes dashboard
	lib/
		auth.jsx       Supabase authentication context
		supabase.js    Supabase client setup
	assets/          Images used by the site
public/            Static public assets
```

## Routes

- `/` - Public birthday website
- `/#/admin` - Authenticated wishes dashboard
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
