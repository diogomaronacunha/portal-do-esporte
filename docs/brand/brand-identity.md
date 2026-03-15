# Identidade Visual — Portal do Esporte

## Arquivo de Referência

PDF completo: `docs/brand/ID Portal do Esporte.pdf`

## Logo

- **URL (WordPress atual):** `http://portaldoesporte.com.br/wp-content/uploads/2022/06/ID-Portal-do-Esporte-300x146.png`
- **Dimensões originais:** 300 × 146 px
- **Alt text:** "portal do esporte logo"
- **Uso no Next.js:** `<Image>` com `width={150} height={73}` (50% scale)

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

- **Site atual:** https://portaldoesporte.com.br/
- **Novo portal:** https://portal-do-esporte-phi.vercel.app/
