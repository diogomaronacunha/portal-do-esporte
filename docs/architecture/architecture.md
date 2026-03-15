# Arquitetura — Portal do Esporte
**Versão:** 1.0
**Status:** Draft
**Data:** 2026-03-14
**Arquiteta:** Aria (AIOX Architect Agent)
**Referência:** PRD v1.0

---

## 1. Visão Geral da Arquitetura

### 1.1 Estilo Arquitetural

**Monolito Modular** com separação por domínios de negócio.

Escolha justificada pela restrição de time solo + custo zero. Evita a complexidade operacional de microsserviços mantendo separação lógica clara entre módulos, permitindo extração futura se necessário.

```
┌─────────────────────────────────────────────────┐
│                  VERCEL (hosting)                │
│  ┌───────────────────────────────────────────┐  │
│  │           Next.js App (monolito modular)  │  │
│  │                                           │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │  Módulo  │ │  Módulo  │ │  Módulo  │  │  │
│  │  │ Notícias │ │E-commerce│ │ Serviços │  │  │
│  │  │Calendário│ │ (Fase 2) │ │ (Fase 3) │  │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘  │  │
│  │       └────────────┴────────────┘         │  │
│  │                    │                      │  │
│  │              API Routes                   │  │
│  └───────────────────┬───────────────────────┘  │
└──────────────────────┼──────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐         ┌──────────▼────────┐
│    SUPABASE    │         │   n8n (automações) │
│  - PostgreSQL  │         │  - Scraping RSS    │
│  - Auth        │         │  - WhatsApp/Email  │
│  - Storage     │         │  - Aprovações      │
│  - RLS         │         └───────────────────┘
└────────────────┘
```

### 1.2 Princípios Arquiteturais

| Princípio | Aplicação |
|-----------|-----------|
| **SEO First** | App Router com SSR/SSG — crítico para portal de notícias |
| **Mobile First** | Design responsivo, Core Web Vitals otimizados |
| **Zero Cost** | Free tiers de Vercel + Supabase + n8n |
| **Progressive Enhancement** | Fase 1 → 2 → 3 sem reescritas |
| **Content Moderation** | Fluxo de aprovação em todo conteúdo gerado |
| **Security by Default** | RLS no banco, auth em rotas protegidas |

---

## 2. Stack Tecnológica

### 2.1 Decisões de Stack

| Camada | Tecnologia | Versão | Justificativa |
|--------|-----------|--------|--------------|
| Framework | Next.js | 15 (App Router) | SSR/SSG nativo, excelente SEO |
| Linguagem | TypeScript | 5.x | Type safety, DX superior |
| Estilização | Tailwind CSS | 3.x | Velocidade de desenvolvimento |
| Componentes | shadcn/ui | latest | Componentes acessíveis prontos |
| Banco de Dados | Supabase (PostgreSQL) | 15 | Free tier generoso, RLS nativo |
| Auth | Supabase Auth | — | Magic link + OAuth (Google) |
| Storage | Supabase Storage | — | Free tier 1GB, imagens |
| ORM | Drizzle ORM | latest | Type-safe, lightweight |
| Automações | n8n | self-hosted | Scraping, WhatsApp, email |
| Hosting | Vercel | free | Deploy automático via git |
| Pagamentos | Mercado Pago | Fase 2 | PIX nativo, marketplace splits |

### 2.2 Por que Drizzle ORM e não Prisma?

- Drizzle é mais leve e rápido em cold starts (crítico no Vercel free)
- Schema como TypeScript — sem arquivo `.prisma` separado
- Melhor integração com Supabase

---

## 3. Estrutura do Projeto

