import { PLANO, LIVROS, TOTAL_CAPS, qtdCaps } from './plano'
import { somarDias, hojeISO } from './datas'

export interface Sequencias { atual: number; maior: number }

export function sequencias(feitos: Map<number, string>): Sequencias {
  const datas = [...new Set(feitos.values())].sort()
  const set = new Set(datas)
  const hoje = hojeISO()

  let maior = 0
  if (datas.length) {
    let corrida = 1
    for (let i = 1; i < datas.length; i++) {
      corrida = somarDias(datas[i - 1], 1) === datas[i] ? corrida + 1 : 1
      maior = Math.max(maior, corrida)
    }
    maior = Math.max(maior, 1)
  }

  let d = hoje
  if (!set.has(d)) d = somarDias(d, -1)
  let atual = 0
  while (set.has(d)) { atual++; d = somarDias(d, -1) }

  return { atual, maior }
}

export const capsLidosDe = (feitos: Map<number, string>) =>
  [...feitos.keys()].reduce((s, d) => s + qtdCaps(PLANO[d - 1]), 0)

export const pctLido = (feitos: Map<number, string>) =>
  Math.round((capsLidosDe(feitos) / TOTAL_CAPS) * 100)

export function livrosConcluidos(feitos: Map<number, string>) {
  const lidos: { nome: string; caps: number }[] = []
  LIVROS.forEach((l, i) => {
    const caps = new Set<number>()
    for (const d of feitos.keys()) {
      const p = PLANO[d - 1]
      if (p.livroIdx === i) for (let c = p.capIni; c <= p.capFim; c++) caps.add(c)
    }
    if (caps.size === l.caps) lidos.push({ nome: l.nome, caps: l.caps })
  })
  return lidos
}

export function atividadeMensal(feitos: Map<number, string>) {
  const mapa = new Map<string, { dias: number; caps: number }>()
  for (const [dia, data] of feitos) {
    const chave = data.slice(0, 7) // "2026-03"
    const atual = mapa.get(chave) ?? { dias: 0, caps: 0 }
    atual.dias++
    atual.caps += qtdCaps(PLANO[dia - 1])
    mapa.set(chave, atual)
  }
  return [...mapa.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([chave, v]) => ({ chave, ...v }))
}

export function atividadePorData(feitos: Map<number, string>) {
  const mapa = new Map<string, { caps: number }>()
  for (const [dia, data] of feitos) {
    const atual = mapa.get(data) ?? { caps: 0 }
    atual.caps += qtdCaps(PLANO[dia - 1])
    mapa.set(data, atual)
  }
  return mapa
}