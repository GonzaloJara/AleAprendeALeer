-- Users: one row per player profile
CREATE TABLE IF NOT EXISTS users (
  id   TEXT PRIMARY KEY,   -- slug of display name, e.g. 'ale', 'mama'
  name TEXT NOT NULL        -- display name as entered, e.g. 'Ale', 'Mamá'
);

-- Lesson progress: one row per (user × lesson) completion
CREATE TABLE IF NOT EXISTS lesson_progress (
  id           TEXT PRIMARY KEY,          -- '{user_id}_{lesson_id}'
  user_id      TEXT NOT NULL,             -- references users.id (no FK to avoid conflicts)
  lesson_id    TEXT NOT NULL,             -- references lessons.id
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

-- Allow the anon key used by the app to read and write these tables
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all_users"           ON users           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_lesson_progress" ON lesson_progress FOR ALL USING (true) WITH CHECK (true);
