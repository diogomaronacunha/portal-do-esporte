-- ============================================================
-- Portal do Esporte — Migration 09
-- Fix RLS de prestadores e ofertas (AUDITORIA.md itens 1.4, 2.2, 2.3)
--
-- Problemas corrigidos:
--   1. prestadores_insert_self não exigia status='pendente'
--      (usuário podia se cadastrar direto como 'aprovado')
--   2. UPDATEs próprios sem WITH CHECK congelando status
--      (prestador podia se auto-aprovar / ativar a própria oferta)
--   3. Faltavam policies de SELECT para admin e para o próprio dono
--      (filas /admin/prestadores e /admin/ofertas sempre vazias;
--       prestador pendente não via o próprio cadastro)
-- ============================================================

-- ============================================================
-- PRESTADORES
-- ============================================================

-- INSERT: obrigatoriamente pendente
DROP POLICY IF EXISTS "prestadores_insert_self" ON prestadores;
CREATE POLICY "prestadores_insert_self" ON prestadores
  FOR INSERT
  WITH CHECK (
    auth.uid() = usuario_id
    AND status = 'pendente'
  );

-- UPDATE próprio: pode editar dados, mas não pode alterar o próprio status
-- (subquery vê a versão pré-update da linha — mesmo padrão de profiles_update_own)
DROP POLICY IF EXISTS "prestadores_update_self" ON prestadores;
CREATE POLICY "prestadores_update_self" ON prestadores
  FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (
    auth.uid() = usuario_id
    AND status = (SELECT p2.status FROM prestadores p2 WHERE p2.id = prestadores.id)
  );

-- SELECT: dono vê o próprio cadastro (qualquer status)
DROP POLICY IF EXISTS "prestadores_select_own" ON prestadores;
CREATE POLICY "prestadores_select_own" ON prestadores
  FOR SELECT
  USING (auth.uid() = usuario_id);

-- SELECT: admin vê tudo (fila de aprovação usa client com sessão, sujeito a RLS)
DROP POLICY IF EXISTS "prestadores_select_admin" ON prestadores;
CREATE POLICY "prestadores_select_admin" ON prestadores
  FOR SELECT
  USING (is_admin());

-- UPDATE: admin pode aprovar/rejeitar/suspender
DROP POLICY IF EXISTS "prestadores_update_admin" ON prestadores;
CREATE POLICY "prestadores_update_admin" ON prestadores
  FOR UPDATE
  USING (is_admin());

-- ============================================================
-- OFERTAS
-- ============================================================

-- INSERT: prestador aprovado, oferta obrigatoriamente pendente
DROP POLICY IF EXISTS "ofertas_insert_prestador" ON ofertas;
CREATE POLICY "ofertas_insert_prestador" ON ofertas
  FOR INSERT
  WITH CHECK (
    status = 'pendente'
    AND EXISTS (
      SELECT 1 FROM prestadores p
      WHERE p.id = ofertas.prestador_id
        AND p.usuario_id = auth.uid()
        AND p.status = 'aprovado'
    )
  );

-- UPDATE próprio: pode editar a oferta, mas não pode alterar o status
DROP POLICY IF EXISTS "ofertas_update_prestador" ON ofertas;
CREATE POLICY "ofertas_update_prestador" ON ofertas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM prestadores p
      WHERE p.id = ofertas.prestador_id AND p.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prestadores p
      WHERE p.id = ofertas.prestador_id AND p.usuario_id = auth.uid()
    )
    AND status = (SELECT o2.status FROM ofertas o2 WHERE o2.id = ofertas.id)
  );

-- SELECT: prestador vê as próprias ofertas (qualquer status — painel /meu-espaco)
DROP POLICY IF EXISTS "ofertas_select_prestador_own" ON ofertas;
CREATE POLICY "ofertas_select_prestador_own" ON ofertas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prestadores p
      WHERE p.id = ofertas.prestador_id AND p.usuario_id = auth.uid()
    )
  );

-- SELECT: admin vê tudo (fila /admin/ofertas)
DROP POLICY IF EXISTS "ofertas_select_admin" ON ofertas;
CREATE POLICY "ofertas_select_admin" ON ofertas
  FOR SELECT
  USING (is_admin());

-- UPDATE: admin pode aprovar/rejeitar/encerrar
DROP POLICY IF EXISTS "ofertas_update_admin" ON ofertas;
CREATE POLICY "ofertas_update_admin" ON ofertas
  FOR UPDATE
  USING (is_admin());
