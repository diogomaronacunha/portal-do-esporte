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
