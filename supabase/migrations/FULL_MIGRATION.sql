-- ============================================================
-- Portal do Esporte — Schema Inicial (MVP Fase 1)
-- Defensivo: suporta bancos com tabelas pré-existentes
-- ============================================================

-- Trigger helper: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PROFILES — estende auth.users do Supabase
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Criar perfil automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nome, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ESPORTES — categorias
-- ============================================================
CREATE TABLE IF NOT EXISTS esportes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icone_url   TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_esportes_slug ON esportes(slug);
CREATE INDEX IF NOT EXISTS idx_esportes_ativo ON esportes(ativo);

-- ============================================================
-- FONTES RSS — sites das federações para scraping
-- ============================================================
CREATE TABLE IF NOT EXISTS fontes_rss (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                TEXT NOT NULL,
  url_site            TEXT NOT NULL,
  url_rss             TEXT,
  esporte_id          UUID REFERENCES esportes(id) ON DELETE SET NULL,
  ativo               BOOLEAN NOT NULL DEFAULT true,
  ultimo_scraping_at  TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS fontes_rss_updated_at ON fontes_rss;
CREATE TRIGGER fontes_rss_updated_at
  BEFORE UPDATE ON fontes_rss
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_fontes_rss_ativo ON fontes_rss(ativo);

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- NOTICIAS
-- ============================================================
CREATE TABLE IF NOT EXISTS noticias (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  resumo       TEXT,
  conteudo     TEXT,
  imagem_url   TEXT,
  fonte_nome   TEXT NOT NULL,
  fonte_url    TEXT NOT NULL,
  esporte_id   UUID REFERENCES esportes(id) ON DELETE SET NULL,
  autor_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status       TEXT NOT NULL DEFAULT 'pendente'
                 CHECK (status IN ('pendente', 'publicado', 'rejeitado')),
  publicado_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS noticias_updated_at ON noticias;
CREATE TRIGGER noticias_updated_at
  BEFORE UPDATE ON noticias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_noticias_slug      ON noticias(slug);
CREATE INDEX IF NOT EXISTS idx_noticias_status    ON noticias(status);
CREATE INDEX IF NOT EXISTS idx_noticias_fonte_url ON noticias(fonte_url);

-- ============================================================
-- NOTICIAS_TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS noticias_tags (
  noticia_id UUID NOT NULL REFERENCES noticias(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (noticia_id, tag_id)
);

-- ============================================================
-- EVENTOS — defensivo: adiciona colunas se tabela já existir
-- ============================================================
CREATE TABLE IF NOT EXISTS eventos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar colunas do Portal do Esporte se não existirem
DO $$ BEGIN
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS slug TEXT;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS descricao TEXT;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS imagem_url TEXT;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS data_inicio DATE;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS data_fim DATE;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS hora_inicio TIME;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS hora_fim TIME;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS local_nome TEXT;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS local_endereco TEXT;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS local_cidade TEXT DEFAULT 'Porto Alegre';
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS local_estado TEXT DEFAULT 'RS';
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS esporte_id UUID REFERENCES esportes(id) ON DELETE SET NULL;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS organizador_nome TEXT;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS organizador_contato TEXT;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS gratuito BOOLEAN DEFAULT true;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS url_inscricao TEXT;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS criado_por UUID REFERENCES profiles(id) ON DELETE SET NULL;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES profiles(id) ON DELETE SET NULL;
  ALTER TABLE eventos ADD COLUMN IF NOT EXISTS aprovado_at TIMESTAMPTZ;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Erro ao adicionar colunas em eventos: %', SQLERRM;
END $$;

-- Garantir unique constraint no slug (eventos portal)
DO $$ BEGIN
  ALTER TABLE eventos ADD CONSTRAINT eventos_slug_unique UNIQUE (slug);
EXCEPTION WHEN duplicate_table THEN
  NULL; -- constraint já existe
END $$;

DROP TRIGGER IF EXISTS eventos_updated_at ON eventos;
CREATE TRIGGER eventos_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_eventos_status  ON eventos(status);
CREATE INDEX IF NOT EXISTS idx_eventos_esporte ON eventos(esporte_id);

-- ============================================================
-- ATLETAS
-- ============================================================
CREATE TABLE IF NOT EXISTS atletas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  foto_url     TEXT,
  bio          TEXT,
  esportes     TEXT[] NOT NULL DEFAULT '{}',
  cidade       TEXT,
  estado       TEXT NOT NULL DEFAULT 'RS',
  clube_nome   TEXT,
  conquistas   TEXT,
  instagram_url TEXT,
  facebook_url  TEXT,
  status       TEXT NOT NULL DEFAULT 'pendente'
                 CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  criado_por   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  aprovado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  aprovado_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS atletas_updated_at ON atletas;
CREATE TRIGGER atletas_updated_at
  BEFORE UPDATE ON atletas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_atletas_slug   ON atletas(slug);
CREATE INDEX IF NOT EXISTS idx_atletas_status ON atletas(status);

-- ============================================================
-- CLUBES
-- ============================================================
CREATE TABLE IF NOT EXISTS clubes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  logo_url     TEXT,
  descricao    TEXT,
  esporte_id   UUID REFERENCES esportes(id) ON DELETE SET NULL,
  cidade       TEXT,
  estado       TEXT NOT NULL DEFAULT 'RS',
  fundado_em   INT,
  site_url     TEXT,
  instagram_url TEXT,
  status       TEXT NOT NULL DEFAULT 'pendente'
                 CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  criado_por   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  aprovado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  aprovado_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS clubes_updated_at ON clubes;
CREATE TRIGGER clubes_updated_at
  BEFORE UPDATE ON clubes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_clubes_slug   ON clubes(slug);
CREATE INDEX IF NOT EXISTS idx_clubes_status ON clubes(status);

-- ============================================================
-- CONFIG_SISTEMA
-- ============================================================
CREATE TABLE IF NOT EXISTS config_sistema (
  chave      TEXT PRIMARY KEY,
  valor      TEXT NOT NULL,
  descricao  TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO config_sistema (chave, valor, descricao) VALUES
  ('site_nome',            'Portal do Esporte',                     'Nome do portal'),
  ('site_descricao',       'O esporte amador gaúcho em um só lugar', 'Descrição do portal'),
  ('site_estado_foco',     'RS',                                    'Estado de foco'),
  ('aprovacao_automatica', 'false',                                 'Publicação sem aprovação manual')
ON CONFLICT (chave) DO NOTHING;
-- ============================================================
-- Portal do Esporte — Políticas RLS
-- Row Level Security para todos os módulos
-- ============================================================

-- Helper: verifica se o usuário atual é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid()) -- não pode alterar próprio role
  );

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- ESPORTES
-- ============================================================
ALTER TABLE esportes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "esportes_select_public"
  ON esportes FOR SELECT
  USING (ativo = true);

CREATE POLICY "esportes_select_admin"
  ON esportes FOR SELECT
  USING (is_admin());

CREATE POLICY "esportes_insert_admin"
  ON esportes FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "esportes_update_admin"
  ON esportes FOR UPDATE
  USING (is_admin());

CREATE POLICY "esportes_delete_admin"
  ON esportes FOR DELETE
  USING (is_admin());

-- ============================================================
-- FONTES RSS
-- ============================================================
ALTER TABLE fontes_rss ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fontes_rss_admin_all"
  ON fontes_rss FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- n8n usa service_role key (bypass RLS)

-- ============================================================
-- TAGS
-- ============================================================
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_select_public"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "tags_write_admin"
  ON tags FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "tags_update_admin"
  ON tags FOR UPDATE
  USING (is_admin());

CREATE POLICY "tags_delete_admin"
  ON tags FOR DELETE
  USING (is_admin());

-- ============================================================
-- NOTICIAS
-- ============================================================
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;

-- Público vê apenas publicadas
CREATE POLICY "noticias_select_publicadas"
  ON noticias FOR SELECT
  USING (status = 'publicado');

-- Admin vê tudo
CREATE POLICY "noticias_select_admin"
  ON noticias FOR SELECT
  USING (is_admin());

-- Admin pode inserir/atualizar/deletar
CREATE POLICY "noticias_write_admin"
  ON noticias FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "noticias_update_admin"
  ON noticias FOR UPDATE
  USING (is_admin());

CREATE POLICY "noticias_delete_admin"
  ON noticias FOR DELETE
  USING (is_admin());

-- Nota: n8n usa service_role key (bypass RLS) para inserir notícias via scraping

-- ============================================================
-- NOTICIAS_TAGS
-- ============================================================
ALTER TABLE noticias_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "noticias_tags_select_public"
  ON noticias_tags FOR SELECT
  USING (true);

CREATE POLICY "noticias_tags_write_admin"
  ON noticias_tags FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "noticias_tags_delete_admin"
  ON noticias_tags FOR DELETE
  USING (is_admin());

-- ============================================================
-- EVENTOS
-- ============================================================
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Público vê apenas aprovados
CREATE POLICY "eventos_select_aprovados"
  ON eventos FOR SELECT
  USING (status = 'aprovado');

-- Admin vê tudo
CREATE POLICY "eventos_select_admin"
  ON eventos FOR SELECT
  USING (is_admin());

-- Usuário logado pode cadastrar (cria como pendente)
CREATE POLICY "eventos_insert_authenticated"
  ON eventos FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND status = 'pendente'
  );

-- Usuário pode atualizar seu próprio evento pendente
CREATE POLICY "eventos_update_own_pending"
  ON eventos FOR UPDATE
  USING (
    auth.uid() = criado_por
    AND status = 'pendente'
  );

-- Admin pode atualizar qualquer evento
CREATE POLICY "eventos_update_admin"
  ON eventos FOR UPDATE
  USING (is_admin());

-- Usuário pode deletar seu próprio evento pendente
CREATE POLICY "eventos_delete_own_pending"
  ON eventos FOR DELETE
  USING (
    auth.uid() = criado_por
    AND status = 'pendente'
  );

-- Admin pode deletar qualquer evento
CREATE POLICY "eventos_delete_admin"
  ON eventos FOR DELETE
  USING (is_admin());

-- ============================================================
-- ATLETAS
-- ============================================================
ALTER TABLE atletas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "atletas_select_aprovados"
  ON atletas FOR SELECT
  USING (status = 'aprovado');

CREATE POLICY "atletas_select_admin"
  ON atletas FOR SELECT
  USING (is_admin());

CREATE POLICY "atletas_insert_authenticated"
  ON atletas FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND status = 'pendente'
  );

