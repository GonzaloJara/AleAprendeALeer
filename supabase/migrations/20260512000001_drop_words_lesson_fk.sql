-- Drop the FK constraint between words.lesson_id and lessons.id.
-- Ordering is enforced at the application level; the constraint only causes
-- race conditions when the REST API upserts both tables concurrently.
ALTER TABLE words DROP CONSTRAINT IF EXISTS words_lesson_id_fkey;
