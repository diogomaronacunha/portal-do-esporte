# PRD — Portal do Esporte
**Versão:** 1.0
**Status:** Draft
**Data:** 2026-03-14
**Product Manager:** Morgan (AIOX PM Agent)
**Owner:** Portal do Esporte

---

## 1. Visão do Produto

### 1.1 Declaração de Visão

O **Portal do Esporte** é o maior guarda-chuva digital do esporte gaúcho — uma plataforma que une divulgação, comunidade e negócio em torno do esporte amador do Rio Grande do Sul.

### 1.2 Problema que Resolve

| Problema | Quem sofre | Impacto |
|----------|-----------|---------|
| Atletas amadores não têm visibilidade | Atletas, clubes amadores | Alta |
| Eventos esportivos são pouco divulgados | Organizadores, participantes | Alta |
| Informações espalhadas em dezenas de sites de federações | Público em geral | Média |
| Dificuldade de comprar produtos esportivos com variedade | Praticantes de esporte | Média |
| Serviços esportivos (aulas, treinos, academias) sem canal de oferta coletiva | Prestadores e consumidores | Média |

### 1.3 Solução

Plataforma digital unificada com **três módulos integrados:**

1. **Portal de Notícias e Calendário** — agrega notícias das federações e divulga eventos esportivos do RS
2. **E-commerce de Produtos** — marketplace de artigos esportivos (modelo Fanatics)
3. **Marketplace de Serviços** — compras coletivas de serviços esportivos (modelo Groupon/Laçador de Ofertas)

---

## 2. Público-Alvo

### 2.1 Personas Primárias

**Persona 1 — O Atleta Amador**
- Pratica esporte de fim de semana ou em ligas amadoras
- Quer visibilidade para si e seu clube
- Busca equipamentos e serviços esportivos
- Quer saber de eventos e competições

**Persona 2 — O Torcedor/Entusiasta**
- Acompanha esporte amador local
- Quer saber o calendário de jogos e eventos
- Consome notícias esportivas

**Persona 3 — O Organizador de Evento**
- Organiza campeonatos, torneios, corridas
- Quer divulgar seu evento gratuitamente
- Precisa de visibilidade no RS

**Persona 4 — O Prestador de Serviço Esportivo**
- Academia, personal trainer, escola de esporte
- Quer oferecer pacotes/promoções coletivas
- Busca novos clientes

**Persona 5 — O Lojista de Produtos Esportivos**
- Vende artigos esportivos
- Quer canal de venda adicional
- Aceita modelo de marketplace com comissão

### 2.2 Abrangência Geográfica

**MVP:** Rio Grande do Sul
**Expansão futura:** Brasil

---

## 3. Funcionalidades do Produto

### 3.1 Módulo 1 — Portal de Notícias e Calendário (MVP)

#### Notícias
- Agregação automática de notícias dos sites das federações gaúchas via scraping/RSS
- Crédito obrigatório e link para a fonte original
- Curadoria manual pelo administrador (aprovação antes de publicar)
- Categorização por esporte e região
- Sistema de tags

#### Calendário de Eventos
- Cadastro de eventos por qualquer usuário (atleta, organizador, clube)
- Fluxo: usuário envia evento → admin aprova → publicado no calendário
- Recebimento de eventos via e-mail e WhatsApp (automação n8n)
- Filtros por esporte, cidade, data
- Integração com calendário pessoal (Google Calendar / iCal export)

#### Perfis de Atletas e Clubes
- Cadastro de atleta/clube pelo próprio usuário
- Aprovação pelo administrador
- Perfil público com histórico, modalidade, conquistas
- Fase inicial: admin pode criar perfis manualmente

### 3.2 Módulo 2 — E-commerce de Produtos (Fase 2)

- Catálogo de produtos esportivos (roupas, equipamentos, acessórios)
- Vendedores: marketplace aberto (lojistas cadastrados) + produtos próprios do portal
- Modelo de monetização: comissão sobre vendas rateada entre cadastrados
- Carrinho, checkout, pagamento online
- Gestão de pedidos e logística pelo lojista
- Avaliações de produtos

### 3.3 Módulo 3 — Marketplace de Serviços (Fase 3)

- Oferta de serviços esportivos em modelo compra coletiva (Groupon-like)
- Categorias: academia, personal trainer, escola de esporte, fisioterapia, nutrição esportiva
- Prestador cadastra oferta com valor, desconto e mínimo de compradores
- Usuários compram quando o mínimo é atingido
- Receita rateada entre cadastrados do portal

---

## 4. Monetização

