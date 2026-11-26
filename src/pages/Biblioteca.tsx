import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, ChevronRight, Search } from 'lucide-react'
import { LIVROS, PLANO } from '../lib/plano'
import { INTRODUCOES } from '../data/estudos/introducoes'

type Filtro = 'Todos' | 'AT' | 'NT'

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: 'Todos', rotulo: 'Todos' },
  { valor: 'AT', rotulo: 'Antigo Testamento' },
  { valor: 'NT', rotulo: 'Novo Testamento' },
]

function normalizar(t: string) {
  return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function textoCaps(n: number) {
  return `${n} ${n === 1 ? 'capítulo' : 'capítulos'}`
}

export default function Biblioteca() {
  const [params] = useSearchParams()
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('Todos')

  // O livro aberto fica no endereço (/biblioteca?livro=0).
  // Assim o botão "voltar" do celular retorna para a lista de livros.
  const bruto = params.get('livro')
  const aberto = bruto !== null && /^\d+$/.test(bruto) && Number(bruto) < LIVROS.length ? Number(bruto) : null

  useEffect(() => {
    if (aberto !== null) window.scrollTo(0, 0)
  }, [aberto])

  const lista = useMemo(() => {
    const q = normalizar(busca.trim())
    return LIVROS.map((livro, idx) => ({ livro, idx })).filter(({ livro }) => {
      if (filtro !== 'Todos' && livro.testamento !== filtro) return false
      if (!q) return true
      return normalizar(livro.nome).includes(q) || normalizar(livro.abrev).includes(q)
    })
  }, [busca, filtro])

  // ---------- um livro aberto ----------
  if (aberto !== null) {
    const livro = LIVROS[aberto]
    const intro = INTRODUCOES[aberto]
    const primeiroDia = PLANO.find((p) => p.livroIdx === aberto)?.dia

    if (!livro || !intro) {
      return (
        <div className="space-y-5">
          <Link to="/biblioteca" className="inline-flex items-center gap-1 text-sm text-tinta/60 hover:text-blush-600">
            <ArrowLeft size={16} /> Todos os livros
          </Link>
          <p className="card text-tinta/70">Não encontrei a introdução deste livro.</p>
        </div>
      )
    }

    const blocos = [
      { titulo: 'Tema central', texto: intro.tema },
      { titulo: 'Resumo', texto: intro.resumo },
      { titulo: 'Onde vemos Cristo', texto: intro.cristo },
      { titulo: 'Como ler', texto: intro.comoLer },
    ]

    return (
      <div className="space-y-5">
        <Link to="/biblioteca" className="inline-flex items-center gap-1 text-sm text-tinta/60 hover:text-blush-600">
          <ArrowLeft size={16} /> Todos os livros
        </Link>

        <header>
          <p className="text-xs uppercase tracking-widest text-ouro">
            {livro.testamento === 'AT' ? 'Antigo Testamento' : 'Novo Testamento'} · {intro.genero}
          </p>
          <h1 className="titulo">{livro.nome}</h1>
          <p className="text-sm text-tinta/60">{textoCaps(livro.caps)}</p>
        </header>

        <div className="card grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-tinta/50">Autor</p>
            <p className="mt-1 text-tinta/80">{intro.autor}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-tinta/50">Época</p>
            <p className="mt-1 text-tinta/80">{intro.data}</p>
          </div>
        </div>

        {blocos.map((b) => (
          <section key={b.titulo} className="card">
            <h2 className="font-display text-2xl text-blush-600">{b.titulo}</h2>
            <p className="mt-2 leading-relaxed text-tinta/80">{b.texto}</p>
          </section>
        ))}

        <section className="card border border-ouro/40 bg-blush-50">
          <h2 className="font-display text-2xl text-blush-600">Versículo-chave</h2>
          <p className="mt-2 text-lg text-tinta">{intro.chave}</p>
          <p className="mt-1 text-sm text-tinta/60">Procure este trecho na sua leitura e medite nele com calma.</p>
        </section>

        {primeiroDia ? (
          <Link
            to={`/dia/${primeiroDia}`}
            onClick={() => window.scrollTo(0, 0)}
            className="inline-flex items-center gap-2 rounded-full bg-blush-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-blush-600"
          >
            <BookOpen size={16} /> Ler no plano (começa no dia {primeiroDia})
          </Link>
        ) : null}
      </div>
    )
  }

  // ---------- lista de livros ----------
  return (
    <div className="space-y-5">
      <div>
        <h1 className="titulo">Biblioteca de estudos</h1>
        <p className="mt-1 text-sm text-tinta/60">
          Uma introdução a cada livro da Bíblia, para entender o contexto antes de ler.
        </p>
      </div>

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-tinta/40" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar livro (ex.: Salmos, Rm, João)"
          aria-label="Buscar livro"
          className="w-full rounded-full border border-blush-100 bg-white py-3 pl-11 pr-4 text-sm text-tinta outline-none transition focus:border-ouro"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map(({ valor, rotulo }) => (
          <button
            key={valor}
            type="button"
            onClick={() => setFiltro(valor)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              filtro === valor
                ? 'bg-blush-500 font-medium text-white'
                : 'border border-blush-100 bg-white text-tinta/70 hover:bg-blush-50'
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <p className="card text-center text-tinta/60">Nenhum livro encontrado para “{busca}”.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {lista.map(({ livro, idx }) => (
            <Link
              key={livro.abrev}
              to={`/biblioteca?livro=${idx}`}
              className="card flex items-center gap-3 transition hover:bg-blush-50"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl text-blush-600">{livro.nome}</p>
                <p className="text-xs text-tinta/50">
                  {textoCaps(livro.caps)} · {INTRODUCOES[idx]?.genero ?? ''}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-tinta/70">{INTRODUCOES[idx]?.tema ?? ''}</p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-tinta/40" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}