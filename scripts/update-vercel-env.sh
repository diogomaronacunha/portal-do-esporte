#!/usr/bin/env bash
# Atualiza as variáveis de ambiente do Supabase no Vercel
# Uso: bash scripts/update-vercel-env.sh
#
# Pré-requisito: npx vercel login (autenticado)

set -e

echo "📦 Atualização de variáveis Supabase no Vercel"
echo ""
echo "Informe as novas credenciais do projeto Supabase:"
echo ""

read -rp "NEXT_PUBLIC_SUPABASE_URL: " SUPABASE_URL
read -rp "NEXT_PUBLIC_SUPABASE_ANON_KEY: " ANON_KEY
read -rp "SUPABASE_SERVICE_ROLE_KEY: " SERVICE_KEY

echo ""
echo "📝 Atualizando variáveis em production + preview + development..."

for ENV in production preview development; do
  echo "  → $ENV"

  echo "$SUPABASE_URL" | npx vercel env rm NEXT_PUBLIC_SUPABASE_URL "$ENV" --yes 2>/dev/null || true
  echo "$SUPABASE_URL" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL "$ENV" <<< "$SUPABASE_URL"

  echo "$ANON_KEY" | npx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY "$ENV" --yes 2>/dev/null || true
  echo "$ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "$ENV" <<< "$ANON_KEY"

  echo "$SERVICE_KEY" | npx vercel env rm SUPABASE_SERVICE_ROLE_KEY "$ENV" --yes 2>/dev/null || true
  echo "$SERVICE_KEY" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY "$ENV" <<< "$SERVICE_KEY"
done

echo ""
echo "✅ Variáveis atualizadas!"
echo ""
echo "⚡ Agora faça um redeploy para aplicar:"
echo "   npx vercel --prod"
echo ""
echo "📋 Não esqueça de atualizar o .env.local também:"
echo "   NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY"
echo "   SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY"