```
portal-do-esporte/
├── packages/
│   └── web/                          # Aplicação Next.js principal
│       ├── app/                      # App Router
│       │   ├── (public)/             # Rotas públicas (sem auth)
│       │   │   ├── page.tsx          # Home
│       │   │   ├── noticias/         # Portal de notícias
│       │   │   │   ├── page.tsx      # Lista de notícias
│       │   │   │   └── [slug]/       # Notícia individual
│       │   │   ├── eventos/          # Calendário
│       │   │   │   ├── page.tsx      # Calendário de eventos
│       │   │   │   └── [id]/         # Evento individual
│       │   │   ├── atletas/          # Perfis de atletas
│       │   │   │   ├── page.tsx      # Lista de atletas
│       │   │   │   └── [slug]/       # Perfil individual
│       │   │   └── esportes/         # Filtragem por esporte
│       │   ├── (auth)/               # Fluxo de autenticação
│       │   │   ├── login/
│       │   │   └── cadastro/
│       │   ├── (dashboard)/          # Área logada do usuário
│       │   │   ├── meu-perfil/
│       │   │   ├── meus-eventos/
│       │   │   └── cadastrar-evento/
│       │   ├── admin/                # Painel administrativo
│       │   │   ├── layout.tsx        # Guard: somente admin
│       │   │   ├── dashboard/
│       │   │   ├── noticias/         # Aprovação de notícias
│       │   │   ├── eventos/          # Aprovação de eventos
│       │   │   └── atletas/          # Aprovação de perfis
│       │   └── api/                  # API Routes
│       │       ├── auth/             # Callbacks Supabase Auth
│       │       ├── noticias/         # CRUD notícias
│       │       ├── eventos/          # CRUD eventos
│       │       ├── atletas/          # CRUD atletas/clubes
│       │       └── webhook/          # Webhooks n8n → portal
│       ├── components/
│       │   ├── ui/                   # shadcn/ui components
│       │   ├── noticias/             # Componentes de notícias
│       │   ├── eventos/              # Componentes de calendário
│       │   ├── atletas/              # Componentes de perfis
│       │   └── layout/               # Header, Footer, Nav
│       ├── lib/
│       │   ├── supabase/             # Clients (server/browser)
│       │   ├── db/                   # Drizzle schema + queries
│       │   └── utils/                # Helpers
│       └── types/                    # TypeScript types
├── supabase/
│   ├── migrations/                   # Migrations SQL
│   └── seed.sql                      # Dados iniciais
├── docs/
│   ├── prd/
│   └── architecture/
└── packages/ (futuro)
    ├── n8n-workflows/                # Workflows n8n exportados
    └── scripts/                      # Scripts de manutenção
```

---

## 4. Arquitetura de Banco de Dados (Visão Geral)

> Schema detalhado será definido pelo @data-engineer. Esta seção define os domínios e relacionamentos de alto nível.

### 4.1 Domínios de Dados

```
┌──────────────────────────────────────────────────────────┐
│                      DOMÍNIOS                             │
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   USUÁRIOS  │    │   CONTEÚDO  │    │   NEGÓCIO   │  │
│  │             │    │             │    │  (Fase 2/3) │  │
│  │  users      │    │  noticias   │    │  produtos   │  │
│  │  profiles   │    │  eventos    │    │  servicos   │  │
│  │  roles      │    │  atletas    │    │  pedidos    │  │
│  │             │    │  clubes     │    │  ofertas    │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                          │
│  ┌─────────────┐    ┌─────────────┐                     │
│  │  CURADORIA  │    │  SISTEMA    │                     │
│  │             │    │             │                     │
│  │  pendentes  │    │  fontes_rss │                     │
│  │  aprovações │    │  config     │                     │
│  │  logs       │    │  tags       │                     │
│  └─────────────┘    └─────────────┘                     │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Estratégia de RLS (Row Level Security)

| Tabela | Leitura | Escrita |
|--------|---------|---------|
| noticias (status=publicado) | Todos | Admin |
| noticias (status=pendente) | Admin | n8n webhook |
| eventos (status=aprovado) | Todos | Admin |
| eventos (status=pendente) | Admin | Usuário logado |
| atletas (status=aprovado) | Todos | Admin |
| atletas (status=pendente) | Admin | Próprio usuário |
| admin_* | Admin | Admin |

---

## 5. Arquitetura de Autenticação

```
Usuário → Magic Link (email) → Supabase Auth → JWT → Cookie HttpOnly
                                    │
                              Google OAuth
                              (alternativa)

Roles:
  - anon       → Apenas leitura de conteúdo público
  - authenticated → Pode cadastrar eventos/perfis (pendentes)
  - admin      → Acesso total + painel admin
