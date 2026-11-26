export interface Devocional {
  tema: string
  contextoHistorico: string
  contextoBiblico: string
  explicacao: string[]
  ensinamentos: string[]
  aplicacao: string
  reflexao: string
  perguntas: string[]
  vivendo: string
  oracao: string
  revisadoPor?: string // ex.: 'Pastor Fulano'. Se um dia ela quiser revisão, é só preencher
}