# Auditoria Técnica — Portal do Esporte

**Data:** 2026-07-21 · **Modo:** somente leitura · **Escopo:** código (packages/web), banco (Supabase — migrations e RLS), automações (n8n), pagamentos (MercadoPago), estrutura de agentes/CLAUDE.md

---

## Sumário executivo

O projeto é enxuto e bem organizado para um MVP — ~9,3 mil linhas de TypeScript, App Router idiomático, RLS habilitado em todas as tabelas, migrations versionadas, ISR com revalidação por página e uma MEMORY.md exemplar que documenta cada sessão. A superfície de código é limpa: apenas 3 casts `as any` no projeto inteiro, nomenclatura consistente e padrão uniforme entre módulos.

Mas a auditoria encontrou **uma cadeia crítica de segurança**: o secret do webhook n8n (`x-api-key`) está hardcoded em três arquivos JSON versionados em um **repositório GitHub público**, e esse webhook publica notícias **direto no ar, sem revisão** (auto-publicação ativada em 2026-03-17), com o conteúdo renderizado via `dangerouslySetInnerHTML` **sem nenhuma sanitização** no app. Na prática, qualquer pessoa na internet pode publicar HTML arbitrário — incluindo `<script>` — na home do portal. Além disso, o checkout confia nos **preços enviados pelo cliente**, as policies RLS de prestadores/ofertas permitem **auto-aprovação**, e o **build de produção está quebrado** desde o último commit (`resend` é importado mas não existe no `package.json`).

A boa notícia: como no caso do TurfeBrasil, os problemas graves são baratos de corrigir. A Fase 0 (segurança + build) cabe em 1–2 dias e elimina os riscos de defacement, XSS e fraude de preço antes de qualquer evolução de produto.

### Pontos fortes (para preservar)

- RLS em 100% das tabelas, com padrão consistente de status (`pendente → aprovado/publicado`)
- `requireAdmin()` centralizado e usado em todas as 17 rotas admin
- Páginas protegidas fazem checagem própria de auth via `redirect()` (defesa em profundidade)
- Fix correto de race condition de duplicatas (UNIQUE constraint + upsert `ignoreDuplicates`)
- ISR bem calibrado por tipo de conteúdo (15 min eventos/ofertas, 30 min notícias, 1 h institucional)

---

## 1. Segurança (achados críticos)

### 1.1 Secret do webhook exposto em repositório público → publicação arbitrária 🔴

O repo `github.com/diogomaronacunha/portal-do-esporte` é **público** e os três JSONs em `n8n-workflows/` contêm o header `x-api-key: portal-esporte-webhook-2026` hardcoded. O endpoint `POST /api/webhook/n8n` aceita esse secret e insere notícias com `status: 'publicado'` — sem fila de aprovação (`route.ts:96`). Qualquer pessoa pode publicar conteúdo arbitrário no portal com um `curl`. O mesmo secret também aparece em documentos locais de memória.

**Correção:** rotacionar o secret (gerar um aleatório longo), movê-lo para variável de ambiente no n8n (não no JSON exportado), remover os valores dos JSONs versionados e considerar o histórico do git como comprometido (o secret antigo nunca mais deve ser aceito).

### 1.2 XSS armazenado — HTML renderizado sem sanitização 🔴

`noticias/[slug]/page.tsx:114` renderiza `noticia.conteudo` com `dangerouslySetInnerHTML` e **não existe nenhuma sanitização** nem no app nem nos workflows n8n (grep por sanitize/DOMPurify/escape: zero ocorrências). O conteúdo vem de scraping de sites externos e do webhook do item 1.1. Combinado com 1.1, é XSS trivial; mesmo com o secret protegido, um site de federação comprometido injetaria script nos leitores do portal.

**Correção:** sanitizar server-side na entrada (webhook) e/ou na renderização com `sanitize-html` (allowlist: p, a, ul, ol, li, strong, em, img, h2–h4, blockquote), removendo event handlers e `javascript:` URLs.

### 1.3 Checkout confia em preços enviados pelo cliente 🔴

`POST /api/checkout` (`route.ts:31`) calcula o total a partir de `preco_unitario` vindos do body — que o cliente monta a partir do carrinho em `localStorage` — e usa esses mesmos valores na preferência do MercadoPago. Um atacante compra qualquer produto por R$ 0,01 editando o payload. A RLS de `pedidos` (`pedidos_insert_own`) também aceita qualquer `total`.

