-- Add lessons table and update words to reference it

CREATE TABLE IF NOT EXISTS lessons (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  new_letters TEXT[] NOT NULL DEFAULT '{}',
  sort_order  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lessons' AND policyname = 'public access'
  ) THEN
    CREATE POLICY "public access" ON lessons FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Add lesson_id to words (no-op if already exists)
ALTER TABLE words ADD COLUMN IF NOT EXISTS lesson_id TEXT REFERENCES lessons(id);

-- Drop level column if it exists (replaced by lesson progression)
ALTER TABLE words DROP COLUMN IF EXISTS level;
