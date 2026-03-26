-- Fix: adicionar UNIQUE constraint em noticias.fonte_url
-- Isso previne duplicatas mesmo em race conditions do n8n
-- e substitui o simples INDEX que existia antes.

-- 1. Remover duplicatas, mantendo apenas o registro mais antigo de cada fonte_url
DELETE FROM noticias
WHERE id NOT IN (
  SELECT DISTINCT ON (fonte_url) id
  FROM noticias
  WHERE fonte_url IS NOT NULL
  ORDER BY fonte_url, created_at ASC
)
AND fonte_url IS NOT NULL;

-- 2. Remover o index simples (será substituído pelo UNIQUE)
DROP INDEX IF EXISTS idx_noticias_fonte_url;

-- 3. Adicionar UNIQUE constraint (cria index único automaticamente)
ALTER TABLE noticias
  ADD CONSTRAINT noticias_fonte_url_unique UNIQUE (fonte_url);