**Correção:** buscar preço, nome e status do produto no banco pelos `produto_id` recebidos; validar que o produto está `ativo` e recalcular o total no servidor. O cliente envia apenas `produto_id`, `quantidade`, `tamanho`.

### 1.4 RLS de prestadores e ofertas permite auto-aprovação 🔴

Na migration 07 (`20260316000007_ofertas_schema.sql:112-120`):
- `prestadores_insert_self` exige apenas `auth.uid() = usuario_id` — **não exige `status = 'pendente'`**. Qualquer usuário se cadastra já como `'aprovado'` chamando a API do Supabase diretamente.
- `prestadores_update_self` e `ofertas_update_prestador` não têm `WITH CHECK` restringindo status — um prestador atualiza o próprio registro para `'aprovado'` ou a própria oferta para `'ativa'`, pulando a moderação.
- `ofertas_insert_prestador` valida o prestador mas não impõe `status = 'pendente'` na oferta criada.

Compare com as policies de `lojistas`/`produtos` (migration 06), que fazem isso corretamente — o padrão existe no projeto, só não foi seguido na fase 3.

**Correção:** migration 09 recriando as 4 policies com `status = 'pendente'` no `WITH CHECK` de INSERT e congelando `status` nos UPDATEs próprios (ou permitindo apenas admin mudar status).

### 1.5 Webhook MercadoPago sem validação de assinatura 🟡

`POST /api/checkout/webhook` aceita qualquer POST. O risco direto é mitigado porque ele busca o pagamento na API do MP antes de agir, mas o MP envia o header `x-signature` exatamente para isso — validar custa ~15 linhas e fecha a porta a abusos (flood de lookups, confirmação de pedidos com pagamentos de terceiros reutilizados).

### 1.6 Cupom de oferta emitido antes do pagamento — e nunca confirmado 🟡

`POST /api/ofertas/comprar` cria o cupom e incrementa `quantidade_vendida` **antes** de redirecionar ao MercadoPago (`route.ts:38-52`). Se o usuário abandonar o pagamento, o cupom fica `ativo` no banco e visível em `/meu-perfil`. Pior: o webhook do MP só atualiza a tabela `pedidos` — o `external_reference` dos cupons (`cupom.id`) nunca casa com nada, então **nenhum cupom pago é jamais confirmado**. O fluxo de pagamento de ofertas está funcionalmente incompleto.

**Correção:** criar cupom com `status: 'pendente'` (novo valor no CHECK) e ativá-lo no webhook quando `payment.approved`, tratando `external_reference` de cupom e de pedido separadamente.

### 1.7 `next/image` com wildcard total 🟢

`next.config.ts` permite `hostname: '**'` em http e https — o otimizador de imagens do Vercel vira um proxy aberto (custo/abuso). Aceitável no beta por causa das notícias agregadas; no médio prazo, manter uma lista dos domínios das federações ou usar `unoptimized` para imagens de notícia.

---

## 2. Bugs funcionais (quebram fluxos hoje)

### 2.1 Build de produção quebrado — `resend` não é dependência 🔴

`lib/email.ts:1` importa `resend`, mas o pacote **não está** no `package.json` nem no `package-lock.json`. O `next build` falha desde o commit `b20e080` — o deploy da Vercel deve estar servindo uma versão anterior ao último commit. Correção: `npm install resend`.

### 2.2 Filas admin de prestadores e ofertas sempre vazias 🔴

`/admin/prestadores` e `/admin/ofertas` usam `getPrestadoresPendentes()`/`getOfertasPendentes()` com o client **anon** (sessão do admin, sujeito a RLS) — mas `prestadores` e `ofertas` **não têm policy de SELECT para admin** (nem `is_admin()`, nem "own"). O `SELECT ... WHERE status = 'pendente'` retorna vazio: **o admin nunca vê nem aprova prestadores e ofertas pendentes**. Os outros 6 módulos têm `select_admin` e funcionam.

### 2.3 Prestador pendente não vê o próprio cadastro 🟠

