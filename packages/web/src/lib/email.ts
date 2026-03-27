import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'diogomaronacunha@hotmail.com'
const FROM = 'Portal do Esporte <notificacoes@portaldoesporte.com.br>'

type TipoSubmissao = 'evento' | 'atleta' | 'clube' | 'lojista' | 'prestador'

const LABELS: Record<TipoSubmissao, { titulo: string; path: string }> = {
  evento:    { titulo: 'Novo Evento',     path: '/admin/eventos' },
  atleta:    { titulo: 'Novo Atleta',     path: '/admin/atletas' },
  clube:     { titulo: 'Novo Clube',      path: '/admin/clubes' },
  lojista:   { titulo: 'Novo Lojista',    path: '/admin/lojistas' },
  prestador: { titulo: 'Novo Prestador',  path: '/admin/prestadores' },
}

export async function notificarAdmin(tipo: TipoSubmissao, nome: string) {
  if (!process.env.RESEND_API_KEY) return // silencioso se não configurado

  const { titulo, path } = LABELS[tipo]
  const url = `https://portaldoesporte.com.br${path}`

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `[Portal do Esporte] ${titulo} aguardando aprovação`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#2e7d32">${titulo} aguardando aprovação</h2>
        <p><strong>${nome}</strong> foi cadastrado e aguarda sua revisão.</p>
        <a href="${url}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#2e7d32;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Revisar no Admin →
        </a>
        <p style="margin-top:24px;font-size:12px;color:#999">Portal do Esporte — portaldoesporte.com.br</p>
      </div>
    `,
  })
}
