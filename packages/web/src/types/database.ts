export type StatusConteudo = 'pendente' | 'publicado' | 'aprovado' | 'rejeitado'

export interface Esporte {
  id: string
  nome: string
  slug: string
  icone_url: string | null
  ativo: boolean
}

export interface Noticia {
  id: string
  titulo: string
  slug: string
  resumo: string | null
  conteudo: string | null
  imagem_url: string | null
  fonte_nome: string
  fonte_url: string
  esporte_id: string | null
  esporte?: Esporte
  autor_id: string | null
  status: StatusConteudo
  publicado_at: string | null
  created_at: string
  updated_at: string
}

export interface Evento {
  id: string
  titulo: string
  slug: string
  descricao: string | null
  imagem_url: string | null
  data_inicio: string
  data_fim: string | null
  hora_inicio: string | null
  hora_fim: string | null
  local_nome: string
  local_endereco: string | null
  local_cidade: string
  local_estado: string
  esporte_id: string | null
  esporte?: Esporte
  organizador_nome: string
  organizador_contato: string | null
  gratuito: boolean
  url_inscricao: string | null
  status: StatusConteudo
  criado_por: string | null
  aprovado_por: string | null
  aprovado_at: string | null
  created_at: string
  updated_at: string
}

export interface Atleta {
  id: string
  nome: string
  slug: string
  foto_url: string | null
  bio: string | null
  esportes: string[]
  cidade: string | null
  estado: string
  clube_nome: string | null
  conquistas: string | null
  instagram_url: string | null
  facebook_url: string | null
  status: StatusConteudo
  criado_por: string | null
  aprovado_por: string | null
  aprovado_at: string | null
  created_at: string
  updated_at: string
}

export interface Clube {
  id: string
  nome: string
  slug: string
  logo_url: string | null
  descricao: string | null
  esporte_id: string | null
  esporte?: Esporte
  cidade: string | null
  estado: string
  fundado_em: number | null
  site_url: string | null
  instagram_url: string | null
  status: StatusConteudo
  criado_por: string | null
  aprovado_por: string | null
  aprovado_at: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  nome: string | null
  avatar_url: string | null
  bio: string | null
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  nome: string
  slug: string
}

// ============================================================
// E-COMMERCE — Fase 2
// ============================================================

export type StatusLojista = 'pendente' | 'aprovado' | 'rejeitado' | 'suspenso'
export type StatusProduto = 'pendente' | 'ativo' | 'rejeitado' | 'inativo'
export type StatusPedido =
  | 'aguardando_pagamento'
  | 'pago'
  | 'em_separacao'
  | 'enviado'
  | 'entregue'
  | 'cancelado'

export interface CategoriaProduto {
  id: string
  nome: string
  slug: string
  icone: string | null
  ativo: boolean
  created_at: string
}

export interface Lojista {
  id: string
  usuario_id: string
  nome_loja: string
  slug: string
  descricao: string | null
  logo_url: string | null
  cidade: string | null
  estado: string
  whatsapp: string | null
  instagram: string | null
  website: string | null
  status: StatusLojista
  aprovado_por: string | null
  aprovado_at: string | null
  created_at: string
  updated_at: string
}

export interface Produto {
  id: string
  lojista_id: string
  categoria_id: string | null
  esporte_id: string | null
  nome: string
  slug: string
  descricao: string | null
  preco: number
  preco_original: number | null
  estoque: number
  imagens: string[]
  tamanhos_disponiveis: string[]
  status: StatusProduto
  aprovado_por: string | null
  aprovado_at: string | null
  created_at: string
  updated_at: string
  lojista?: Pick<Lojista, 'id' | 'nome_loja' | 'slug' | 'whatsapp'>
  categoria?: Pick<CategoriaProduto, 'id' | 'nome' | 'slug'>
  esporte?: Pick<Esporte, 'id' | 'nome' | 'slug'>
}

export interface CarrinhoItemLocal {
  produto: Produto
  quantidade: number
  tamanho: string | null
}

export interface Pedido {
  id: string
  comprador_id: string
  status: StatusPedido
  total: number
  endereco_entrega: Record<string, unknown>
  pagamento_id: string | null
  pagamento_metodo: string | null
  created_at: string
  updated_at: string
  itens?: PedidoItem[]
}

export interface PedidoItem {
  id: string
  pedido_id: string
  produto_id: string | null
  lojista_id: string | null
  nome_produto: string
  preco_unitario: number
  quantidade: number
  tamanho: string | null
  created_at: string
}