Pelo mesmo motivo (sem policy `select_own`), `getPrestadorPorUsuario()` retorna null para quem tem cadastro pendente — `/meu-espaco` mostra "Você não tem um espaço cadastrado" e convida a cadastrar de novo (duplicata). A tela de "cadastro em análise" (`page.tsx:46`) é código morto hoje.

**Correção (2.2 + 2.3):** migration com `prestadores_select_own`, `prestadores_select_admin`, `ofertas_select_prestador_own`, `ofertas_select_admin`.

### 2.4 Filtro por esporte não filtra em /noticias e /eventos 🟡

`getNoticiasPublicadas`, `countNoticiasPublicadas`, `getEventosAprovados` e `countEventosAprovados` filtram com `.eq('esportes.slug', x)` sobre um embed **sem `!inner`** — no PostgREST isso não filtra as linhas pai, só anula o embed (e nas funções `count`, que nem embarcam a relação, o filtro falha). Resultado: selecionar um esporte no filtro mostra tudo mesmo assim. `getNoticiasPorEsporte` usa `!inner` corretamente — é só replicar (`esporte:esportes!inner(...)`).

### 2.5 E-mails de notificação provavelmente nunca são enviados 🟡

`void notificarAdmin(...)` (fire-and-forget) em função serverless: a Vercel congela a lambda assim que a resposta é retornada — a Promise do Resend raramente completa. Usar `await` (custa ~100 ms) ou `waitUntil()`. Além disso, sem `.catch()`, qualquer falha vira unhandled rejection; e o `nome` é interpolado no HTML do e-mail sem escape.

### 2.6 Código morto no middleware 🟠

`middleware.ts:29` testa `pathname.startsWith('/(dashboard)')` — route groups nunca aparecem na URL, o branch é inalcançável. Sem impacto de segurança (as páginas fazem `redirect()` próprio), mas o matcher lista 8 rotas que rodam o middleware sem nenhuma proteção adicional. Limpar ou proteger de verdade no middleware.

### 2.7 Estoque nunca é verificado nem baixado 🟡

A coluna `produtos.estoque` existe com CHECK `>= 0`, mas nenhuma linha de código a lê ou atualiza. Compra de produto esgotado passa; lojista não tem controle real. Decidir: implementar baixa de estoque no webhook de pagamento (com RPC atômico) ou remover a coluna do formulário para não fingir um controle que não existe.

### 2.8 Race condition no contador de vendas de ofertas 🟠

`quantidade_vendida` é lido e depois escrito (`oferta.quantidade_vendida + 1`) — duas compras simultâneas contam uma. Em oferta com `quantidade_maxima`, vende-se acima do limite. Usar RPC `increment` atômico (`UPDATE ... SET quantidade_vendida = quantidade_vendida + 1 WHERE ... RETURNING`).

### 2.9 Aprovações não invalidam o cache ISR 🟠

Nenhuma rota de aprovar/rejeitar (nem o webhook n8n) chama `revalidatePath()` — conteúdo aprovado demora até 1 h para aparecer (e a home até 30 min). Adicionar `revalidatePath('/noticias')` etc. nas rotas de aprovação e no webhook.

---

## 3. Banco de dados

### 3.1 `FULL_MIGRATION.sql` desatualizado 🟡

O script consolidado para a futura migração de projeto Supabase (plano documentado na memória do projeto) **não contém nada da fase 3** — zero menções a `prestadores`, `ofertas`, `cupons_oferta`. Se a migração fosse executada hoje, o módulo de compras coletivas ficaria sem tabelas. Regenerar a partir das migrations 01–08 + a migration 09 proposta acima.

### 3.2 `eventos.status` sem CHECK constraint 🟢

Por ter sido adicionada via `ADD COLUMN IF NOT EXISTS` defensivo, a coluna não tem o CHECK que as outras tabelas têm. Valor inválido entraria silenciosamente.

### 3.3 `is_admin()` pode ser otimizada 🟢

A função é `plpgsql` sem marcação de volatilidade — o Postgres a trata como VOLATILE e a reavalia por linha nas policies. Reescrever como `sql STABLE` permite cache por statement. Impacto pequeno hoje, cresce com o volume.

### 3.4 Pontos positivos

Índices cobrem os padrões de acesso reais (slug, status, FKs); o índice funcional `COALESCE(tamanho, '')` no carrinho resolve corretamente o clássico problema de NULL em UNIQUE; `profiles` não expõe dados sensíveis no SELECT público; a policy de UPDATE de `profiles` impede troca do próprio `role` corretamente.

