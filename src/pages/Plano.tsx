import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LIVROS, PLANO, rotulo } from '../lib/plano'
import { useProgresso } from '../lib/useProgresso'

export default function Plano() {
  const { feitos } = useProgresso()
  const navegar = useNavigate()
  const [aba, setAba] = useState<'AT' | 'NT'>('AT')
  const [pular, setPular] = useState('')

  return (
    <div className="space-y-6">
      <h1 className="titulo">Plano de 365 dias</h1>

      <form
        className="card flex gap-3"
        onSubmit={e => {
          e.preventDefault()
          const n = Number(pular)
          if (n >= 1 && n <= 365) navegar(`/dia/${n}`)
        }}
      >
        <input className="campo" type="number" min={1} max={365} placeholder="Ir para o dia…" value={pular} onChange={e => setPular(e.target.value)} />
        <button className="btn">Ir</button>
      </form>

      <div className="flex gap-2">
        {(['AT', 'NT'] as const).map(t => (
          <button key={t} onClick={() => setAba(t)} className={aba === t ? 'btn' : 'btn-suave'}>
            {t === 'AT' ? 'Antigo Testamento' : 'Novo Testamento'}
          </button>
        ))}
      </div>

      {LIVROS.map((l, i) => {
        if (l.testamento !== aba) return null
        const dias = PLANO.filter(d => d.livroIdx === i)
        const lidos = dias.filter(d => feitos.has(d.dia)).length
        return (
          <div key={l.abrev} className="card">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl text-blush-600">{l.nome}</h2>
              <span className="text-xs text-tinta/50">{lidos}/{dias.length} dias</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {dias.map(d => (
                <Link
                  key={d.dia}
                  to={`/dia/${d.dia}`}
                  title={rotulo(d)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    feitos.has(d.dia)
                      ? 'border-ouro bg-ouro/15 text-ouro'
                      : 'border-blush-200 bg-white text-tinta/70 hover:bg-blush-50'
                  }`}
                >
                  Dia {d.dia} · {d.capIni === d.capFim ? d.capIni : `${d.capIni}–${d.capFim}`}
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}