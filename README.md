# Da-Cha-Board

Multi-tenant admin dashboard for small businesses with customizable services.

## Features

- **Multi-tenant architecture** with business isolation
- **Supabase authentication** and database
- **Brand customization** (colors, logos)
- **Role-based access control** (owner/employee)
- **Modular services** (Timeline, Delivery)
- **Modern UI** with shadcn/ui components

## Setup

1. **Create Supabase project**

   ```bash
   # Visit https://supabase.com and create a new project
   ```

2. **Set up database**

   ```sql
   # Copy and run supabase/schema.sql in your Supabase SQL editor
   ```

3. **Configure environment**

   ```bash
   # Copy your Supabase keys to .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Install and run**
   ```bash
   npm install
   npm run dev
   ```

## Architecture

```
src/
├── app/                 # Next.js app router
├── components/
│   ├── ui/             # shadcn/ui components
│   └── dashboard/      # Business components
├── lib/                # Utilities and configs
└── types/              # TypeScript definitions
```

## Services

- **Taimeline**: Event scheduling and tracking
- **Derlivery**: Order and route management

Each service is modular and can be enabled per business.

## License

Closed source. Third-party licenses tracked in LICENSES.md.
