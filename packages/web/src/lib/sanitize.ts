import sanitizeHtml from 'sanitize-html'

// Sanitiza HTML de notícias agregadas (scraping de fontes externas via n8n).
// Aplicado na entrada (webhook) e na renderização — conteúdo antigo no banco
// passou pelo pipeline sem sanitização.
export function sanitizeNoticiaHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'br',
      'h2', 'h3', 'h4', 'blockquote', 'img', 'figure', 'figcaption',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
  })
}