```

**Implementação de roles:** `user_metadata.role` no Supabase Auth + verificação em API routes e RLS.

---

## 6. Arquitetura de Automações (n8n)

### 6.1 Workflow 1 — Scraping de Notícias

```
Trigger: Cron (todo dia 8h, 14h, 20h)
    │
    ▼
Para cada fonte RSS cadastrada:
    │
    ├─ Fetch RSS Feed (HTTP Request)
    │
    ├─ Parse XML → itens
    │
    ├─ Verificar duplicatas (Supabase: busca por URL original)
    │
    ├─ Se novo:
    │   ├─ Criar notícia com status="pendente"
    │   ├─ Salvar URL original + nome da fonte
    │   └─ (opcional) Notificar admin por email
    │
    └─ Log de execução
```

### 6.2 Workflow 2 — Recebimento de Eventos via WhatsApp/Email

```
Trigger: Webhook (WhatsApp via Evolution API / Email via IMAP)
    │
    ▼
Parsear mensagem (LLM ou regex):
    ├─ Nome do evento
    ├─ Data/hora
    ├─ Local
    ├─ Esporte
    └─ Contato organizador
    │
    ▼
Criar evento com status="pendente" no Supabase
    │
    ▼
Notificar admin (email) → "Novo evento para aprovação"
    │
    ▼
Admin acessa painel → aprova/rejeita
    │
    ▼
Se aprovado → status="publicado" → aparece no calendário
```

### 6.3 Hospedagem n8n

**MVP:** n8n rodando localmente (laptop do owner) com [ngrok](https://ngrok.com/) para expor webhooks.
**Fase 1.5:** Migrar para Railway free tier (500h/mês gratuito).

---

## 7. Arquitetura de Conteúdo e SEO

### 7.1 Estratégia de Renderização

| Página | Estratégia | Por quê |
|--------|-----------|---------|
| Home | SSG (revalidate 1h) | SEO + performance |
| Lista de notícias | SSG (revalidate 30min) | SEO crítico |
| Notícia individual | SSG (revalidate on-demand) | SEO + velocidade |
| Calendário | SSR | Dados dinâmicos (hoje/próximos) |
| Perfil de atleta | SSG (revalidate on-demand) | SEO |
| Painel admin | CSR | Não indexado |
| Dashboard usuário | CSR | Não indexado |

### 7.2 SEO Técnico

```typescript
// Exemplo: app/noticias/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const noticia = await getNoticia(params.slug)
  return {
    title: `${noticia.titulo} | Portal do Esporte`,
    description: noticia.resumo,
    openGraph: {
      title: noticia.titulo,
      description: noticia.resumo,
      images: [noticia.imagem_url],
      type: 'article',
    },
    alternates: {
      canonical: `https://portaldoesporte.com.br/noticias/${params.slug}`,
    },
  }
}
```

**Sitemap:** Gerado automaticamente via `app/sitemap.ts` do Next.js.
**Robots.txt:** `app/robots.ts` — bloquear `/admin` e `/dashboard`.

---

## 8. Arquitetura de Storage

| Bucket | Conteúdo | Acesso |
|--------|---------|-------|
| `noticias` | Imagens das notícias | Público |
| `eventos` | Imagens dos eventos | Público |
| `atletas` | Fotos de atletas/clubes | Público |
| `avatars` | Avatares de usuários | Público |
| `produtos` | Fotos de produtos (Fase 2) | Público |

**Política:** Upload somente para usuários autenticados. Leitura pública sem auth.

---

## 9. Arquitetura de API

### 9.1 Endpoints Internos (Next.js API Routes)

```
POST   /api/eventos              → Criar evento (requer auth)
GET    /api/eventos              → Listar eventos públicos
GET    /api/eventos/[id]         → Detalhe do evento

POST   /api/atletas              → Cadastrar perfil (requer auth)
GET    /api/atletas              → Listar atletas públicos

POST   /api/webhook/n8n          → Receber dados do n8n (API key)

