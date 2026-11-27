import { LIVROS, type DiaPlano } from '../lib/plano'
import type { Devocional } from './tipos'
import { GENESIS } from './estudos/genesis'
import { GENESIS_2 } from './estudos/genesis2'
import { EXODO } from './estudos/exodo'
import { EXODO_2 } from './estudos/exodo2'
import { LEVITICO } from './estudos/levitico'
import { LEVITICO_2 } from './estudos/levitico2'
import { NUMEROS } from './estudos/numeros'
import { NUMEROS_2 } from './estudos/numeros2'
import { DEUTERONOMIO } from './estudos/deuteronomio'
import { DEUTERONOMIO_2 } from './estudos/deuteronomio2'

export type { Devocional }

// Quando criarmos Êxodo, Levítico etc., é só importar e juntar aqui:
// const TODOS = { ...GENESIS, ...EXODO }
const TODOS: Record<string, Devocional> = { ...GENESIS, ...GENESIS_2, ...EXODO, ...EXODO_2, ...LEVITICO, ...LEVITICO_2, ...NUMEROS, ...NUMEROS_2, ...DEUTERONOMIO, ...DEUTERONOMIO_2 }

// "Gn 4-6" (vários capítulos) ou "Rt 2" (um capítulo)
export function chavePassagem(d: DiaPlano) {
  const ab = LIVROS[d.livroIdx].abrev
  return d.capIni === d.capFim ? `${ab} ${d.capIni}` : `${ab} ${d.capIni}-${d.capFim}`
}

export function buscarDevocional(d: DiaPlano): Devocional | undefined {
  return TODOS[chavePassagem(d)]
}