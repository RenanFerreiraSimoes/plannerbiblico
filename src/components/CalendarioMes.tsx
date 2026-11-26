import { Link } from 'react-router-dom'
import { diffDias, hojeISO, somarDias } from '../lib/datas'
import { PLANO } from '../lib/plano'

const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] // semana começa no domingo

interface Props {
  anoMes: string // "2026-03"
  inicioPlano: string
  feitos: Map<number, string>
  notasPorDia: Map<number, number>
  atividade?: Map<string, { caps: number }>
  mostrarMesAno?: boolean
  clicavel?: boolean
}

export default function CalendarioMes({
  anoMes, inicioPlano, feitos, notasPorDia, atividade, mostrarMesAno = true, clicavel = true,
}: Props) {
  const [ano, mes] = anoMes.split('-').map(Number)
  const hoje = hojeISO()

  const deslocamento = new Date(ano, mes - 1, 1).getDay() // 0 = domingo
  const diasNoMes = new Date(ano, mes, 0).getDate()
  const total = Math.ceil((deslocamento + diasNoMes) / 7) * 7

  const celulas = Array.from({ length: total }, (_, i) => {
    const iso = somarDias(`${anoMes}-01`, i - deslocamento)
    return { iso, num: Number(iso.slice(8)), fora: !iso.startsWith(anoMes) }
  })

  const nomeMes = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div>
      {mostrarMesAno && <h3 className="mb-2 text-center font-display text-xl capitalize text-blush-600">{nomeMes}</h3>}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-tinta/50">
        {SEMANA.map((d, i) => <div key={i} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {celulas.map(c => {
          const diaPlano = diffDias(inicioPlano, c.iso) + 1
          const dentroDoPlano = diaPlano >= 1 && diaPlano <= PLANO.length
          const caps = atividade?.get(c.iso)?.caps ?? 0
          const notas = dentroDoPlano ? notasPorDia.get(diaPlano) ?? 0 : 0
          const feito = dentroDoPlano ? feitos.has(diaPlano) : false

          let classe = 'bg-white/50 text-tinta/60'
          if (c.fora) classe = 'invisible'
          else if (feito) classe = 'bg-blush-100 text-blush-600'
          else if (dentroDoPlano && c.iso <= hoje) classe = 'bg-nude/60 text-tinta'
          else if (dentroDoPlano) classe = 'bg-white text-tinta/40'

          const base = `relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition ${classe} ${c.iso === hoje ? 'ring-1 ring-ouro' : ''}`
          const conteudo = (
            <>
              <span>{c.num}</span>
              <span className="flex items-center gap-0.5">
                {feito && <span className="h-1 w-1 rounded-full bg-ouro" />}
                {caps > 0 && !feito && <span className="h-1 w-1 rounded-full bg-blush-400" />}
                {notas > 0 && <span className="h-1 w-1 rounded-full bg-blush-300 ring-1 ring-blush-400" />}
              </span>
            </>
          )

          return c.fora || !clicavel || !dentroDoPlano
            ? <div key={c.iso} className={base}>{conteudo}</div>
            : <Link key={c.iso} to={`/dia/${diaPlano}`} className={`${base} hover:bg-blush-200`}>{conteudo}</Link>
        })}
      </div>
    </div>
  )
}