-- ============================================================
-- Portal do Esporte — Fase 2: E-commerce Schema
-- ============================================================

-- 1. CATEGORIAS DE PRODUTO
CREATE TABLE IF NOT EXISTS categorias_produto (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  icone      TEXT,
  ativo      BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cat_produto_slug ON categorias_produto(slug);
CREATE INDEX IF NOT EXISTS idx_cat_produto_ativo ON categorias_produto(ativo);

-- 2. LOJISTAS
CREATE TABLE IF NOT EXISTS lojistas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nome_loja     TEXT NOT NULL,
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
DROP TRIGGER IF EXISTS lojistas_updated_at ON lojistas;
CREATE TRIGGER lojistas_updated_at
  BEFORE UPDATE ON lojistas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_lojistas_slug    ON lojistas(slug);
CREATE INDEX IF NOT EXISTS idx_lojistas_status  ON lojistas(status);
CREATE INDEX IF NOT EXISTS idx_lojistas_usuario ON lojistas(usuario_id);

-- 3. PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id     UUID NOT NULL REFERENCES lojistas(id) ON DELETE CASCADE,
  categoria_id   UUID REFERENCES categorias_produto(id) ON DELETE SET NULL,
  esporte_id     UUID REFERENCES esportes(id) ON DELETE SET NULL,
  nome           TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  descricao      TEXT,
  preco          NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  preco_original NUMERIC(10,2),
  estoque        INT NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  imagens        TEXT[] NOT NULL DEFAULT '{}',
  tamanhos_disponiveis TEXT[] NOT NULL DEFAULT '{}',
  status         TEXT NOT NULL DEFAULT 'pendente'
                   CHECK (status IN ('pendente', 'ativo', 'rejeitado', 'inativo')),
  aprovado_por   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  aprovado_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS produtos_updated_at ON produtos;
CREATE TRIGGER produtos_updated_at
  BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_produtos_slug      ON produtos(slug);
CREATE INDEX IF NOT EXISTS idx_produtos_status    ON produtos(status);
CREATE INDEX IF NOT EXISTS idx_produtos_lojista   ON produtos(lojista_id);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_esporte   ON produtos(esporte_id);

-- 4. CARRINHO_ITENS
CREATE TABLE IF NOT EXISTS carrinho_itens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade INT NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  tamanho    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS carrinho_itens_updated_at ON carrinho_itens;
CREATE TRIGGER carrinho_itens_updated_at
  BEFORE UPDATE ON carrinho_itens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- Index funcional para tratar NULL no tamanho (dois NULLs não conflitam em UNIQUE constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_carrinho_unique
  ON carrinho_itens (usuario_id, produto_id, COALESCE(tamanho, ''));
CREATE INDEX IF NOT EXISTS idx_carrinho_usuario ON carrinho_itens(usuario_id);

-- 5. PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comprador_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status           TEXT NOT NULL DEFAULT 'aguardando_pagamento'
                     CHECK (status IN (
                       'aguardando_pagamento','pago','em_separacao',
                       'enviado','entregue','cancelado'
                     )),
  total            NUMERIC(10,2) NOT NULL,
  endereco_entrega JSONB NOT NULL DEFAULT '{}',
  pagamento_id     TEXT,
  pagamento_metodo TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS pedidos_updated_at ON pedidos;
CREATE TRIGGER pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_pedidos_comprador ON pedidos(comprador_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status    ON pedidos(status);

-- 6. PEDIDOS_ITENS
CREATE TABLE IF NOT EXISTS pedidos_itens (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id      UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id     UUID REFERENCES produtos(id) ON DELETE SET NULL,
  lojista_id     UUID REFERENCES lojistas(id) ON DELETE SET NULL,
  nome_produto   TEXT NOT NULL,
  preco_unitario NUMERIC(10,2) NOT NULL,
  quantidade     INT NOT NULL CHECK (quantidade > 0),
  tamanho        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ped_itens_pedido  ON pedidos_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_ped_itens_lojista ON pedidos_itens(lojista_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE categorias_produto ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cat_produto_select_public"
  ON categorias_produto FOR SELECT USING (ativo = true);
CREATE POLICY "cat_produto_admin_all"
  ON categorias_produto FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE lojistas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lojistas_select_aprovados"
  ON lojistas FOR SELECT USING (status = 'aprovado');
CREATE POLICY "lojistas_select_own"
  ON lojistas FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "lojistas_select_admin"
  ON lojistas FOR SELECT USING (is_admin());
CREATE POLICY "lojistas_insert_authenticated"
  ON lojistas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = usuario_id AND status = 'pendente');
CREATE POLICY "lojistas_update_admin"
  ON lojistas FOR UPDATE USING (is_admin());

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produtos_select_ativos"
  ON produtos FOR SELECT USING (status = 'ativo');
CREATE POLICY "produtos_select_lojista_own"
  ON produtos FOR SELECT USING (
    lojista_id IN (SELECT id FROM lojistas WHERE usuario_id = auth.uid())
  );
CREATE POLICY "produtos_select_admin"
  ON produtos FOR SELECT USING (is_admin());
CREATE POLICY "produtos_insert_lojista_aprovado"
  ON produtos FOR INSERT
  WITH CHECK (
    lojista_id IN (
      SELECT id FROM lojistas WHERE usuario_id = auth.uid() AND status = 'aprovado'
    ) AND status = 'pendente'
  );
CREATE POLICY "produtos_update_lojista_own"
  ON produtos FOR UPDATE USING (
    lojista_id IN (SELECT id FROM lojistas WHERE usuario_id = auth.uid())
    AND status IN ('pendente', 'inativo')
  );
CREATE POLICY "produtos_update_admin"
  ON produtos FOR UPDATE USING (is_admin());

ALTER TABLE carrinho_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carrinho_select_own"   ON carrinho_itens FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "carrinho_insert_own"   ON carrinho_itens FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "carrinho_update_own"   ON carrinho_itens FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "carrinho_delete_own"   ON carrinho_itens FOR DELETE USING (auth.uid() = usuario_id);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pedidos_select_own"    ON pedidos FOR SELECT USING (auth.uid() = comprador_id);
CREATE POLICY "pedidos_select_admin"  ON pedidos FOR SELECT USING (is_admin());
CREATE POLICY "pedidos_insert_own"    ON pedidos FOR INSERT WITH CHECK (auth.uid() = comprador_id);
CREATE POLICY "pedidos_update_admin"  ON pedidos FOR UPDATE USING (is_admin());

ALTER TABLE pedidos_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ped_itens_select_comprador"
  ON pedidos_itens FOR SELECT USING (
    pedido_id IN (SELECT id FROM pedidos WHERE comprador_id = auth.uid())
  );
CREATE POLICY "ped_itens_select_lojista"
  ON pedidos_itens FOR SELECT USING (
    lojista_id IN (SELECT id FROM lojistas WHERE usuario_id = auth.uid())
  );
CREATE POLICY "ped_itens_select_admin"  ON pedidos_itens FOR SELECT USING (is_admin());
CREATE POLICY "ped_itens_insert_own"
  ON pedidos_itens FOR INSERT
  WITH CHECK (pedido_id IN (SELECT id FROM pedidos WHERE comprador_id = auth.uid()));

-- ============================================================
-- SEED — Categorias de produto
-- ============================================================
INSERT INTO categorias_produto (nome, slug, icone) VALUES
  ('Calçados',           'calcados',        '👟'),
  ('Roupas',             'roupas',          '👕'),
  ('Equipamentos',       'equipamentos',    '🏋️'),
  ('Acessórios',         'acessorios',      '🎒'),
  ('Suplementos',        'suplementos',     '💊'),
  ('Uniformes',          'uniformes',       '🥋'),
  ('Material de Treino', 'material-treino', '⚽'),
  ('Outros',             'outros',          '📦')
ON CONFLICT (slug) DO NOTHING;
