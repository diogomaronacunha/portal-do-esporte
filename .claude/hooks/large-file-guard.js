#!/usr/bin/env node
/**
 * GUARDIÃO DE TOKENS — Arquivos Grandes
 * Intercepta tool Read e avisa/bloqueia leitura de arquivos grandes.
 *
 * Limites:
 *   > 100 KB  → aviso no stderr (permite mas alerta)
 *   > 400 KB  → bloqueia e sugere alternativa
 */

const fs = require('fs');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data      = JSON.parse(input);
    const filePath  = data.tool_input?.file_path || '';
    const hasOffset = data.tool_input?.offset != null;
    const hasLimit  = data.tool_input?.limit  != null;

    if (!filePath) { process.exit(0); }

    // Imagens e binários — sempre liberar (Read os exibe visualmente, offset/limit não se aplica)
    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp'];
    const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
    if (imageExts.includes(ext)) { process.exit(0); }

    let stats;
    try { stats = fs.statSync(filePath); }
    catch (e) { process.exit(0); } // arquivo não existe — deixa passar

    const sizeKB = stats.size / 1024;

    if (sizeKB > 400 && !hasOffset && !hasLimit) {
      // BLOQUEIA — arquivo muito grande sem parâmetros de limite
      const output = {
        decision: 'block',
        reason:
          `🛑 GUARDIÃO DE TOKENS: arquivo grande (${sizeKB.toFixed(0)} KB) sem offset/limit.\n` +
          `Alternativas para economizar tokens:\n` +
          `  • Grep para buscar conteúdo específico\n` +
          `  • Read com offset + limit para ler apenas as linhas necessárias\n` +
          `  • Glob para localizar o arquivo e confirmar o caminho\n` +
          `Se realmente precisar ler completo, adicione: limit: 200`
      };
      process.stdout.write(JSON.stringify(output));
      process.exit(0);
    }

    if (sizeKB > 100 && !hasOffset && !hasLimit) {
      // AVISA — arquivo médio, permite mas alerta
      process.stderr.write(
        `⚠️  GUARDIÃO DE TOKENS: lendo arquivo de ${sizeKB.toFixed(0)} KB completo. ` +
        `Considere usar Grep ou Read com offset/limit para economizar tokens.\n`
      );
      process.exit(0);
    }

    // Permite normalmente
    process.exit(0);

  } catch (e) {
    process.exit(0); // em caso de erro, não bloqueia
  }
});
