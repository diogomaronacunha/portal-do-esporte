# Identidade Visual — Portal do Esporte

## Arquivo de Referência

PDF completo: `docs/brand/ID Portal do Esporte.pdf`

## Logo

- **Arquivo:** `packages/web/public/logo-portal-do-esporte.png` (servido localmente)
- **Dimensões originais:** 300 × 146 px
- **Alt text:** "Portal do Esporte"
- **Uso no Next.js:** `<Image>` com `width={150} height={73}` (50% scale)
- **Origem:** recuperado do WordPress legado (`wp-content/uploads/2022/06/`), que saiu do ar
  quando o domínio passou a apontar para a Vercel. Não referenciar mais URLs do WordPress.
- **Favicon original preservado:** `packages/web/public/ico-portal.png` (16 × 16, ainda não instalado)

## Paleta de Cores

| Token Tailwind     | Hex       | Uso                                    |
|--------------------|-----------|----------------------------------------|
| `primary-600`      | `#2e7d32` | Verde institucional — cor principal    |
| `primary-700`      | `#276b2b` | Verde escuro — hover states            |
| `accent-500`       | `#d37a15` | Laranja — CTAs de destaque, secundário |
| `accent-600`       | `#b8650f` | Laranja escuro — hover laranja         |

## Aplicação no Projeto

### Tailwind Config (`tailwind.config.ts`)
- `primary.*` → escala verde baseada em `#2e7d32`
- `accent.*` → escala laranja baseada em `#d37a15`

### CSS Globals (`globals.css`)
```css
--color-primary: #2e7d32;
--color-accent:  #d37a15;
```

### Componentes
- **Hero section** → `bg-primary-600` (verde)
- **CTAs principais** → `btn-primary` (verde)
- **CTAs de destaque** → `bg-accent-500` (laranja)
- **Badges esporte** → `badge-green` (verde claro)
- **Data de eventos** → `bg-primary-600` (verde)

## Fonte Tipográfica

- **Família atual:** Inter (Next.js font)
- **Referência:** Ver PDF para tipografia original da marca

## Site de Referência

- **Produção:** https://portaldoesporte.com.br/ — já serve o portal Next.js (Vercel)
- **Preview Vercel:** https://portal-do-esporte-phi.vercel.app/
- **WordPress legado:** fora do ar. Permanece apenas na Hostinger, sem domínio apontado.
