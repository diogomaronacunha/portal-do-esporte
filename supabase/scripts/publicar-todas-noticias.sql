-- ============================================================
-- PASSO 1: Limpar todas as notícias existentes
-- Execute este bloco ANTES de reimportar pelo n8n
-- ============================================================

DELETE FROM noticias;

-- ============================================================
-- PASSO 2: Publicar todas as notícias pendentes
-- Execute este bloco APÓS o n8n reimportar tudo
-- Substitua o UUID abaixo pelo seu user id de admin:
--   c38d8a23-538a-4052-8722-71261a5fe887
-- ============================================================

UPDATE noticias
SET
  status       = 'publicado',
  publicado_at = now(),
  aprovado_por = 'c38d8a23-538a-4052-8722-71261a5fe887'
WHERE status = 'pendente';

-- Confirmar quantas foram publicadas
SELECT
  COUNT(*)                                        AS total,
  COUNT(*) FILTER (WHERE status = 'publicado')    AS publicadas,
  COUNT(*) FILTER (WHERE status = 'pendente')     AS pendentes,
  COUNT(*) FILTER (WHERE imagem_url IS NOT NULL)  AS com_imagem,
  COUNT(*) FILTER (WHERE imagem_url IS NULL)      AS sem_imagem
FROM noticias;
