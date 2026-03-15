-- ============================================================
-- Portal do Esporte — Seed: Fontes RSS
-- Sites das federações gaúchas para scraping de notícias
-- NOTA: URLs são especulativas — verificar e atualizar antes de usar
-- ============================================================

INSERT INTO fontes_rss (nome, url_site, url_rss, esporte_id, ativo) VALUES
  (
    'Federação Gaúcha de Futebol (FGF)',
    'https://www.fgf.com.br',
    'https://www.fgf.com.br/feed',  -- especulativo
    (SELECT id FROM esportes WHERE slug = 'futebol'),
    false  -- inativo até validar URL do RSS
  ),
  (
    'Federação Gaúcha de Basquetebol (FGB)',
    'https://www.fgb.com.br',
    null,  -- verificar se tem RSS
    (SELECT id FROM esportes WHERE slug = 'basquete'),
    false
  ),
  (
    'Federação Gaúcha de Voleibol (FGV)',
    'https://www.fgv.com.br',
    null,  -- verificar se tem RSS
    (SELECT id FROM esportes WHERE slug = 'volei'),
    false
  ),
  (
    'Federação Gaúcha de Atletismo (FGA)',
    'https://www.fga.com.br',
    null,  -- verificar se tem RSS
    (SELECT id FROM esportes WHERE slug = 'atletismo'),
    false
  ),
  (
    'Federação Gaúcha de Natação (FGN)',
    'https://www.fgn.com.br',
    null,
    (SELECT id FROM esportes WHERE slug = 'natacao'),
    false
  ),
  (
    'Federação Gaúcha de Ciclismo (FGCi)',
    'https://www.fgci.com.br',
    null,
    (SELECT id FROM esportes WHERE slug = 'ciclismo'),
    false
  ),
  (
    'Federação Gaúcha de Judô (FGJ)',
    'https://www.fgj.com.br',
    null,
    (SELECT id FROM esportes WHERE slug = 'judo'),
    false
  ),
  (
    'Federação Gaúcha de Handebol (FGH)',
    'https://www.fgh.com.br',
    null,
    (SELECT id FROM esportes WHERE slug = 'handebol'),
    false
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- IMPORTANTE: Antes de ativar cada fonte (ativo = true):
-- 1. Verificar se o site existe e está acessível
-- 2. Confirmar a URL do RSS feed (ou configurar scraping HTML)
-- 3. Verificar termos de uso do site
-- 4. Testar no n8n antes de ativar em produção
--
-- Para ativar uma fonte:
-- UPDATE fontes_rss SET ativo = true, url_rss = 'url-real' WHERE nome = '...';
-- ============================================================
