const fs = require('fs');
const path = require('path');

const wfPath = path.join(__dirname, '..', 'n8n-workflows', 'Portal do Esporte \u2014 Scraping de Not\u00edcias RSS.json');
const wf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));

const node = wf.nodes.find(n => n.name.includes('Extrair'));

node.parameters.jsCode = `// Processa TODOS os itens — preserva HTML (links, listas, negrito)
const ALLOWED = new Set(['p','ul','ol','li','strong','b','em','i','h1','h2','h3','h4','h5','h6','blockquote','br','a']);

function sanitizeHtml(chunk) {
  // Remove blocos perigosos incluindo seu conteúdo
  let html = chunk
    .replace(/<script[\\s\\S]*?<\\/script>/gi, '')
    .replace(/<style[\\s\\S]*?<\\/style>/gi, '')
    .replace(/<nav\\b[\\s\\S]*?<\\/nav>/gi, '')
    .replace(/<header\\b[\\s\\S]*?<\\/header>/gi, '')
    .replace(/<footer\\b[\\s\\S]*?<\\/footer>/gi, '')
    .replace(/<aside\\b[\\s\\S]*?<\\/aside>/gi, '')
    .replace(/<iframe[\\s\\S]*?<\\/iframe>/gi, '')
    .replace(/<form[\\s\\S]*?<\\/form>/gi, '')
    .replace(/<!--[\\s\\S]*?-->/g, '');

  // Processa cada tag HTML
  html = html.replace(/<(\\/?)([a-zA-Z][a-zA-Z0-9]*)\\b([^>]*)>/g, (match, slash, tag, attrs) => {
    const t = tag.toLowerCase();
    if (!ALLOWED.has(t)) return ''; // tag não permitida: remove, mantém texto

    if (slash) return \`</\${t}>\`; // tag de fechamento: normaliza

    if (t === 'br') return '<br>';

    if (t === 'a') {
      const hrefM = attrs.match(/href=["']([^"']+)["']/i);
      if (hrefM && /^https?:\\/\\//i.test(hrefM[1])) {
        return \`<a href="\${hrefM[1]}" target="_blank" rel="noopener noreferrer">\`;
      }
      return ''; // sem href válido: remove tag, mantém texto
    }

    return \`<\${t}>\`; // tag estrutural: remove atributos
  });

  // Decodifica entidades HTML comuns
  html = html
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&ccedil;/g, 'ç')
    .replace(/&Ccedil;/g, 'Ç').replace(/&atilde;/g, 'ã').replace(/&otilde;/g, 'õ')
    .replace(/&Atilde;/g, 'Ã').replace(/&Otilde;/g, 'Õ').replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É').replace(/&Iacute;/g, 'Í').replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú').replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
    .replace(/&laquo;/g, '«').replace(/&raquo;/g, '»');

  // Remove espaço excessivo
  html = html.replace(/[ \\t]{3,}/g, ' ').trim();

  return html;
}

function extractFromAnchor(htmlStr, anchorRegex) {
  const m = htmlStr.match(anchorRegex);
  if (!m) return null;
  const start = htmlStr.indexOf(m[0]);
  if (start === -1) return null;
  const chunk = htmlStr.substring(start, start + 30000);

  const sanitized = sanitizeHtml(chunk);
  const textLen = sanitized.replace(/<[^>]+>/g, '').trim().length;
  if (textLen < 100) return null;

  return sanitized;
}

const anchors = [
  /<article[^>]*>/i,
  /<div[^>]+class=["'][^"']*entry-content[^"']*["']/i,
  /<div[^>]+class=["'][^"']*post-content[^"']*["']/i,
  /<div[^>]+class=["'][^"']*td-post-content[^"']*["']/i,
  /<div[^>]+class=["'][^"']*article-body[^"']*["']/i,
  /<div[^>]+class=["'][^"']*materia-conteudo[^"']*["']/i,
  /<div[^>]+class=["'][^"']*conteudo[^"']*["']/i,
  /<div[^>]+class=["'][^"']*content[^"']*["']/i,
  /<main[^>]*>/i,
];

const httpItems = $input.all();
const parsedItems = $('🔍 Parsear XML do RSS').all();
const results = [];

for (let i = 0; i < httpItems.length; i++) {
  const html = httpItems[i].json.data || '';
  const meta = parsedItems[i] ? parsedItems[i].json : {};

  const titulo = meta.titulo || '';
  const fonte_url = meta.fonte_url || '';
  const fonte_nome = meta.fonte_nome || '';
  const resumo = meta.resumo || null;
  const esporte_slug = meta.esporte_slug || '';

  // Extrai imagem: og:image → twitter:image → primeira img grande no corpo
  let imagem_url = meta.imagem_url || null;
  const ogImagePatterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];
  for (const pattern of ogImagePatterns) {
    const m = html.match(pattern);
    if (m && m[1] && m[1].startsWith('http')) {
      imagem_url = m[1];
      break;
    }
  }
  // Fallback: primeira imagem grande no corpo (sites Elementor/sem og:image)
  if (!imagem_url) {
    const bodyImgPatterns = [
      /<img[^>]+class=["'][^"']*(?:attachment-large|size-large|wp-post-image)[^"']*["'][^>]+src=["']([^"']+)["']/i,
      /<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*(?:attachment-large|size-large|wp-post-image)[^"']*["']/i,
      /<img[^>]+width=["']([6-9]\d{2}|[1-9]\d{3})[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp))[^>]*>/i,
    ];
    for (const pat of bodyImgPatterns) {
      const m = html.match(pat);
      const url = m && (m[2] || m[1]);
      if (url && url.startsWith('http') && !url.includes('logo') && !url.includes('icon') && !url.includes('favicon')) {
        imagem_url = url;
        break;
      }
    }
  }

  // Extrai conteúdo preservando HTML
  let conteudo = null;
  for (const anchor of anchors) {
    const extracted = extractFromAnchor(html, anchor);
    if (extracted && extracted.replace(/<[^>]+>/g, '').trim().length > 200) {
      conteudo = extracted;
      break;
    }
  }
  if (!conteudo) {
    // Fallback: extrai parágrafos preservando HTML interno
    const allP = (html.match(/<p[^>]*>[\\s\\S]*?<\\/p>/gi) || [])
      .map(p => sanitizeHtml(p))
      .filter(p => p.replace(/<[^>]+>/g, '').trim().length > 60);
    if (allP.length >= 2) {
      conteudo = allP.slice(0, 30).join('\\n');
    }
  }

  console.log(\`📰 [\${i+1}/\${httpItems.length}] \${titulo} — conteudo: \${conteudo ? conteudo.length + ' chars' : 'não extraído'} | imagem: \${imagem_url ? 'ok' : 'null'}\`);
  results.push({ json: { titulo, fonte_url, fonte_nome, resumo, esporte_slug, conteudo: conteudo || null, imagem_url } });
}

return results;`;

fs.writeFileSync(wfPath, JSON.stringify(wf, null, 2));
console.log('Workflow updated successfully');
console.log('Node code length:', node.parameters.jsCode.length);
