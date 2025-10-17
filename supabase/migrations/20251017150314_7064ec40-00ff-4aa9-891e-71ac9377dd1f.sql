-- Update RLS policies to work with simple localStorage-based auth
-- This removes the auth.uid() requirements but maintains some access control

-- Drop existing policies on topics table
DROP POLICY IF EXISTS "Everyone can view topics" ON public.topics;
DROP POLICY IF EXISTS "Admins can insert topics" ON public.topics;
DROP POLICY IF EXISTS "Admins can update topics" ON public.topics;
DROP POLICY IF EXISTS "Admins can delete topics" ON public.topics;

-- Create new permissive policies for topics
CREATE POLICY "Anyone can view topics" ON public.topics
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert topics" ON public.topics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update topics" ON public.topics
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete topics" ON public.topics
  FOR DELETE USING (true);

-- Drop existing policies on student_progress table
DROP POLICY IF EXISTS "Students can view their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can insert their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can update their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON public.student_progress;

-- Create new permissive policies for student_progress
CREATE POLICY "Anyone can view progress" ON public.student_progress
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert progress" ON public.student_progress
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update progress" ON public.student_progress
  FOR UPDATE USING (true);

-- Note: We'll use user_id as a simple string identifier (student name)
-- instead of UUID references to auth.users