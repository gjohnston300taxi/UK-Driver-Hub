# Taxi App - Next.js 14 + Supabase

A modern taxi booking application built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Theme

- **Accent Color**: Taxi Yellow (#FFC400)
- Used sparingly as accents, not large backgrounds

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
taxi-app/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles with CSS variables
├── components/
│   └── ui/
│       └── button.tsx      # shadcn Button component
├── lib/
│   ├── utils.ts            # Utility functions (cn)
│   └── supabase/
│       ├── client.ts       # Client-side Supabase client
│       ├── server.ts       # Server-side Supabase client
│       └── middleware.ts   # Session refresh middleware
├── middleware.ts           # Next.js middleware
├── tailwind.config.ts      # Tailwind config with taxi-yellow
├── components.json         # shadcn/ui config
└── package.json
```

## Architecture Rules

- **Server Components by default**: Use `'use client'` only when needed
- **Supabase SSR**: Use appropriate client (server vs client)
- **RLS Enforced**: Never use service role on client
- **Protected Routes**: Require auth + `onboarding_complete=true`
- **Admin Routes**: Require `role='admin'`
- **Modular Components**: Keep logic DRY
- **Loading/Error States**: Always show feedback

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Adding shadcn/ui Components

```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
```

## Next Steps

1. Set up Supabase database schema
2. Configure Row Level Security (RLS) policies
3. Implement authentication pages
4. Create protected routes
5. Build booking functionality
