-- Correction : friendships doit référencer profiles(id) au lieu de auth.users(id)
-- pour que les joins Supabase récupèrent bien le username

ALTER TABLE friendships DROP CONSTRAINT IF EXISTS friendships_requester_id_fkey;
ALTER TABLE friendships DROP CONSTRAINT IF EXISTS friendships_addressee_id_fkey;

ALTER TABLE friendships
  ADD CONSTRAINT friendships_requester_id_fkey
    FOREIGN KEY (requester_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE friendships
  ADD CONSTRAINT friendships_addressee_id_fkey
    FOREIGN KEY (addressee_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- S'assurer que tous les utilisateurs ont un profil
INSERT INTO profiles (id)
SELECT id FROM auth.users
ON CONFLICT DO NOTHING;
