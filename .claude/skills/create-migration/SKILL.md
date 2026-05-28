---
name: create-migration
description: Create a new Supabase database migration for the LandyKE project
disable-model-invocation: true
arguments: [name]
argument-hint: "[migration_name]"
---

Create a new database migration file for the LandyKE project.

## Steps

1. List files in `supabase/migrations/` to determine the next sequential number (zero-padded to 3 digits).
2. Create the file at `supabase/migrations/NNN_$name.sql`.

## Conventions

All tables MUST be in the `landyke` schema. Follow these patterns exactly:

### Table creation
```sql
CREATE TABLE IF NOT EXISTS landyke.table_name (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- columns here
  created_at timestamptz DEFAULT now()
);
```

### Column patterns
- Primary key: `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`
- Timestamps: `created_at timestamptz DEFAULT now()`
- Date fields: `date_field date NOT NULL DEFAULT CURRENT_DATE`
- Foreign keys: `landlord_id uuid NOT NULL REFERENCES landyke.landlords(id) ON DELETE CASCADE`
- Enum-like columns: `status text CHECK (status IN ('value1', 'value2', 'value3'))`
- Optional fields: omit `NOT NULL`

### Altering existing tables
```sql
ALTER TABLE landyke.existing_table ADD COLUMN IF NOT EXISTS new_column type;
```

### Row Level Security (required on every new table)
```sql
ALTER TABLE landyke.table_name ENABLE ROW LEVEL SECURITY;

-- Landlord access (via property ownership chain)
CREATE POLICY "Landlords can view own records"
  ON landyke.table_name FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM landyke.properties WHERE landlord_id = auth.uid()
    )
  );

-- Tenant access (via user_id)
CREATE POLICY "Tenants can view own records"
  ON landyke.table_name FOR SELECT
  USING (user_id = auth.uid());

-- Service role bypass (for admin API routes)
CREATE POLICY "Service role full access"
  ON landyke.table_name FOR ALL
  USING (true) WITH CHECK (true);
```

Only include RLS policies relevant to the table. Not every table needs all three policy types.

### Core tables for reference
- `landyke.landlords` — FK `user_id` to `auth.users(id)`, has `id`, `full_name`, `email`, `phone`
- `landyke.properties` — FK `landlord_id` to landlords, has `name`, `location`, `total_units`
- `landyke.tenants` — FK `property_id` to properties, has `user_id`, `full_name`, `unit_number`, `rent_amount`, `status`
- `landyke.payments` — FK `tenant_id` to tenants, FK `property_id` to properties
