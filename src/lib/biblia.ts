export interface Traducao { id: string; nome: string; disponivel: boolean; aviso?: string }

export const TRADUCOES: Traducao[] = [
  { id: 'acf', nome: 'ACF — Almeida Corrigida Fiel', disponivel: true },
  { id: 'nvi', nome: 'NVI — Nova Versão Internacional', disponivel: false, aviso: 'Protegida por direitos autorais (Biblica).' },
  { id: 'ara', nome: 'ARA — Almeida Revista e Atualizada', disponivel: false, aviso: 'Protegida por direitos autorais (SBB).' },
  { id: 'arc', nome: 'ARC — Almeida Revista e Corrigida', disponivel: false, aviso: 'Em breve.' },
  { id: 'naa', nome: 'NAA — Nova Almeida Atualizada', disponivel: false, aviso: 'Protegida por direitos autorais (SBB).' },
  { id: 'ntlh', nome: 'NTLH — Nova Tradução na Linguagem de Hoje', disponivel: false, aviso: 'Protegida por direitos autorais (SBB).' },
  { id: 'a21', nome: 'A21 — Almeida Século 21', disponivel: false, aviso: 'Protegida por direitos autorais.' },
]

export const traducaoEfetiva = (id?: string) =>
  TRADUCOES.find(t => t.id === id && t.disponivel)?.id ?? 'acf'

const cache: Record<string, any[]> = {}

async function carregar(id: string) {
  if (cache[id]) return cache[id]
  const r = await fetch(`/biblia/${id}.json`)
  if (!r.ok) throw new Error('Não foi possível carregar a Bíblia. Verifique a conexão.')
  const txt = (await r.text()).replace(/^\uFEFF/, '')
  cache[id] = JSON.parse(txt)
  return cache[id]
}

export async function textoCapitulo(traducao: string, livroIdx: number, cap: number): Promise<string[]> {
  const b = await carregar(traducao)
  return b[livroIdx].chapters[cap - 1]
}

export async function textoVersiculo(traducao: string, livroIdx: number, cap: number, v: number) {
  return (await textoCapitulo(traducao, livroIdx, cap))[v - 1]
}