CREATE POLICY "atletas_update_own_pending"
  ON atletas FOR UPDATE
  USING (
    auth.uid() = criado_por
    AND status = 'pendente'
  );

CREATE POLICY "atletas_update_admin"
  ON atletas FOR UPDATE
  USING (is_admin());

CREATE POLICY "atletas_delete_admin"
  ON atletas FOR DELETE
  USING (is_admin());

-- ============================================================
-- CLUBES
-- ============================================================
ALTER TABLE clubes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clubes_select_aprovados"
  ON clubes FOR SELECT
  USING (status = 'aprovado');

CREATE POLICY "clubes_select_admin"
  ON clubes FOR SELECT
  USING (is_admin());

CREATE POLICY "clubes_insert_authenticated"
  ON clubes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND status = 'pendente'
  );

CREATE POLICY "clubes_update_own_pending"
  ON clubes FOR UPDATE
  USING (
    auth.uid() = criado_por
    AND status = 'pendente'
  );

CREATE POLICY "clubes_update_admin"
  ON clubes FOR UPDATE
  USING (is_admin());

CREATE POLICY "clubes_delete_admin"
  ON clubes FOR DELETE
  USING (is_admin());

-- ============================================================
-- CONFIG_SISTEMA
-- ============================================================
ALTER TABLE config_sistema ENABLE ROW LEVEL SECURITY;

