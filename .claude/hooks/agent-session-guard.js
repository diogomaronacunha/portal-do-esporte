#!/usr/bin/env node
/**
 * GUARDIÃO DE TOKENS — Agentes Duplicados
 * Intercepta tool Skill e bloqueia reativação de agente já ativo na sessão.
 *
 * Estado salvo em: .claude/hooks/.session-agents.json
 * O arquivo é limpo quando tem mais de 4 horas (nova sessão).
 */

const fs   = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '.session-agents.json');
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 horas

function loadState() {
  try {
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    // Limpa estado se sessão expirou
    if (Date.now() - raw.startedAt > SESSION_TTL_MS) {
      return { startedAt: Date.now(), agents: [] };
    }
    return raw;
  } catch (e) {
    return { startedAt: Date.now(), agents: [] };
  }
}

function saveState(state) {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); }
  catch (e) { /* silencioso */ }
}

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data  = JSON.parse(input);
    const skill = data.tool_input?.skill || '';

    if (!skill) { process.exit(0); }

    const state = loadState();

    if (state.agents.includes(skill)) {
      // Agente já ativo — bloqueia reativação
      const output = {
        decision: 'block',
        reason:
          `🛑 GUARDIÃO DE TOKENS: agente "${skill}" já foi ativado nesta sessão.\n` +
          `Reativar o mesmo agente desperdiça ~3.000-5.000 tokens.\n` +
          `O agente continua ativo — apenas continue enviando comandos normalmente.`
      };
      process.stdout.write(JSON.stringify(output));
      process.exit(0);
    }

    // Registra nova ativação e permite
    state.agents.push(skill);
    saveState(state);
    process.exit(0);

  } catch (e) {
    process.exit(0);
  }
});
