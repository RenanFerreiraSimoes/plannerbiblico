import { somarDias } from '../lib/datas'

interface Ponto { data: string; valor: number }

export default function GraficoLinha({ pontos }: { pontos: Ponto[] }) {
  if (!pontos.length) return null
  const W = 640
  const H = 150
  const PAD = 6
  const max = Math.max(...pontos.map(p => p.valor), 1)

  const pts = pontos.map((p, i) => {
    const x = pontos.length === 1 ? W / 2 : PAD + (i * (W - 2 * PAD)) / (pontos.length - 1)
    const y = H - 24 - (p.valor * (H - 50)) / max
    return { x, y, p }
  })
  const caminho = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Gráfico de capítulos lidos nos últimos 30 dias">
        <path d={caminho} fill="none" stroke="#d99a92" strokeWidth="2" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#c47d76" />)}
      </svg>
      <div className="flex justify-between text-xs text-tinta/50">
        <span>{somarDias(pts[0].p.data, 0).slice(8)}/{pts[0].p.data.slice(5, 7)}</span>
        <span>últimos 30 dias</span>
        <span>{pts[pts.length - 1].p.data.slice(8)}/{pts[pts.length - 1].p.data.slice(5, 7)}</span>
      </div>
    </div>
  )
}