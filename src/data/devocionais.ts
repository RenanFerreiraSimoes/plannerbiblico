import { LIVROS, type DiaPlano } from '../lib/plano'
import type { Devocional } from './tipos'
import { GENESIS } from './estudos/genesis'
import { GENESIS_2 } from './estudos/genesis2'

export type { Devocional }

// Quando criarmos Êxodo, Levítico etc., é só importar e juntar aqui:
// const TODOS = { ...GENESIS, ...EXODO }
const TODOS: Record<string, Devocional> = { ...GENESIS, ...GENESIS_2 }

// "Gn 4-6" (vários capítulos) ou "Rt 2" (um capítulo)
export function chavePassagem(d: DiaPlano) {
  const ab = LIVROS[d.livroIdx].abrev
  return d.capIni === d.capFim ? `${ab} ${d.capIni}` : `${ab} ${d.capIni}-${d.capFim}`
}

export function buscarDevocional(d: DiaPlano): Devocional | undefined {
  return TODOS[chavePassagem(d)]
}