-- Configurações públicas são legíveis por todos
CREATE POLICY "config_select_public"
  ON config_sistema FOR SELECT
  USING (true);

CREATE POLICY "config_write_admin"
  ON config_sistema FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
-- ============================================================
-- Portal do Esporte — Seed: Esportes
-- Modalidades mais praticadas no Rio Grande do Sul
-- ============================================================

INSERT INTO esportes (nome, slug, ativo) VALUES
  ('Futebol',          'futebol',          true),
  ('Futsal',           'futsal',           true),
  ('Vôlei',            'volei',            true),
  ('Beach Vôlei',      'beach-volei',      true),
  ('Basquete',         'basquete',         true),
  ('Handebol',         'handebol',         true),
  ('Atletismo',        'atletismo',        true),
  ('Corrida de Rua',   'corrida-de-rua',   true),
  ('Natação',          'natacao',          true),
  ('Ciclismo',         'ciclismo',         true),
  ('Triathlon',        'triathlon',        true),
  ('Tênis',            'tenis',            true),
  ('Tênis de Mesa',    'tenis-de-mesa',    true),
  ('Judô',             'judo',             true),
  ('Karatê',           'karate',           true),
  ('Boxe',             'boxe',             true),
  ('Jiu-Jitsu',        'jiu-jitsu',        true),
  ('Rugby',            'rugby',            true),
  ('Futebol Americano','futebol-americano', true),
  ('Padel',            'padel',            true),
  ('Squash',           'squash',           true),
  ('Ginástica',        'ginastica',        true),
  ('Xadrez',           'xadrez',           true),
  ('E-Sports',         'e-sports',         true),
  ('Outros',           'outros',           true)
ON CONFLICT (slug) DO NOTHING;
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
-- Trigger para criar perfil automaticamente quando um usuário faz login
-- (Supabase Auth → tabela profiles)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