| Fonte | Módulo | Detalhe |
|-------|--------|---------|
| Publicidade (banners, posts patrocinados) | Todos | Modelo CPM/CPC para anunciantes do RS |
| Comissão sobre vendas de produtos | E-commerce | % sobre cada venda no marketplace |
| Comissão sobre serviços coletivos | Serviços | % sobre cada pacote vendido |
| Rateio entre cadastrados | E-commerce + Serviços | Receita distribuída entre lojistas/prestadores cadastrados |

---

## 5. Automações Planejadas

| Automação | Ferramenta | Trigger | Ação |
|-----------|-----------|---------|------|
| Scraping de notícias | n8n | Agendado (diário) | Busca RSS/HTML dos sites das federações, publica com crédito |
| Recebimento de eventos | n8n | E-mail / WhatsApp recebido | Cria rascunho de evento para aprovação admin |
| Aprovação de conteúdo | Painel admin | Admin aprova | Publica notícia/evento/perfil |

---

## 6. Stack Técnica Proposta

| Camada | Tecnologia | Justificativa |
|--------|-----------|--------------|
| Frontend | Next.js 14+ | SEO excelente, App Router, performance |
| Backend/API | Next.js API Routes + Supabase | Simplicidade, custo zero |
| Banco de Dados | Supabase (PostgreSQL) | Gratuito, RLS nativo, auth integrado |
| Autenticação | Supabase Auth | Magic link, OAuth social |
| Automações | n8n (self-hosted) | Scraping, WhatsApp, e-mail — gratuito |
| Hosting | Vercel | Free tier, deploy automático |
| Storage | Supabase Storage | Imagens de atletas, produtos, eventos |
| Pagamentos | Mercado Pago / Stripe (Fase 2) | PIX nativo, marketplace splits |

**Custo estimado MVP:** R$ 0/mês (tiers gratuitos)

---

## 7. Roadmap / Fases

### Fase 1 — MVP: Portal de Notícias e Calendário
**Objetivo:** Construir audiência e validar o conceito
**Entregáveis:**
- [ ] Site Next.js com design responsivo
- [ ] Sistema de notícias (scraping + aprovação)
- [ ] Calendário de eventos (cadastro + aprovação)
- [ ] Perfis de atletas/clubes
- [ ] Painel administrativo básico
- [ ] Automação n8n para recebimento de eventos

### Fase 2 — E-commerce de Produtos
**Pré-requisito:** Fase 1 com audiência estabelecida
**Entregáveis:**
- [ ] Catálogo de produtos
- [ ] Onboarding de lojistas
- [ ] Checkout e pagamentos
- [ ] Gestão de pedidos

### Fase 3 — Marketplace de Serviços
**Pré-requisito:** Fase 2 operacional
**Entregáveis:**
- [ ] Cadastro de prestadores de serviço
- [ ] Motor de compra coletiva
- [ ] Sistema de vouchers

---

## 8. Requisitos Não-Funcionais

| Requisito | Meta |
|-----------|------|
| Performance | Lighthouse Score > 90 (SEO crítico para portal de notícias) |
| Responsividade | Mobile-first — maioria do tráfego será mobile |
| SEO | URLs amigáveis, meta tags, Open Graph, sitemap |
| Acessibilidade | WCAG 2.1 AA |
| Segurança | Supabase RLS em todas as tabelas, autenticação obrigatória para cadastro |

---

## 9. Restrições e Premissas

### Restrições
- Time de 1 pessoa (owner do produto + dev)
- Custo de infraestrutura: zero no MVP
- Sem prazo fixo — construção incremental

### Premissas
- Sites das federações gaúchas permitem scraping (termos de uso permissivos ou RSS disponível)
- n8n pode ser hospedado gratuitamente (Railway free tier ou self-hosted local para início)
- Mercado Pago disponível para marketplace (splits) quando necessário na Fase 2

---

## 10. Critérios de Sucesso (MVP)

| Métrica | Meta (3 meses após lançamento) |
|---------|-------------------------------|
| Notícias publicadas | 50+ notícias agregadas |
| Eventos no calendário | 20+ eventos cadastrados |
| Perfis de atletas/clubes | 10+ perfis aprovados |
| Visitantes únicos/mês | 500+ |
| Federações com scraping ativo | 3+ |

---

## 11. Federações Gaúchas — Fontes Iniciais

Fontes a mapear para scraping de notícias:
- Federação Gaúcha de Futebol (FGF)
- Federação Gaúcha de Basquetebol
- Federação Gaúcha de Vôlei
- Federação Gaúcha de Atletismo
- Outras a mapear conforme disponibilidade de RSS/conteúdo

---

## 12. Fora de Escopo (MVP)

- App mobile nativo (usar PWA no futuro)
- Transmissão ao vivo de eventos
- Sistema de apostas
- Chat/fórum entre usuários
- Integração com redes sociais além de compartilhamento básico

---

*PRD gerado por Morgan (AIOX PM Agent) — Portal do Esporte v1.0*
