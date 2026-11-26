import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CalendarioMes from '../components/CalendarioMes'
import { useAuth } from '../lib/AuthContext'
import { useProgresso } from '../lib/useProgresso'
import { useColecao } from '../lib/useColecao'
import { hojeISO } from '../lib/datas'

export default function Calendario() {
  const { perfil } = useAuth()
  const { feitos } = useProgresso()
  const notas = useColecao<{ dia?: number; texto?: string }>('notas')
  const [anoMes, setAnoMes] = useState(hojeISO().slice(0, 7))

  const notasPorDia = useMemo(() => {
    const m = new Map<number, number>()
    for (const n of notas.itens ?? []) {
      if (n.dia && n.texto?.trim()) m.set(n.dia, (m.get(n.dia) ?? 0) + 1)
    }
    return m
  }, [notas.itens])

  function mudar(delta: number) {
    const [a, m] = anoMes.split('-').map(Number)
    const d = new Date(a, m - 1 + delta, 1)
    setAnoMes(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  return (
    <div className="space-y-6">
      <h1 className="titulo">Calendário espiritual</h1>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <button className="btn-suave !px-3" onClick={() => mudar(-1)} aria-label="Mês anterior"><ChevronLeft size={16} /></button>
          <h2 className="font-display text-2xl capitalize text-blush-600">
            {new Date(Number(anoMes.slice(0, 4)), Number(anoMes.slice(5)) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <button className="btn-suave !px-3" onClick={() => mudar(1)} aria-label="Próximo mês"><ChevronRight size={16} /></button>
        </div>

        <CalendarioMes anoMes={anoMes} inicioPlano={perfil!.inicio} feitos={feitos} notasPorDia={notasPorDia} mostrarMesAno={false} />

        <div className="flex flex-wrap gap-3 text-xs text-tinta/60">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-ouro" /> Concluído</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blush-300 ring-1 ring-blush-400" /> Com anotação</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blush-400" /> Leitura feita na data</span>
        </div>
        <p className="text-xs text-tinta/50">Toque em um dia do plano para abrir o devocional correspondente.</p>
      </div>
    </div>
  )
}