---

## 4. Qualidade e arquitetura do código

### 4.1 Zero testes e zero CI 🟡

Não há nenhum teste e não existe `.github/workflows`. O bug 2.1 (build quebrado) está no `master` justamente porque nada roda `npm run build`/`typecheck` em push. Um workflow de 15 linhas (install + lint + typecheck + build) já teria bloqueado. Prioridade antes de qualquer refatoração.

### 4.2 16 rotas admin quase idênticas 🟠

`aprovar/route.ts` e `rejeitar/route.ts` × 8 módulos são o mesmo arquivo com nome de tabela e status diferentes. Uma factory (`makeAprovacaoRoute(tabela, statusAprovado)`) reduz ~400 linhas para ~40 e garante que correções (como o `revalidatePath` do item 2.9) entrem em todos os módulos de uma vez. As 8 páginas de fila admin têm a mesma oportunidade.

### 4.3 Validação de payload fraca nas APIs 🟠

As rotas públicas fazem casts diretos (`body.data_inicio as string`) sem validar formato — 13 casts `as string` só em `app/api`. Data inválida, string gigante ou tipo errado chegam ao banco e viram erro 500 genérico (ou lixo salvo). Adotar `zod` nos 10 endpoints de escrita.

### 4.4 Dependências mortas 🟢

`drizzle-orm`, `drizzle-kit` e `postgres` estão no `package.json` e não são importados em lugar nenhum (o acesso é 100% supabase-js). Remover — reduz install e superfície de alerta de segurança.

### 4.5 Ambiente local quebrado 🟢

`node_modules` está incompleto (`tsc` não existe no `.bin`) — não foi possível rodar lint/typecheck nesta auditoria. Rodar `npm install` limpo em `packages/web`.

### 4.6 Pontos menores 🟢

- `ilike` com `%${q}%` sem escapar `%`/`_` — busca por "100%" se comporta estranho (não é injeção, só UX)
- `BASE_URL` com fallback hardcoded para o domínio `.vercel.app` em 3 arquivos — centralizar em `lib/config.ts` e usar `portaldoesporte.com.br`
- Webhook n8n cria client Supabase inline em vez de reusar `createAdminClient()`

---

## 5. Automações (n8n)

### 5.1 Três JSONs, um workflow real 🟠

`01-scraping-noticias-rss.json` (13,5 KB) e `Portal do Esporte — Scraping de Notícias RSS.json` (18,9 KB) são versões diferentes do mesmo workflow — não está claro qual espelha o que roda na VPS. Manter um único arquivo canônico por workflow (exportar o ativo e apagar o obsoleto), sem credenciais dentro (ver 1.1).

### 5.2 Sanitização ausente também na origem 🟡

Nenhum nó Code dos workflows remove tags perigosas do HTML extraído. Mesmo após corrigir 1.2 no app, vale limpar na origem (defesa em camadas), já que o conteúdo vem de sites de terceiros.

### 5.3 Planos já mapeados

O diagnóstico das federações sem RSS (FGFS via HTTP, Liga Gaúcha via Apify) está bem documentado na memória do projeto — sem achados aqui, apenas registrar que os workflows 03/04 devem nascer já no padrão canônico do item 5.1.

---

## 6. Agentes, skills e CLAUDE.md

- **Duplicação AIOS × AIOX** em `.claude/commands/` — dois conjuntos completos de 12 agentes cada. Mesmo achado do TurfeBrasil: manter só AIOX.
- **MEMORY.md é o ponto forte do projeto** — histórico de sessões completo, decisões rastreáveis. Porém contém o secret do webhook e credenciais de infra em texto plano; após a rotação (1.1), registrar secrets apenas como referência ("ver Vercel env"), nunca o valor.
- O projeto usa o Supabase do Bellacqua compartilhado — risco conhecido e já documentado como "aguardando plano pago"; a migração depende do `FULL_MIGRATION.sql` corrigido (3.1).

---

## 7. Matriz de priorização (impacto × esforço)

