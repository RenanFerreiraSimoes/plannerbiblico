export interface Tema {
  id: string
  nome: string
  cor: string // cor da bolinha de pré-visualização
}

export const TEMAS: Tema[] = [
  { id: 'blush', nome: 'Rosé', cor: '#c47d76' },
  { id: 'lavanda', nome: 'Lavanda', cor: '#8b72b8' },
  { id: 'salvia', nome: 'Sálvia', cor: '#5f8c62' },
  { id: 'ceu', nome: 'Céu', cor: '#5586b0' },
  { id: 'cappuccino', nome: 'Cappuccino', cor: '#a8855f' },
]

export const TEMA_PADRAO = 'blush'

export function temaValido(id?: string): string {
  return TEMAS.some(t => t.id === id) ? (id as string) : TEMA_PADRAO
}

// Tema guardado neste aparelho (evita piscar a cor errada ao abrir o app)
export function temaSalvo(): string {
  try { return temaValido(localStorage.getItem('tema') ?? undefined) } catch { return TEMA_PADRAO }
}

export function aplicarTema(id?: string) {
  const tema = temaValido(id)
  document.documentElement.dataset.tema = tema
  try { localStorage.setItem('tema', tema) } catch { /* sem armazenamento: tudo bem */ }
}