# INSTALLATION GUIDE

## Exact Install Commands

### Step 1: Navigate to Project
```bash
cd taxi-app
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs all packages from package.json:
- next@14.1.0
- react@18.2.0  
- react-dom@18.2.0
- typescript@5.3.3
- tailwindcss@3.4.1
- @supabase/supabase-js@2.39.3
- @supabase/ssr@0.5.2
- zod@3.22.4
- react-hook-form@7.50.0
- @hookform/resolvers@3.3.4
- lucide-react@0.312.0
- shadcn/ui dependencies (radix-ui, class-variance-authority, etc.)

### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Run Development Server
```bash
npm run dev
```

### Step 5: Open Browser
Navigate to: http://localhost:3000

---

## File Tree After Setup

```
taxi-app/
├── .env.example              # Environment variables template
├── .env.local                # Your local environment (gitignored)
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore rules
├── INSTALL.sh                # Installation script
├── README.md                 # Project documentation
├── components.json           # shadcn/ui configuration
├── middleware.ts             # Next.js middleware for auth
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies and scripts
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.ts        # Tailwind with taxi-yellow theme
├── tsconfig.json             # TypeScript configuration
│
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with fonts
│   ├── page.tsx              # Home page (taxi-yellow themed)
│   └── globals.css           # Global styles + CSS variables
│
├── components/               # React components
│   └── ui/
│       └── button.tsx        # shadcn/ui Button component
│
└── lib/                      # Utilities and helpers
    ├── utils.ts              # cn() utility for class merging
    └── supabase/
        ├── client.ts         # Client-side Supabase client
        ├── server.ts         # Server-side Supabase client
        └── middleware.ts     # Supabase session middleware
```

---

## Tailwind Configuration

The taxi-yellow theme is configured in `tailwind.config.ts`:

```typescript
colors: {
  'taxi-yellow': '#FFC400',  // Main accent color
  primary: 'hsl(45 100% 50%)', // HSL version for shadcn
}
```

Usage:
- `text-taxi-yellow` - Yellow text
- `bg-taxi-yellow` - Yellow background (use sparingly!)
- `border-taxi-yellow` - Yellow border
- `hover:bg-taxi-yellow/90` - Hover with 90% opacity

---

## shadcn/ui Configuration

To add more components:

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
```

All components will automatically use the taxi-yellow theme.

---

## Supabase Setup

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Wait for setup to complete

### 2. Get Credentials
1. Go to Project Settings > API
2. Copy "Project URL" 
3. Copy "anon public" key

### 3. Add to .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Database Schema (Example)
```sql
-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## Project Architecture

### Server Components (Default)
- All components in `app/` are Server Components
- Can directly fetch data from Supabase
- No need for `'use client'`

### Client Components (When Needed)
Use `'use client'` for:
- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, etc.)
- Browser APIs
- Interactive forms

### Supabase Usage

**Server Components:**
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()
  return <div>{data}</div>
}
```

**Client Components:**
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export function Component() {
  const supabase = createClient()
  // Use in event handlers
}
```

---

## Running the App

### Development
```bash
npm run dev
```
Opens on http://localhost:3000 with hot reload

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

---

## Theme Showcase

The home page demonstrates the taxi-yellow theme:
- Yellow accents on buttons and icons
- Hover effects with yellow
- Black backgrounds with yellow highlights
- Minimal yellow backgrounds (only small badges/icons)

Visit http://localhost:3000 after setup to see it in action!
