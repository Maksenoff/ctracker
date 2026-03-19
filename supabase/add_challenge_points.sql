-- Ajout colonne points aux challenge_types
ALTER TABLE challenge_types ADD COLUMN IF NOT EXISTS points int DEFAULT 100;

-- Points par défi prédéfini (difficulté croissante)
UPDATE challenge_types SET points = 200 WHERE name = 'First Try'    AND is_preset = true;
UPDATE challenge_types SET points = 150 WHERE name = 'Solo'         AND is_preset = true;
UPDATE challenge_types SET points = 150 WHERE name = 'Blind'        AND is_preset = true;
UPDATE challenge_types SET points = 150 WHERE name = 'Speed Run'    AND is_preset = true;
UPDATE challenge_types SET points = 200 WHERE name = 'No Upgrade'   AND is_preset = true;
UPDATE challenge_types SET points = 300 WHERE name = 'Level 1'      AND is_preset = true;
UPDATE challenge_types SET points = 400 WHERE name = 'No Hit'       AND is_preset = true;
UPDATE challenge_types SET points = 600 WHERE name = 'No Damage'    AND is_preset = true;