| # | Achado | Impacto | Esforço | Prioridade |
|---|--------|---------|---------|-----------|
| 1.1 | Secret público + publicação direta | Crítico | Baixo | **P0** |
| 1.2 | XSS armazenado (sem sanitização) | Crítico | Baixo | **P0** |
| 2.1 | Build quebrado (`resend`) | Crítico | Trivial | **P0** |
| 1.3 | Preços do cliente no checkout | Crítico | Médio | **P0** |
| 1.4 | Auto-aprovação prestadores/ofertas | Crítico | Baixo | **P0** |
| 2.2/2.3 | Filas admin vazias / prestador invisível | Alto | Baixo | **P1** |
| 1.6 | Cupom antes do pagamento, nunca confirmado | Alto | Médio | **P1** |
| 2.4 | Filtro de esporte não filtra | Alto | Trivial | **P1** |
| 2.5 | E-mails nunca enviados (fire-and-forget) | Médio | Trivial | **P1** |
| 4.1 | Sem CI | Alto | Baixo | **P1** |
| 1.5 | Assinatura webhook MP | Médio | Baixo | P2 |
| 2.7 | Estoque inexistente | Médio | Médio | P2 |
| 2.8 | Race condition vendas | Médio | Baixo | P2 |
| 2.9 | Cache ISR pós-aprovação | Médio | Baixo | P2 |
| 3.1 | FULL_MIGRATION desatualizado | Médio | Baixo | P2 |
| 4.2/4.3 | Factory rotas admin + zod | Médio | Médio | P3 |
| demais 🟢 | Limpezas | Baixo | Baixo | P3 |

---

## 8. Plano de correção em fases

### Fase 0 — Segurança e produção (1–2 dias, sem risco de regressão)

1. `npm install resend` + `npm install` limpo → build volta a passar (2.1, 4.5)
2. Rotacionar `N8N_WEBHOOK_SECRET` (valor aleatório de 32+ bytes), atualizar Vercel + n8n, limpar os JSONs versionados (1.1)
3. Sanitização server-side do HTML de notícias com `sanitize-html` (1.2)
4. Checkout: preços buscados do banco, validação de produto ativo (1.3)
5. Migration 09: policies de prestadores/ofertas com `status = 'pendente'` obrigatório (1.4)

### Fase 1 — Fluxos quebrados (2–3 dias)

6. Migration 09 (mesma): policies `select_own`/`select_admin` para prestadores e ofertas (2.2, 2.3)
7. `!inner` nos filtros de esporte de notícias/eventos (2.4)
8. `await notificarAdmin(...)` com try/catch + escape do nome (2.5)
9. Cupom nasce `pendente`, webhook MP confirma cupons e pedidos separadamente (1.6)
10. CI GitHub Actions: lint + typecheck + build em todo push (4.1)

### Fase 2 — Robustez de e-commerce (3–5 dias)

11. Validação de assinatura `x-signature` no webhook MP (1.5)
12. RPC atômico para `quantidade_vendida` + decisão sobre estoque (2.7, 2.8)
13. `revalidatePath` nas aprovações e no webhook n8n (2.9)
14. Regenerar `FULL_MIGRATION.sql` com fases 2, 3 e migration 08/09 (3.1)

### Fase 3 — Qualidade e manutenção (paralelo, baixo risco)

15. Factory para rotas de aprovação + página de fila genérica (4.2)
16. `zod` nos endpoints de escrita (4.3)
17. Remover drizzle/postgres, limpar middleware, centralizar `BASE_URL`, consolidar JSONs n8n (4.4, 2.6, 4.6, 5.1)
18. Remover duplicação AIOS×AIOX de `.claude/commands` (seção 6)

---

## Anexo — números levantados

| Métrica | Valor |
|---------|-------|
| Linhas de TS/TSX | ~9.331 |
| Casts `as any` | 3 (excelente) |
| Casts `as string` sem validação em APIs | 13 |
| Rotas API | 31 (17 admin, 10 públicas de escrita, 2 webhooks, 2 auth) |
| Migrations | 8 + FULL_MIGRATION (desatualizado) |
| Policies RLS | ~50 (2 tabelas sem SELECT de admin) |
| Testes automatizados | 0 |
| Pipelines CI | 0 |
| Dependências sem uso | 3 (drizzle-orm, drizzle-kit, postgres) |
| Páginas com `dangerouslySetInnerHTML` de conteúdo externo | 1 (notícias) + 5 de JSON-LD (seguros) |