POST   /api/admin/eventos/[id]/aprovar  → Aprovar evento (admin)
POST   /api/admin/noticias/[id]/aprovar → Aprovar notícia (admin)
POST   /api/admin/atletas/[id]/aprovar  → Aprovar atleta (admin)
```

### 9.2 Segurança de API

- Rotas `/api/admin/*` → middleware verifica `role === 'admin'`
- Rota `/api/webhook/n8n` → verifica `x-api-key` no header
- Rate limiting: Vercel Edge Middleware (futuro)

---

## 10. Arquitetura de Componentes (Frontend)

### 10.1 Design System

**Biblioteca base:** shadcn/ui + Tailwind CSS
**Fonte:** Inter (Google Fonts)
**Ícones:** Lucide React

### 10.2 Componentes Principais

```
components/
├── layout/
│   ├── Header.tsx          # Nav com categorias de esporte
│   ├── Footer.tsx
│   └── MobileMenu.tsx
├── noticias/
│   ├── NoticiaCard.tsx     # Card de notícia na listagem
│   ├── NoticiaGrid.tsx     # Grid responsivo de notícias
│   └── NoticiaHero.tsx     # Destaque da notícia principal
├── eventos/
│   ├── EventoCard.tsx      # Card de evento
│   ├── CalendarioView.tsx  # Visão de calendário (mensal/lista)
│   └── EventoFiltros.tsx   # Filtros por esporte/cidade/data
├── atletas/
│   ├── AtletaCard.tsx      # Card de atleta/clube
│   └── AtletaPerfil.tsx    # Página completa do perfil
└── ui/                     # shadcn/ui components
```

### 10.3 State Management

**Abordagem:** Server Components do Next.js como padrão. Client Components apenas quando necessário (interatividade, filtros).

**Sem Redux/Zustand no MVP.** Usar `useState` + `useContext` para estado local e SWR para data fetching no cliente.

---

## 11. Ambientes

| Ambiente | URL | Branch | Deploy |
|---------|-----|--------|--------|
| Produção | portaldoesporte.com.br | `main` | Auto (Vercel) |
| Preview | deploy-preview-*.vercel.app | PRs | Auto (Vercel) |
| Local | localhost:3000 | qualquer | `npm run dev` |

---

## 12. Fluxo de Deploy

```
Developer (local)
    │
    ├─ git push → branch feature
    │
    ▼
Vercel Preview Deploy (automático)
    │
    ├─ Preview URL para validação
    │
    ▼
PR → merge → main
    │
    ▼
Vercel Production Deploy (automático)
    │
    ▼
portaldoesporte.com.br
```

---

## 13. Roadmap Técnico por Fase

### Fase 1 — MVP (atual)
- [x] Setup Next.js 15 + TypeScript + Tailwind
- [ ] Configurar Supabase (auth, banco, storage)
- [ ] Schema de banco (delegado ao @data-engineer)
- [ ] Módulo de notícias (lista + detalhe)
- [ ] Módulo de calendário (lista + cadastro)
- [ ] Módulo de atletas (lista + perfil)
- [ ] Painel admin (aprovações)
- [ ] Automações n8n (scraping + eventos via WhatsApp)
- [ ] Deploy Vercel + domínio

### Fase 2 — E-commerce
- [ ] Integração Mercado Pago (marketplace splits)
- [ ] Módulo de produtos (catálogo + checkout)
- [ ] Onboarding de lojistas
- [ ] Dashboard do lojista

### Fase 3 — Serviços
- [ ] Motor de compra coletiva
- [ ] Dashboard do prestador
- [ ] Sistema de vouchers

---

## 14. Riscos Técnicos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Sites de federações bloqueiam scraping | Média | Alto | Usar RSS quando disponível; contatar federações para parceria |
| Limite free tier Vercel (100GB bandwidth) | Baixa | Médio | Otimização de imagens via Supabase CDN |
| n8n local cair | Alta | Médio | Migrar para Railway na Fase 1.5 |
| Spam no cadastro de eventos | Média | Médio | Fluxo de aprovação obrigatório + captcha |

---

## 15. Decisões Adiadas (Para Fases Futuras)

- PWA / App mobile
- CDN dedicado para imagens (Cloudflare R2)
- Full-text search (Algolia / Supabase pg_search)
- Sistema de notificações push
- Analytics (Plausible / Umami — privacy-first)

---

*Arquitetura gerada por Aria (AIOX Architect Agent) — Portal do Esporte v1.0*
