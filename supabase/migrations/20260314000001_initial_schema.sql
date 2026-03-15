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
