-- ============================================================
-- Portal do Esporte — Fase 3: Compras Coletivas (Ofertas)
-- ============================================================

-- 1. CATEGORIAS DE OFERTA
CREATE TABLE IF NOT EXISTS categorias_oferta (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  icone      TEXT,
  ativo      BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cat_oferta_slug ON categorias_oferta(slug);

INSERT INTO categorias_oferta (nome, slug, icone) VALUES
  ('Aulas e Cursos', 'aulas-cursos', '🎓'),
  ('Academia e Musculação', 'academia', '💪'),
  ('Personal Trainer', 'personal-trainer', '🏋️'),
  ('Natação', 'natacao', '🏊'),
  ('Artes Marciais', 'artes-marciais', '🥋'),
  ('Esportes Coletivos', 'esportes-coletivos', '⚽'),
  ('Assessoria Esportiva', 'assessoria', '📋'),
  ('Nutrição Esportiva', 'nutricao', '🥗')
ON CONFLICT (slug) DO NOTHING;

-- 2. PRESTADORES DE SERVIÇO (quem publica ofertas)
CREATE TABLE IF NOT EXISTS prestadores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nome_empresa  TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  descricao     TEXT,
  logo_url      TEXT,
  cidade        TEXT,
  estado        TEXT NOT NULL DEFAULT 'RS',
  whatsapp      TEXT,
  instagram     TEXT,
  website       TEXT,
  status        TEXT NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'suspenso')),
  aprovado_por  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  aprovado_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS prestadores_updated_at ON prestadores;
CREATE TRIGGER prestadores_updated_at
  BEFORE UPDATE ON prestadores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_prestadores_slug    ON prestadores(slug);
CREATE INDEX IF NOT EXISTS idx_prestadores_status  ON prestadores(status);
CREATE INDEX IF NOT EXISTS idx_prestadores_usuario ON prestadores(usuario_id);

-- 3. OFERTAS
CREATE TABLE IF NOT EXISTS ofertas (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id        UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
  categoria_id        UUID REFERENCES categorias_oferta(id) ON DELETE SET NULL,
  esporte_id          UUID REFERENCES esportes(id) ON DELETE SET NULL,
  titulo              TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  descricao           TEXT,
  imagem_url          TEXT,
  preco_original      NUMERIC(10,2) NOT NULL CHECK (preco_original >= 0),
  preco_oferta        NUMERIC(10,2) NOT NULL CHECK (preco_oferta >= 0),
  quantidade_maxima   INT,                         -- NULL = ilimitado
  quantidade_vendida  INT NOT NULL DEFAULT 0,
  data_inicio         TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_fim            TIMESTAMPTZ,                 -- NULL = sem prazo
  status              TEXT NOT NULL DEFAULT 'pendente'
                        CHECK (status IN ('pendente', 'ativa', 'encerrada', 'rejeitada')),
  aprovado_por        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  aprovado_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS ofertas_updated_at ON ofertas;
CREATE TRIGGER ofertas_updated_at
  BEFORE UPDATE ON ofertas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_ofertas_slug      ON ofertas(slug);
CREATE INDEX IF NOT EXISTS idx_ofertas_status    ON ofertas(status);
CREATE INDEX IF NOT EXISTS idx_ofertas_data_fim  ON ofertas(data_fim);

-- 4. CUPONS DE OFERTA (registro de cada compra coletiva)
CREATE TABLE IF NOT EXISTS cupons_oferta (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id    UUID NOT NULL REFERENCES ofertas(id) ON DELETE CASCADE,
  comprador_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  codigo       TEXT NOT NULL UNIQUE DEFAULT upper(substr(gen_random_uuid()::text, 1, 8)),
  status       TEXT NOT NULL DEFAULT 'ativo'
                 CHECK (status IN ('ativo', 'utilizado', 'expirado', 'cancelado')),
  pagamento_id TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cupons_oferta     ON cupons_oferta(oferta_id);
CREATE INDEX IF NOT EXISTS idx_cupons_comprador  ON cupons_oferta(comprador_id);
CREATE INDEX IF NOT EXISTS idx_cupons_codigo     ON cupons_oferta(codigo);

-- 5. RLS
ALTER TABLE categorias_oferta ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestadores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ofertas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupons_oferta      ENABLE ROW LEVEL SECURITY;

-- Categorias: leitura pública
CREATE POLICY "categorias_oferta_public_read" ON categorias_oferta FOR SELECT USING (ativo = true);

-- Prestadores: leitura pública dos aprovados; inserção/edição pelo próprio usuário
CREATE POLICY "prestadores_public_read"  ON prestadores FOR SELECT USING (status = 'aprovado');
CREATE POLICY "prestadores_insert_self"  ON prestadores FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "prestadores_update_self"  ON prestadores FOR UPDATE USING (auth.uid() = usuario_id);

-- Ofertas: leitura pública das ativas; inserção/edição pelo prestador
CREATE POLICY "ofertas_public_read"     ON ofertas FOR SELECT USING (status = 'ativa');
CREATE POLICY "ofertas_insert_prestador" ON ofertas FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM prestadores p WHERE p.id = ofertas.prestador_id AND p.usuario_id = auth.uid() AND p.status = 'aprovado'));
CREATE POLICY "ofertas_update_prestador" ON ofertas FOR UPDATE
  USING (EXISTS (SELECT 1 FROM prestadores p WHERE p.id = ofertas.prestador_id AND p.usuario_id = auth.uid()));

-- Cupons: leitura pelo comprador; service_role para inserção
CREATE POLICY "cupons_read_own" ON cupons_oferta FOR SELECT USING (auth.uid() = comprador_id);
