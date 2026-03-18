const fs = require('fs');
const path = require('path');

const wfPath = path.join(__dirname, '..', 'n8n-workflows', 'Portal do Esporte \u2014 Scraping de Not\u00edcias RSS.json');
const wf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));

// ─── 1. Parsear XML — adiciona content:encoded ───────────────────────────────
const parsearNode = wf.nodes.find(n => n.name.includes('Parsear XML'));

// Substituir apenas a linha de montagem do item RSS para incluir conteudo_rss
parsearNode.parameters.jsCode = parsearNode.parameters.jsCode.replace(
  `      const imgMatch = descricao.match(/<img[^>]+src=["']([^"']+)["']/i);
      const imagem_url = imgMatch ? imgMatch[1] : null;
      const resumo = decodeEntities(descricao.replace(/<[^>]+>/g, '').trim().substring(0, 300)) || null;
      if (titulo && fonte_url) items.push({ titulo, fonte_url, fonte_nome, resumo, imagem_url, esporte_slug });`,
  `      const imgMatch = descricao.match(/<img[^>]+src=["']([^"']+)["']/i);
      const imagem_url = imgMatch ? imgMatch[1] : null;
      const resumo = decodeEntities(descricao.replace(/<[^>]+>/g, '').trim().substring(0, 300)) || null;
      const conteudo_rss = extract(item, 'content:encoded') || null;
      if (titulo && fonte_url) items.push({ titulo, fonte_url, fonte_nome, resumo, imagem_url, esporte_slug, conteudo_rss });`
);

console.log('Parsear XML updated:', parsearNode.parameters.jsCode.includes('conteudo_rss'));

// ─── 2. Extrair conteúdo — usa content:encoded quando disponível ──────────────
const extrairNode = wf.nodes.find(n => n.name.includes('Extrair'));

extrairNode.parameters.jsCode = `// Processa TODOS os itens — preserva HTML (links, listas, negrito)
// Usa content:encoded do RSS quando disponível (mais limpo que parsear HTML completo)
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
    if (!ALLOWED.has(t)) return '';

    if (slash) return \`</\${t}>\`;
    if (t === 'br') return '<br>';

    if (t === 'a') {
      const hrefM = attrs.match(/href=["']([^"']+)["']/i);
      if (hrefM && /^https?:\\/\\//i.test(hrefM[1])) {
        return \`<a href="\${hrefM[1]}" target="_blank" rel="noopener noreferrer">\`;
      }
      return '';
    }

    return \`<\${t}>\`;
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
  const conteudo_rss = meta.conteudo_rss || null;

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
  // Fallback: primeira imagem grande no corpo (sites sem og:image como Elementor)
  if (!imagem_url) {
    const bodyImgPatterns = [
      /<img[^>]+class=["'][^"']*(?:attachment-large|size-large|wp-post-image)[^"']*["'][^>]+src=["']([^"']+)["']/i,
      /<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*(?:attachment-large|size-large|wp-post-image)[^"']*["']/i,
      /<img[^>]+width=["']([6-9]\\d{2}|[1-9]\\d{3})["'][^>]+src=["']([^"']+\\.(?:jpg|jpeg|png|webp))["']/i,
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

  // Extrai conteúdo
  let conteudo = null;

  // 1ª opção: content:encoded do RSS (já limpo, sem sidebar/footer)
  if (conteudo_rss && conteudo_rss.trim().length > 100) {
    conteudo = sanitizeHtml(conteudo_rss);
    console.log(\`✅ [\${i+1}] \${titulo.substring(0,40)} — usando content:encoded (\${conteudo.length} chars)\`);
  }

  // 2ª opção: parsear HTML da página completa por âncora de conteúdo
  if (!conteudo) {
    for (const anchor of anchors) {
      const extracted = extractFromAnchor(html, anchor);
      if (extracted && extracted.replace(/<[^>]+>/g, '').trim().length > 200) {
        conteudo = extracted;
        console.log(\`🔍 [\${i+1}] \${titulo.substring(0,40)} — extraído por âncora (\${conteudo.length} chars)\`);
        break;
      }
    }
  }

  // 3ª opção: fallback parágrafos
  if (!conteudo) {
    const allP = (html.match(/<p[^>]*>[\\s\\S]*?<\\/p>/gi) || [])
      .map(p => sanitizeHtml(p))
      .filter(p => p.replace(/<[^>]+>/g, '').trim().length > 60);
    if (allP.length >= 2) {
      conteudo = allP.slice(0, 30).join('\\n');
      console.log(\`⚠️ [\${i+1}] \${titulo.substring(0,40)} — fallback parágrafos\`);
    }
  }

  if (!conteudo) console.log(\`❌ [\${i+1}] \${titulo.substring(0,40)} — sem conteúdo\`);

  results.push({ json: { titulo, fonte_url, fonte_nome, resumo, esporte_slug, conteudo: conteudo || null, imagem_url } });
}

return results;`;

console.log('Extrair conteúdo updated:', extrairNode.parameters.jsCode.includes('content:encoded'));

fs.writeFileSync(wfPath, JSON.stringify(wf, null, 2));
console.log('Workflow saved successfully');
