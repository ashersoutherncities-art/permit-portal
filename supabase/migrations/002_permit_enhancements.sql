-- Migration: Permit Portal Dashboard Enhancements
-- Changes: reference_number, estimated_completion_date, priority, days_in_queue, admin_timeline, photo_count

ALTER TABLE permits ADD COLUMN IF NOT EXISTS reference_number TEXT;
ALTER TABLE permits ADD COLUMN IF NOT EXISTS estimated_completion_date DATE;
ALTER TABLE permits ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE permits ADD COLUMN IF NOT EXISTS days_in_queue INTEGER;
ALTER TABLE permits ADD COLUMN IF NOT EXISTS admin_timeline JSONB DEFAULT '[]';
ALTER TABLE permits ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0;
