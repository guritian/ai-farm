-- ============================================
-- Fix Guestbook RLS Policies
-- ============================================
-- Problem: Admin panel cannot see all messages because
--          RLS policy only allows reading approved messages
-- Solution: Allow reading all messages (frontend filters for public)
-- 
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop existing restrictive policies
DROP POLICY IF EXISTS "public_read_approved_guestbook" ON guestbook;
DROP POLICY IF EXISTS "admin_full_access_guestbook" ON guestbook;
DROP POLICY IF EXISTS "public_read_all_guestbook" ON guestbook;
DROP POLICY IF EXISTS "public_update_guestbook" ON guestbook;
DROP POLICY IF EXISTS "public_delete_guestbook" ON guestbook;

-- Step 2: Create new permissive policies

-- Allow reading ALL messages (frontend filters approved for public)
CREATE POLICY "public_read_all_guestbook"
ON guestbook FOR SELECT
USING (true);

-- Allow public to update messages (for admin operations)
CREATE POLICY "public_update_guestbook"
ON guestbook FOR UPDATE
USING (true);

-- Allow public to delete messages (for admin operations)
CREATE POLICY "public_delete_guestbook"
ON guestbook FOR DELETE
USING (true);

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'guestbook';

-- ============================================
-- Done! The admin panel should now see all messages.
-- ============================================
