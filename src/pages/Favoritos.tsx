import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Trash2 } from 'lucide-react'
import { useColecao, ms } from '../lib/useColecao'
import { PLANO, LIVROS } from '../lib/plano'

interface Favorito {
  tipo: 'versiculo' | 'capitulo' | 'dia'
  ref: string
  rotulo: string
  trecho?: string
  comentario?: string
  cor?: string
  traducao?: string
  criadoEm?: unknown
}

const CORES: Record<string, string> = {
  rosa: '#f9dde2', ouro: '#f3e5c3', verde: '#dcead8', azul: '#dbe4f2',
}

const TIPOS = [['', 'Todos'], ['versiculo', 'Versículos'], ['capitulo', 'Capítulos'], ['dia', 'Devocionais']] as const

export default function Favoritos() {
  const { itens, excluir } = useColecao<Favorito>('favoritos')
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState('')

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return (itens ?? [])
      .filter(f => !tipo || f.tipo === tipo)
      .filter(f => !q || `${f.rotulo} ${f.trecho ?? ''} ${f.comentario ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => ms(b.criadoEm) - ms(a.criadoEm))
  }, [itens, busca, tipo])

  const destino = (f: Favorito) => {
    if (f.tipo === 'dia') return `/dia/${f.ref.split(' ')[1]}`
    // f.ref vem como "Gn 1" ou "Gn 1:1"; o capítulo basta para encontrar o dia
    const cap = Number(f.ref.split(' ')[1].split(':')[0])
    // procura o primeiro dia do plano que cobre esse capítulo desse livro
    // (o ref usa a abreviação, então localizamos o índice do livro)
    const ab = f.ref.split(' ')[0]
    return `/dia/${diaDoLivro(ab, cap)}`
  }

  return (
    <div className="space-y-6">
      <h1 className="titulo">Meus favoritos</h1>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tinta/40" />
        <input className="campo pl-11" placeholder="Pesquisar nos favoritos…" value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {TIPOS.map(([id, nome]) => (
          <button key={id} onClick={() => setTipo(id)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${tipo === id ? 'border-blush-500 bg-blush-500 text-white' : 'border-blush-200 bg-white text-tinta/70 hover:bg-blush-50'}`}>
            {nome}
          </button>
        ))}
      </div>

      {itens === null && <p className="text-tinta/50">Carregando…</p>}
      {itens !== null && lista.length === 0 && (
        <div className="card text-center text-tinta/70">
          Toque em um versículo ou no botão "Favoritar este devocional" para guardar aqui.
        </div>
      )}

      {lista.map(f => (
        <article key={f.id} className="card space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="rounded-full bg-blush-100 px-3 py-1 text-xs text-blush-600">{f.rotulo}</span>
              {f.traducao && <span className="ml-2 text-xs text-tinta/50">{f.traducao.toUpperCase()}</span>}
            </div>
            <button className="text-tinta/40 hover:text-red-400" aria-label="Remover"
              onClick={() => confirm('Remover dos favoritos?') && excluir(f.id)}>
              <Trash2 size={16} />
            </button>
          </div>
          {f.trecho && (
            <p className="rounded-xl px-3 py-2 italic" style={{ backgroundColor: CORES[f.cor ?? ''] ?? 'transparent' }}>
              “{f.trecho}”
            </p>
          )}
          {f.comentario && <p className="text-sm text-tinta/70">✎ {f.comentario}</p>}
          <Link to={destino(f)} className="inline-block text-xs text-ouro underline">Abrir leitura</Link>
        </article>
      ))}
    </div>
  )
}

// encontra o primeiro dia do plano que cobre livro/capítulo
function diaDoLivro(abrev: string, cap: number) {
  const idx = LIVROS.findIndex(l => l.abrev === abrev)
  const dia = PLANO.find(d => d.livroIdx === idx && cap >= d.capIni && cap <= d.capFim)
  return dia?.dia ?? 1
}